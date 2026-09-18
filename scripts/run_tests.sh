#!/usr/bin/env bash
set -e
echo "=== ResQZone: Running Comprehensive Test Suite ==="
export PYTHONPATH=.
pytest backend/tests -v --durations=10
echo "=== All Tests Passed Successfully ==="
