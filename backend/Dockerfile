FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for geospatial calculations and database drivers
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libgeos-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY data/ ./data/

ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["sh", "-c", "python -m backend.app.db.seed && uvicorn backend.app.main:app --host 0.0.0.0 --port 8000"]
