import { populateDemoData } from './populate-demo-data.js';

async function run() {
  try {
    await populateDemoData();
    console.log('✅ Demo data setup complete!');
  } catch (error) {
    console.error('❌ Demo data setup failed:', error);
    process.exit(1);
  }
}

run();
