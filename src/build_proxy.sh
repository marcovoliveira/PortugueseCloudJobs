#!/bin/bash

VERSION="1.09"

FRONTEND_IMAGE="cloudjobs-frontend:$VERSION"
SERVICE_IMAGE_AUTHENTICATION="cloudjobs-auth-service:$VERSION"
SERVICE_IMAGE_KEYWORDS="cloudjobs-keywords-service:$VERSION"
SERVICE_IMAGE_AGENDA="cloudjobs-agenda-service:$VERSION"
SERVICE_IMAGE_SEARCH="cloudjobs-search-service:$VERSION"
SERVICE_IMAGE_STATISTICS="cloudjobs-statistics-service:$VERSION"

echo "Local Docker Image Building"

echo "Bulding Frontend"
docker build -t $FRONTEND_IMAGE -f ./frontend/DockerfileProxy ./frontend

echo "Bulding Services"
docker build -t $SERVICE_IMAGE_AUTHENTICATION ./services/auth
docker build -t $SERVICE_IMAGE_KEYWORDS ./services/keywords
docker build -t $SERVICE_IMAGE_AGENDA ./services/agenda
docker build -t $SERVICE_IMAGE_SEARCH ./services/search
docker build -t $SERVICE_IMAGE_STATISTICS ./services/statistics


echo "DONE - Local Docker Image Building"
