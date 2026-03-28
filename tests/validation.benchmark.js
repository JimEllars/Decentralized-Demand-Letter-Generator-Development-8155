import { validateForm } from '../src/utils/validation.js';

const formData = {
  jurisdiction: 'CA',
  tone: 'firm',
  creditorName: 'ACME Corp',
  creditorAddress: '123 Business Rd',
  debtorName: 'John Doe',
  debtorAddress: '456 Default St',
  items: Array.from({ length: 50 }, (_, i) => ({
    id: `item-${i}`,
    description: `Service ${i}`,
    amount: '100.00'
  })),
  dueDate: '2023-01-01',
  letterDate: '2023-02-01',
  statutoryInterest: '0',
};

const ITERATIONS = 10000;

console.time(`Validation Benchmark (${ITERATIONS} iterations)`);
for (let i = 0; i < ITERATIONS; i++) {
  validateForm(formData);
}
console.timeEnd(`Validation Benchmark (${ITERATIONS} iterations)`);
