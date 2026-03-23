
import { formatDate } from '../src/services/pdfGenerator.js';

const ITERATIONS = 1000000;
const CACHE_SIZE = 1000;

function runBenchmark() {
  console.log(`Running benchmark with ${ITERATIONS} iterations...`);

  const allDates = [];
  for (let i = 0; i < 5000; i++) {
    const year = 2000 + Math.floor(i / 365);
    const dayOfYear = i % 365;
    const date = new Date(year, 0, dayOfYear + 1);
    allDates.push(date.toISOString().split('T')[0]);
  }

  // Initial fill
  for (let i = 0; i < CACHE_SIZE; i++) {
    formatDate(allDates[i]);
  }

  const start = performance.now();

  for (let i = 0; i < ITERATIONS; i++) {
    // Access a "hot" set of dates (the first 100 added)
    const index = i % 100;
    formatDate(allDates[index]);

    // Frequently add new unique dates to push the cache towards its limit
    // Every 2 iterations, we'll format a new date from the pool
    if (i % 2 === 0) {
      const poolIndex = 1000 + (Math.floor(i / 2) % 4000);
      formatDate(allDates[poolIndex]);
    }
  }

  const end = performance.now();
  console.log(`Time taken: ${(end - start).toFixed(2)}ms`);
}

runBenchmark();
