#!/bin/bash


FRONTEND_IMAGE="cloudjobs-frontend-local:1.03"
SERVICE_IMAGE_AUTHENTICATION="cloudjobs-auth-service-local"
SERVICE_IMAGE_KEYWORDS="cloudjobs-keywords-service-local"
SERVICE_IMAGE_AGENDA="cloudjobs-agenda-service-local"
SERVICE_IMAGE_SEARCH="cloudjobs-search-service-local"
SERVICE_IMAGE_STATISTICS="cloudjobs-statistics-service-local"

echo "Local Docker Image Building"

echo "Bulding Frontend"
docker build -t $FRONTEND_IMAGE ./frontend

echo "Bulding Services"
docker build -t $SERVICE_IMAGE_AUTHENTICATION -f ./services/auth/DockerfileLocal ./services/auth
docker build -t $SERVICE_IMAGE_KEYWORDS -f ./services/keywords/DockerfileLocal ./services/keywords
docker build -t $SERVICE_IMAGE_AGENDA -f ./services/agenda/DockerfileLocal ./services/agenda
docker build -t $SERVICE_IMAGE_SEARCH -f ./services/search/DockerfileLocal ./services/search
docker build -t $SERVICE_IMAGE_STATISTICS -f ./services/statistics/DockerfileLocal ./services/statistics


echo "DONE - Local Docker Image Building"
