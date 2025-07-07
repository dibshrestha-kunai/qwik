const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const { performance } = require('perf_hooks');

function getFolderSizeInKB(dirPath) {
  let totalSize = 0;
  function walk(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
      const fullPath = path.join(directory, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) walk(fullPath);
      else totalSize += stat.size;
    }
  }
  walk(dirPath);
  return totalSize / 1024;
}

function runRuntimeBenchmark() {
  const iterations = 10000;
  const arr = [];
  const start = performance.now();
  for (let i = 0; i < iterations; i++) arr.push({ i });
  const end = performance.now();
  return end - start;
}

(async () => {
  const results = [];

  const buildStart = performance.now();
  execSync('pnpm build', { stdio: 'inherit' });
  const buildEnd = performance.now();
  results.push({
    name: 'Build Time',
    unit: 'seconds',
    value: ((buildEnd - buildStart) / 1000).toFixed(2),
  });

  const sizeKB = getFolderSizeInKB('packages/qwik/dist');
  results.push({ name: 'Build Size', unit: 'KB', value: sizeKB.toFixed(2) });

  const runtimeMs = runRuntimeBenchmark();
  results.push({ name: 'Runtime Execution Time', unit: 'ms', value: runtimeMs.toFixed(2) });

  const memoryMB = process.memoryUsage().heapUsed / 1024 / 1024;
  results.push({ name: 'Memory Usage', unit: 'MB', value: memoryMB.toFixed(2) });

  fs.writeFileSync('benchmark-results.json', JSON.stringify(results, null, 2));
  console.log('✅ Benchmarks written to benchmark-results.json');
})();
