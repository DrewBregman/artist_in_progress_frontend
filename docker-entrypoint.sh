#!/bin/bash
set -e

# Replace environment variables in JavaScript files
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:8000|${REACT_APP_BACKEND_URL}|g" {} \;

# Start nginx
exec "$@"