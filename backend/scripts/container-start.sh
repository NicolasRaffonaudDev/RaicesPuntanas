#!/bin/sh
set -e

echo "[startup] running prisma migrate deploy"
ATTEMPTS=0
MAX_ATTEMPTS="${MIGRATE_MAX_ATTEMPTS:-5}"
SLEEP_SECONDS="${MIGRATE_RETRY_SLEEP_SECONDS:-3}"

until npm run prisma:deploy; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
    echo "[startup] prisma migrate deploy failed after ${ATTEMPTS} attempts"
    exit 1
  fi
  echo "[startup] prisma migrate deploy failed (attempt ${ATTEMPTS}/${MAX_ATTEMPTS}), retrying in ${SLEEP_SECONDS}s..."
  sleep "$SLEEP_SECONDS"
done

if [ "${RUN_DB_SEED:-false}" = "true" ]; then
  echo "[startup] running seed (non-blocking)"
  if ! npm run db:seed; then
    echo "[startup] seed failed - continuing startup to avoid downtime"
  fi
fi

exec npm run start
