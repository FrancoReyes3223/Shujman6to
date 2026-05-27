#!/usr/bin/env bash
# Levanta el entorno de desarrollo completo: docs, backend y frontend.
#
# Uso:
#   ./scripts/dev.sh
#
# URLs:
#   Frontend: http://localhost:3000
#   Backend:  http://localhost:3001
#   Docs:     http://localhost:3000/docs/

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cleanup() {
  echo ""
  echo "Deteniendo servidores..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  echo "Listo."
}
trap cleanup EXIT INT TERM

echo "==> [1/4] Instalando dependencias..."
cd "$ROOT/backend" && npm install
cd "$ROOT/frontend" && npm install
cd "$ROOT/docs" && npm install

echo ""
echo "==> [2/4] Buildeando docs..."
cd "$ROOT"
npm run dev:docs

echo ""
echo "==> [3/4] Iniciando backend (puerto 3001)..."
cd "$ROOT/backend"
npm run dev &
BACKEND_PID=$!

echo ""
echo "==> [4/4] Iniciando frontend (puerto 3000)..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Todo corriendo:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  Docs:     http://localhost:3000/docs/"
echo ""
echo "Presioná Ctrl+C para detener todo."

wait "$BACKEND_PID" "$FRONTEND_PID"
