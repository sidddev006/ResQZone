#!/usr/bin/env bash
set -e
echo "=== ResQZone: Seeding Demo Data ==="
export PYTHONPATH=.
python -m backend.app.db.seed
echo "=== Seeding Complete ==="
