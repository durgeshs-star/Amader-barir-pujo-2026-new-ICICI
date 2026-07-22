/**
 * Development Tunnel Script
 * 
 * Starts ngrok tunnel for local ICICI PG testing, updates ICICI_PG_RETURN_URL in .env,
 * and starts the backend dev server.
 * 
 * Usage: npm run dev:tunnel
 */

import ngrok from 'ngrok';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { spawn } from 'child_process';
import path from 'path';

const BACKEND_PORT = 3001;
const ENV_FILE = path.join(process.cwd(), '.env');

// Safeguard: refuse to run in production
if (process.env.NODE_ENV === 'production') {
  console.error('❌ ERROR: dev:tunnel is for local development only.');
  console.error('❌ NODE_ENV is set to "production". Refusing to run.');
  process.exit(1);
}

async function updateEnvVar(envFile: string, key: string, value: string): Promise<void> {
  let content = '';
  
  if (existsSync(envFile)) {
    content = readFileSync(envFile, 'utf-8');
  } else {
    content = '';
  }

  // Check if the key already exists
  const keyRegex = new RegExp(`^${key}=.*$`, 'm');
  const match = content.match(keyRegex);

  if (match) {
    // Replace existing value
    content = content.replace(keyRegex, `${key}=${value}`);
  } else {
    // Append new key-value pair
    if (content && !content.endsWith('\n')) {
      content += '\n';
    }
    content += `${key}=${value}\n`;
  }

  writeFileSync(envFile, content);
}

async function startDevServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const devServer = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    devServer.on('error', (error) => {
      reject(error);
    });

    // Keep the process running
    devServer.on('exit', (code) => {
      console.log(`Backend dev server exited with code ${code}`);
    });
  });
}

async function main(): Promise<void> {
  console.log('🚀 Starting development tunnel for ICICI PG testing...\n');

  try {
    // Start ngrok tunnel
    console.log(`📡 Starting ngrok tunnel on port ${BACKEND_PORT}...`);
    const url = await ngrok.connect({
      addr: BACKEND_PORT,
      authtoken_from_env: true,
    });

    console.log(`✅ ngrok tunnel active: ${url}\n`);

    // Update ICICI_PG_RETURN_URL in .env
    const callbackUrl = `${url}/api/payment/icici-callback`;
    console.log(`📝 Updating ICICI_PG_RETURN_URL in .env...`);
    await updateEnvVar(ENV_FILE, 'ICICI_PG_RETURN_URL', callbackUrl);
    console.log(`✅ ICICI_PG_RETURN_URL updated: ${callbackUrl}\n`);

    // Print summary
    console.log('='.repeat(60));
    console.log('✅ ngrok tunnel active:', url);
    console.log('✅ ICICI_PG_RETURN_URL updated in .env');
    console.log('✅ Backend starting...');
    console.log('='.repeat(60));
    console.log('\n📌 Ready to test payments!');
    console.log('📌 Go to http://localhost:5173 (frontend) and click Pay\n');

    // Start backend dev server
    await startDevServer();

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);

    // Check for ngrok authtoken error
    if (error.message.includes('authtoken') || error.message.includes('authentication')) {
      console.error('\n⚠️  ngrok authtoken not configured.');
      console.error('⚠️  One-time setup required:');
      console.error('⚠️  1. Go to https://dashboard.ngrok.com/get-started/your-authtoken');
      console.error('⚠️  2. Copy your authtoken');
      console.error('⚠️  3. Run: ngrok config add-authtoken <your-token>');
      console.error('⚠️  4. Then run: npm run dev:tunnel again\n');
    }

    process.exit(1);
  }
}

main();
