#!/bin/bash

ENV=$1

if [ "$ENV" == "prod" ]; then
  cp geoguessr-frontend/backend-address-prod.txt geoguessr-frontend/backend-address.txt
elif [ "$ENV" == "local" ]; then
  cp geoguessr-frontend/backend-address-local.txt geoguessr-frontend/backend-address.txt
else
  echo "❌ Usage: ./set-backend-url.sh [local|prod]"
  exit 1
fi

echo "✅ backend-address.txt set to $ENV mode"


