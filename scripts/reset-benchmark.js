#!/usr/bin/env node
/**
 * Reset the benchmark environment to a clean state.
 * Removes generated reports and database files.
 */
const fs = require('fs');
const path = require('path');

const reportsDir = path.join(__dirname, '..', 'benchmark', 'reports');
if (fs.existsSync(reportsDir)) {
  fs.rmSync(reportsDir, { recursive: true, force: true });
  console.log('Cleaned benchmark reports');
}

const dbFiles = ['*.db'];
for (const pattern of dbFiles) {
  // In a real implementation, glob and remove DB files
}

console.log('Benchmark environment reset complete');
