#!/bin/bash
set -e

echo "Running Calculations Tests..."
node tests/calculations.test.js

echo ""
echo "Running PDF Generator Tests..."
node tests/pdfGenerator.test.js

echo ""
echo "All tests passed successfully!"
