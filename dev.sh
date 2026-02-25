#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

is_port_in_use() {
  local port="$1"
  lsof -nP -iTCP:"${port}" -sTCP:LISTEN -t >/dev/null 2>&1
}

find_free_port() {
  local start_port="$1"
  local port="${start_port}"
  while is_port_in_use "${port}"; do
    port=$((port + 1))
  done
  echo "${port}"
}

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  if [[ -n "${FRONTEND_PID}" ]] && kill -0 "${FRONTEND_PID}" 2>/dev/null; then
    kill "${FRONTEND_PID}" 2>/dev/null || true
  fi
  if [[ -n "${BACKEND_PID}" ]] && kill -0 "${BACKEND_PID}" 2>/dev/null; then
    kill "${BACKEND_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

BACKEND_PORT="$(find_free_port 8000)"
FRONTEND_PORT="$(find_free_port 5173)"

echo "Backend:  http://127.0.0.1:${BACKEND_PORT}"
echo "Frontend: http://localhost:${FRONTEND_PORT}"

(
  cd "${ROOT_DIR}/backend"
  python3 -m uvicorn app.main:app --reload --port "${BACKEND_PORT}"
) &
BACKEND_PID=$!

(
  cd "${ROOT_DIR}/frontend"
  npm run dev -- --port "${FRONTEND_PORT}"
) &
FRONTEND_PID=$!

while true; do
  if ! kill -0 "${BACKEND_PID}" 2>/dev/null; then
    break
  fi
  if ! kill -0 "${FRONTEND_PID}" 2>/dev/null; then
    break
  fi
  sleep 1
done
