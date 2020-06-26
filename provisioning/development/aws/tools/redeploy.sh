#!/bin/bash

cd ..
cd ..
cd ..
cd ..

kubectl delete -f kubernetes

docker images prune -a 

docker build ./src -t cloudjobs_app:1.0.0 

docker builder prune

echo "Deploying to Kubernetes"

kubectl create -f kubernetes --save-config