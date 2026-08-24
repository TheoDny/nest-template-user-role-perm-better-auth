#!/bin/sh

set -eu

MAX_ATTEMPTS=5
RETRY_DELAY=2

run_with_retry() {
    command_name="$1"
    shift

    attempt=1

    while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
        echo ""
        echo "[$command_name] Attempt ${attempt}/${MAX_ATTEMPTS}"

        if "$@"; then
            echo "[$command_name] Success"
            return 0
        fi

        if [ "$attempt" -eq "$MAX_ATTEMPTS" ]; then
            echo "[$command_name] Failed after ${MAX_ATTEMPTS} attempts"
            return 1
        fi

        echo "[$command_name] Failed, retrying in ${RETRY_DELAY}s..."
        sleep "$RETRY_DELAY"

        attempt=$((attempt + 1))
    done
}

echo "========================================"
echo "Running database migrations"
echo "========================================"

run_with_retry \
    "MIGRATION" \
    bunx prisma migrate deploy

echo ""
echo "========================================"
echo "Running database seed"
echo "========================================"

run_with_retry \
    "SEED" \
    bun run prisma:seed

echo ""
echo "========================================"
