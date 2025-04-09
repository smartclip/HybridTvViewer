#!/bin/bash
# Description for API: https://developer.chrome.com/docs/webstore/using-api
set -e
set -o pipefail

if [ -z "${CLIENT_ID}" ]; then
    echo "CLIENT_ID is not defined."
    exit 1
fi

if [ -z "${CLIENT_SECRET}" ]; then
    echo "CLIENT_SECRET is not defined."
    exit 1
fi

if [ -z "${REFRESH_TOKEN}" ]; then
    echo "REFRESH_TOKEN is not defined."
    exit 1
fi

if [ -z "${APP_ID}" ]; then
    echo "APP_ID is not defined."
    exit 1
fi

zip build.zip -r build

echo "Requesting access token"
ACCESS_TOKEN=$(curl --fail-with-body "https://accounts.google.com/o/oauth2/token" -d "client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${REFRESH_TOKEN}&grant_type=refresh_token" | jq -r .access_token)

echo "Uploading build.zip"
curl --fail-with-body \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "x-goog-api-version: 2" \
    -X PUT \
    -T build.zip \
    -v "https://www.googleapis.com/upload/chromewebstore/v1.1/items/${APP_ID}"

echo "Publishing"
curl --fail-with-body \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "x-goog-api-version: 2" \
    -H "Content-Length: 0" \
    -X POST \
    -v "https://www.googleapis.com/chromewebstore/v1.1/items/${APP_ID}/publish"
