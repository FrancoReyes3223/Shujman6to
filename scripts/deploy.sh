#!/usr/bin/env bash
# Deploy completo al servidor de la facu (200.3.127.46:8002).
#
# Uso:
#   ./scripts/deploy.sh <usuario>
#   ./scripts/deploy.sh dos
#
# Antes de correr, asegurate de:
#   - Tener creadas las migraciones de Prisma (npx prisma migrate dev en backend/).
#   - Saber tu contraseña SSH (te la van a pedir varias veces, o configurá SSH keys).

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Uso: $0 <usuario>"
  echo "Ejemplo: $0 dos"
  exit 1
fi

USUARIO="$1"
SERVER="${USUARIO}@200.3.127.46"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Deploy a ${SERVER}"
echo

echo "==> [1/4] Build frontend + docs (con USUARIO=${USUARIO})"
cd "$ROOT"
USUARIO="$USUARIO" npm run build

echo
echo "==> [2/4] Build backend (TypeScript -> dist/)"
cd "$ROOT/backend"
npm run build

echo
echo "==> [3/4] Subiendo frontend a ~/public_html/"
scp -r "$ROOT/frontend/out/"* "${SERVER}:~/public_html/"

echo
echo "==> [4/4] Subiendo backend (dist + prisma) a ~/servicios/"
scp -r "$ROOT/backend/dist/"* "${SERVER}:~/servicios/dist/"
scp -r "$ROOT/backend/prisma/"* "${SERVER}:~/servicios/prisma/"

echo
echo "Deploy completo."
echo "  Sitio:  http://200.3.127.46:8002/~${USUARIO}/"
echo "  API:    http://200.3.127.46:8002/~${USUARIO}/api/"
echo "  Docs:   http://200.3.127.46:8002/~${USUARIO}/docs/"
