#!/bin/sh
set -e

echo "[boot] starting container startup"
echo "[boot] checking uploads dir"
UPLOADS_PATH="${UPLOADS_DIR:-/app/uploads}"
if mkdir -p "$UPLOADS_PATH"; then
  echo "[boot] uploads dir ready path=$UPLOADS_PATH"
else
  echo "[boot:error] uploads dir failed path=$UPLOADS_PATH"
  exit 1
fi

echo "[boot] prisma migrate deploy"
ATTEMPTS=0
MAX_ATTEMPTS="${MIGRATE_MAX_ATTEMPTS:-5}"
SLEEP_SECONDS="${MIGRATE_RETRY_SLEEP_SECONDS:-3}"
ALLOW_MIGRATE_FAILURE="${ALLOW_MIGRATE_FAILURE:-false}"

until npm run prisma:deploy; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
    echo "[boot:error] prisma migrate deploy failed after ${ATTEMPTS} attempts"
    if [ "$ALLOW_MIGRATE_FAILURE" = "true" ]; then
      echo "[boot] continuing startup because ALLOW_MIGRATE_FAILURE=true"
      break
    fi
    exit 1
  fi
  echo "[boot:error] prisma migrate deploy failed (attempt ${ATTEMPTS}/${MAX_ATTEMPTS}), retrying in ${SLEEP_SECONDS}s..."
  sleep "$SLEEP_SECONDS"
done

if [ "${RUN_DB_SEED:-false}" = "true" ]; then
  echo "[boot] running seed (non-blocking)"
  if ! npm run db:seed; then
    echo "[boot:error] seed failed - continuing startup to avoid downtime"
  fi
else
  echo "[boot] seed skipped (RUN_DB_SEED=false)"
fi

echo "[boot] launching api process"
exec npm run start
