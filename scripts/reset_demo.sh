#!/usr/bin/env bash
set -e
echo "=== ResQZone: Resetting Demo Environment ==="
rm -f resqzone.db
export PYTHONPATH=.
python -m backend.app.db.seed
echo "=== Reset Complete ==="
