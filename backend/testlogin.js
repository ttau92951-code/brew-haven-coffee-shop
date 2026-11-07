/**
 * Brew Haven - staff login helper.
 *
 * Interactive CLI that verifies the staff credentials configured in `.env`
 * by calling POST /api/auth/staff/login on the running backend.
 *
 * Usage:
 *   cd backend
 *   node testlogin.js
 */

import readline from 'node:readline';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  const username = (await ask('Staff username: ')).trim();
  const password = await ask('Staff password: ');

  try {
    const response = await fetch(`${API_URL}/auth/staff/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const body = await response.json();

    if (!response.ok || !body.success) {
      console.log(`\n✗ Login failed (HTTP ${response.status}): ${body.message || 'Unknown error'}`);
      return;
    }

    console.log('\n✓ Staff login successful.');
    console.log(`  User:  ${body.user?.username || username}`);
    console.log(`  Role:  ${body.user?.role || 'staff'}`);
     } catch (error) {
    console.error('\n✗ Could not reach the API:', error.message);
    console.error(`  Is the backend running at ${API_URL}?`);
  } finally {
    rl.close();
  }
}

main();
