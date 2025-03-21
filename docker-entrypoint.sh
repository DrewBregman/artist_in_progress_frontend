#!/bin/bash
set -e

# Get the backend URL from environment or use a default
BACKEND_URL=${REACT_APP_BACKEND_URL:-http://localhost:8000}

# Debug message
echo "Using backend URL: $BACKEND_URL"

# Replace environment variables in JavaScript files
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:8000|${BACKEND_URL}|g" {} \;

# Start nginx
exec "$@"