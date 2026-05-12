#!/bin/sh
set -e

npm run prisma:deploy

if [ "${RUN_DB_SEED:-false}" = "true" ]; then
  npm run db:seed
fi

exec npm run start
