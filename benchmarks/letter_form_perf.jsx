import { performance } from 'perf_hooks';

function benchmark() {
  const items = Array.from({ length: 10000 }, (_, i) => ({ id: i, amount: 10.50 }));

  const start = performance.now();
  for (let i = 0; i < 1000; i++) {
    const principal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const fee = (principal * 0.05).toFixed(2);
  }
  const end = performance.now();

  console.log(`Baseline Execution Time: ${(end - start).toFixed(2)} ms`);
}

benchmark();
