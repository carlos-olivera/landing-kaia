#!/bin/bash
set -e

PROJECT_DIR="/home/ubuntu/projects/Kaia/landing-kaia"

echo "[deploy-landing] Starting deploy at $(date)"

cd "$PROJECT_DIR"

echo "[deploy-landing] Pulling latest from main..."
git pull origin main

echo "[deploy-landing] Building Docker image..."
docker build -t landing-kaia:latest .

echo "[deploy-landing] Restarting container..."
docker compose down || true
docker compose up -d

echo "[deploy-landing] Done at $(date)"
docker ps --filter name=landing-kaia
