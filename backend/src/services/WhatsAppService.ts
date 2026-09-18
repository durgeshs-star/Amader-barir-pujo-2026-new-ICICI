/**
 * WhatsApp Cloud API Service
 * 
 * Handles communication with Meta's WhatsApp Cloud API for sending
 * template messages and document messages.
 */

import axios, { AxiosInstance } from 'axios';

/**
 * Bhog booking confirmation template parameters
 */
export interface BhogBookingConfirmationParams {
  customerName: string;
  day: string;
  date: string;
  numberOfBhog: string;
  type: string;
  bhogTiming: string;
  whatsappNumber: string;
}

/**
 * Anudan contribution confirmation template parameters
 */
export interface AnudanConfirmationParams {
  customerName: string;
  categories: Array<{ day: string; amount: number }>;
  totalAmount: string;
  whatsappNumber: string;
}

/**
 * WhatsApp Service class
 */
export class WhatsAppService {
  private axiosInstance: AxiosInstance;
  private phoneNumberId: string;
  private accessToken: string;
  private apiVersion: string;
  private templateName: string;
  private templateLanguage: string;

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION || 'v25.0';
    this.templateName = process.env.WHATSAPP_TEMPLATE_NAME || '';
    this.templateLanguage = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_IN';

    if (!this.phoneNumberId) {
      console.warn('[WhatsAppService] WHATSAPP_PHONE_NUMBER_ID not configured');
    }
    if (!this.accessToken) {
      console.warn('[WhatsAppService] WHATSAPP_ACCESS_TOKEN not configured');
    }
    if (!this.templateName) {
      console.warn('[WhatsAppService] WHATSAPP_TEMPLATE_NAME not configured');
    }

    this.axiosInstance = axios.create({
      baseURL: `https://graph.facebook.com/${this.apiVersion}`,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout to prevent hanging
    });

    // Validate required configuration at startup
    if (process.env.NODE_ENV === 'production') {
      if (!this.phoneNumberId || !this.accessToken || !this.templateName) {
        console.error('[WhatsAppService] CRITICAL: WhatsApp Cloud API is not properly configured for production. Messages will fail.');
        console.error('[WhatsAppService] Required: WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, WHATSAPP_TEMPLATE_NAME');
      }
    }
  }

  /**
   * Normalize Indian WhatsApp phone number to Meta format
   * Accepts: 9325258212, +919325258212, 919325258212, +91 93252 58212
   * Returns: 919325258212
   */
  normalizePhoneNumber(phone: string): string {
    if (!phone) {
      throw new Error('Phone number is required');
    }

    // Remove all non-digit characters
    let normalized = phone.replace(/\D/g, '');

    // If number starts with 91 and has 12 digits, it's already in correct format
    if (normalized.startsWith('91') && normalized.length === 12) {
      return normalized;
    }

    // If number has 10 digits (without country code), prepend 91
    if (normalized.length === 10) {
      return `91${normalized}`;
    }

    // If number starts with 91 but has wrong length, it's invalid
    if (normalized.startsWith('91')) {
      throw new Error(`Invalid phone number format: ${phone}`);
    }

    // If number is 12 digits but doesn't start with 91, it's invalid
    if (normalized.length === 12) {
      throw new Error(`Invalid phone number format (must start with 91 for India): ${phone}`);
    }

    throw new Error(`Invalid phone number: ${phone}`);
  }

  /**
   * Send a template message to a WhatsApp number
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string = 'en',
    components?: any[]
  ): Promise<any> {
    let normalizedPhone: string | undefined;
    try {
      normalizedPhone = this.normalizePhoneNumber(to);

      const payload = {
        messaging_product: 'whatsapp',
        to: normalizedPhone,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components: components || [],
        },
      };

      console.log(`[WhatsAppService] Sending template "${templateName}" to ${normalizedPhone}`);
      const response = await this.axiosInstance.post(
        `/${this.phoneNumberId}/messages`,
        payload
      );

      console.log(`[WhatsAppService] Template sent successfully. Message ID: ${response.data?.messages?.[0]?.id}`);
      return response.data;
    } catch (error: any) {
      // Log error without exposing access token
      const errorDetails = {
        templateName,
        to: normalizedPhone || to,
        status: error.response?.status,
        metaErrorCode: error.response?.data?.error?.code,
        metaErrorType: error.response?.data?.error?.type,
        metaErrorMessage: error.response?.data?.error?.message,
        message: error.message,
      };
      console.error('[WhatsAppService] Failed to send template message:', errorDetails);
      throw error;
    }
  }

  /**
   * Send a document message to a WhatsApp number
   */
  async sendDocumentMessage(
    to: string,
    documentUrl: string,
    caption?: string,
    filename?: string
  ): Promise<any> {
    try {
      const normalizedPhone = this.normalizePhoneNumber(to);

      const payload = {
        messaging_product: 'whatsapp',
        to: normalizedPhone,
        type: 'document',
        document: {
          link: documentUrl,
          caption: caption || '',
          filename: filename || 'document.pdf',
        },
      };

      console.log(`[WhatsAppService] Sending document to ${normalizedPhone}`);
      const response = await this.axiosInstance.post(
        `/${this.phoneNumberId}/messages`,
        payload
      );

      console.log(`[WhatsAppService] Document sent successfully. Message ID: ${response.data?.messages?.[0]?.id}`);
      return response.data;
    } catch (error: any) {
      console.error('[WhatsAppService] Failed to send document message:', {
        to,
        error: error.response?.data || error.message,
      });
      throw error;
    }
  }

  /**
   * Send Bhog booking confirmation template
   * Template name and language are configured via environment variables
   */
  async sendBhogBookingConfirmation(
    params: BhogBookingConfirmationParams
  ): Promise<any> {
    if (!this.templateName) {
      throw new Error('WhatsApp template name not configured. Set WHATSAPP_TEMPLATE_NAME environment variable.');
    }

    const components = [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: params.customerName,
          },
          {
            type: 'text',
            text: params.day,
          },
          {
            type: 'text',
            text: params.date,
          },
          {
            type: 'text',
            text: params.numberOfBhog,
          },
          {
            type: 'text',
            text: params.type,
          },
          {
            type: 'text',
            text: params.bhogTiming,
          },
        ],
      },
    ];

    return this.sendTemplateMessage(
      params.whatsappNumber,
      this.templateName,
      this.templateLanguage,
      components
    );
  }

  /**
   * Send Anudan contribution confirmation template
   * Note: This method is a placeholder for when an Anudan template is approved in Meta
   * Currently not called in the payment flow until a template is configured
   */
  async sendAnudanConfirmation(
    params: AnudanConfirmationParams
  ): Promise<any> {
    const anudanTemplateName = process.env.WHATSAPP_ANUDAN_TEMPLATE_NAME;
    if (!anudanTemplateName) {
      console.warn('[WhatsAppService] Anudan template not configured. WhatsApp notifications for Anudan are disabled until WHATSAPP_ANUDAN_TEMPLATE_NAME is set.');
      return null;
    }

    // Build category summary for the template
    const categorySummary = params.categories
      .map(cat => `${cat.day}: ₹${cat.amount}`)
      .join(', ');

    const components = [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: params.customerName,
          },
          {
            type: 'text',
            text: categorySummary,
          },
          {
            type: 'text',
            text: params.totalAmount,
          },
        ],
      },
    ];

    return this.sendTemplateMessage(
      params.whatsappNumber,
      anudanTemplateName,
      this.templateLanguage,
      components
    );
  }
}

// Export singleton instance
export const whatsAppService = new WhatsAppService();
