.PHONY: help install seed test run-backend run-frontend docker-up docker-down

help:
	@echo "ResQZone Commands:"
	@echo "  make install       Install python and frontend dependencies"
	@echo "  make seed          Seed database with realistic Chamoli-Joshimath demo data"
	@echo "  make test          Run full test suite (unit, GIS, ML, optimizer, api)"
	@echo "  make run-backend   Start FastAPI server at http://localhost:8000"
	@echo "  make run-frontend  Start Vite React frontend at http://localhost:5173"
	@echo "  make docker-up     Start all services via Docker Compose"
	@echo "  make docker-down   Stop all Docker Compose services"

install:
	pip install -r backend/requirements.txt
	cd frontend && npm install

seed:
	python -m backend.app.db.seed

test:
	pytest backend/tests -v

run-backend:
	python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

run-frontend:
	cd frontend && npm run dev

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down
