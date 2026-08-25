/**
 * Anudan State Service
 * 
 * Owns in-memory remainingAmount + mutex + SSE broadcaster for concurrency-safe Anudan payments.
 * Assumption: Single campaign (DEFAULT_CAMPAIGN_ID) - if multiple campaigns are needed, extend to Map<campaignId, State>.
 */

import { Mutex, withTimeout } from 'async-mutex';
import { Response } from 'express';
import { ANUDAN_CONFIG } from '../config/anudan.config';
import { AnudanRepository } from '../repositories/AnudanRepository';

interface CampaignState {
  remainingAmount: number;
  mutex: Mutex;
  subscribers: Map<string, Response>;
}

class AnudanStateService {
  private state: Map<string, CampaignState>;
  private anudanRepository: AnudanRepository;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.state = new Map();
    this.anudanRepository = new AnudanRepository();
  }

  /**
   * Initialize state from MongoDB on server boot
   * This ensures the in-memory value is always in sync with the source of truth (MongoDB)
   */
  async initialize(): Promise<void> {
    try {
      const startTime = Date.now();
      console.log('[AnudanStateService] Starting initialization...');

      const collectedAmounts = await this.anudanRepository.getCollectedAmountsByCategory();

      // Initialize state for each category
      Object.entries(ANUDAN_CONFIG.TOTAL_COSTS).forEach(([category, totalCost]) => {
        const collected = collectedAmounts[category] || 0;
        const remaining = Math.max(0, totalCost - collected);

        this.state.set(category, {
          remainingAmount: remaining,
          mutex: new Mutex(),
          subscribers: new Map(),
        });

        console.log(`Anudan state initialized for ${category}: remaining = ₹${remaining}`);
      });

      // Start SSE heartbeat
      this.startHeartbeat();

      this.isInitialized = true;
      const duration = Date.now() - startTime;
      console.log(`[AnudanStateService] Initialization completed in ${duration}ms`);
    } catch (error) {
      console.error('Failed to initialize Anudan state:', error);
      throw error;
    }
  }

  /**
   * Check if state service is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get remaining amount for a campaign (synchronous, no I/O)
   * This is the only way to read the in-memory value - never read-modify-write directly
   */
  getRemaining(campaignId: string): number {
    const campaignState = this.state.get(campaignId);
    if (!campaignState) {
      console.warn(`Campaign ${campaignId} not found in state`);
      return 0;
    }
    return campaignState.remainingAmount;
  }

  /**
   * Try to reserve an amount for a campaign
   * Acquires mutex, checks if amount <= remaining, if ok decrements and returns new value
   * Always releases mutex before returning
   */
  async tryReserve(campaignId: string, amount: number): Promise<{ ok: true; remaining: number } | { ok: false; remaining: number }> {
    const campaignState = this.state.get(campaignId);
    if (!campaignState) {
      console.error(`Campaign ${campaignId} not found in state`);
      return { ok: false, remaining: 0 };
    }

    // Acquire mutex with timeout to prevent deadlocks (5 second timeout)
    const timedMutex = withTimeout(campaignState.mutex, 5000);
    let release: (() => void) | null = null;
    
    try {
      release = await timedMutex.acquire();
    } catch (error) {
      console.error(`Failed to acquire mutex for campaign ${campaignId}:`, error);
      return { ok: false, remaining: campaignState.remainingAmount };
    }

    try {
      // CRITICAL SECTION: Check and decrement atomically
      if (amount > campaignState.remainingAmount) {
        // Insufficient remaining amount - do not decrement
        return { ok: false, remaining: campaignState.remainingAmount };
      }

      // Sufficient amount - decrement and return new value
      campaignState.remainingAmount -= amount;
      return { ok: true, remaining: campaignState.remainingAmount };
    } finally {
      // ALWAYS release mutex, even on error
      if (release) {
        release();
      }
    }
  }

  /**
   * Rollback a reservation (add amount back to remaining)
   * Used when DB write fails after successful reservation to prevent drift
   */
  async rollback(campaignId: string, amount: number): Promise<void> {
    const campaignState = this.state.get(campaignId);
    if (!campaignState) {
      console.error(`Campaign ${campaignId} not found in state for rollback`);
      return;
    }

    const timedMutex = withTimeout(campaignState.mutex, 5000);
    let release: (() => void) | null = null;
    
    try {
      release = await timedMutex.acquire();
    } catch (error) {
      console.error(`Failed to acquire mutex for campaign ${campaignId} rollback:`, error);
      return;
    }

    try {
      // Add amount back to remaining
      campaignState.remainingAmount += amount;
      console.log(`Rolled back ₹${amount} for campaign ${campaignId}, new remaining: ₹${campaignState.remainingAmount}`);
    } finally {
      if (release) {
        release();
      }
    }
  }

  /**
   * Broadcast remaining amount update to all SSE subscribers of a campaign
   * Must be called after successful DB update and before mutex release
   */
  broadcast(campaignId: string, remainingAmount: number): void {
    const campaignState = this.state.get(campaignId);
    if (!campaignState) {
      console.warn(`Campaign ${campaignId} not found for broadcast`);
      return;
    }

    const data = JSON.stringify({ remainingAmount });
    const message = `event: remaining-update\ndata: ${data}\n\n`;

    // Send to all subscribers
    campaignState.subscribers.forEach((response, subscriberId) => {
      try {
        response.write(message);
      } catch (error) {
        console.error(`Failed to send SSE message to subscriber ${subscriberId}:`, error);
        // Remove failed subscriber
        this.removeSubscriber(campaignId, subscriberId);
      }
    });

    console.log(`Broadcasted remaining amount ₹${remainingAmount} to ${campaignState.subscribers.size} subscribers for ${campaignId}`);
  }

  /**
   * Add an SSE subscriber to a campaign
   */
  addSubscriber(campaignId: string, subscriberId: string, response: Response): void {
    const campaignState = this.state.get(campaignId);
    if (!campaignState) {
      console.error(`Campaign ${campaignId} not found for subscriber`);
      return;
    }

    campaignState.subscribers.set(subscriberId, response);
    console.log(`Added subscriber ${subscriberId} to campaign ${campaignId}, total subscribers: ${campaignState.subscribers.size}`);

    // Send initial state
    const initialData = JSON.stringify({ remainingAmount: campaignState.remainingAmount });
    response.write(`event: remaining-update\ndata: ${initialData}\n\n`);
  }

  /**
   * Remove an SSE subscriber from a campaign
   * Called on disconnect to prevent memory leaks
   */
  removeSubscriber(campaignId: string, subscriberId: string): void {
    const campaignState = this.state.get(campaignId);
    if (!campaignState) {
      return;
    }

    campaignState.subscribers.delete(subscriberId);
    console.log(`Removed subscriber ${subscriberId} from campaign ${campaignId}, remaining subscribers: ${campaignState.subscribers.size}`);
  }

  /**
   * Start SSE heartbeat to keep connections alive through proxies
   * Sends a comment every 25 seconds
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.state.forEach((campaignState, campaignId) => {
        const heartbeat = `: heartbeat\n\n`;
        campaignState.subscribers.forEach((response, subscriberId) => {
          try {
            response.write(heartbeat);
          } catch (error) {
            console.error(`Failed to send heartbeat to subscriber ${subscriberId}:`, error);
            this.removeSubscriber(campaignId, subscriberId);
          }
        });
      });
    }, ANUDAN_CONFIG.SSE_HEARTBEAT_INTERVAL_MS);
  }

  /**
   * Stop heartbeat (for graceful shutdown)
   */
  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Singleton instance
export const anudanStateService = new AnudanStateService();
