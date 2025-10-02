#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const { setupElasticsearch } = require('./elasticsearch');

/**
 * Configuration for the setup process
 */
const CONFIG = {
  setupScripts: [
    'kibana.js'
  ]
};


const runScript = (scriptPath) => {
  return new Promise((resolve, reject) => {
    console.log(`Running setup script: ${scriptPath}`);
    
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`Successfully completed: ${scriptPath}`);
        resolve();
      } else {
        console.error(`Failed to run: ${scriptPath} with exit code: ${code}`);
        reject(new Error(`Script ${scriptPath} exited with code ${code}`));
      }
    });
  });
};

const main = async () => {
  try {
    console.log('Starting Elasticsearch setup...');
    await setupElasticsearch();
    console.log('Elasticsearch setup completed successfully.');
    for (const script of CONFIG.setupScripts) {
      await runScript(script);
    }
    
    console.log('All setup scripts completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { main }; 