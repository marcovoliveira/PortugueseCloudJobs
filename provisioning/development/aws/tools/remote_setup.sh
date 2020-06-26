#!/bin/bash

echo "Moving to Terraform's base directory"
cd ..
echo $(pwd)
REMOTE_IP=$(terraform output | awk -F ' ' '{print $3}')

echo "Remote IP: $REMOTE_IP"

echo "Setting up remote environments for Docker and Kubernetes"

docker context create remote --docker "host=ssh://meicm@$REMOTE_IP" --default-stack-orchestrator swarm

docker context use remote

kubectl config set-cluster remote-cluster --server=http://$REMOTE_IP:8001

kubectl config set-context remote --cluster remote-cluster

kubectl config use-context remote

echo "Moving to repository base directory"

cd ..
cd ..
cd ..
echo $(pwd)

echo "Building CloudJobs Docker image"

docker build ./src -t cloudjobs_app:1.0.0 

docker builder prune

echo "Deploying to Kubernetes"
echo "checking directory"
echo $(pwd)

kubectl create -f kubernetes --save-config