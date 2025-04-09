#!/bin/bash

set -e
set -o pipefail

MAX_ITERATIONS=$1
iteration=0

# Extension has to be built before tests.
npm run build

# Loop until npm run test fails or MAX_ITERATIONS is reached.
while true; do
  iteration=$((iteration + 1))
  echo "Iteration: $iteration"
  
  npm run test
  if [ $? -ne 0 ]; then
    echo "Tests failed after $iteration iterations. Exiting..."
    exit 1
  fi

  if [ "$iteration" -eq "$MAX_ITERATIONS" ]; then
    echo "Tests passed."
    exit 0
  else
    echo "Tests passed. Waiting 1 second before rerun..."
    sleep 1
  fi
done
