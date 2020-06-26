#!/bin/bash

echo "Building Kubectl Configuration"

cd ../gke

CLUSTER_NAME=$(terraform output | grep cluster | awk -F ' ' '{print $3}')
REGION=$(terraform output | grep location | awk -F ' ' '{print $3}')

echo "Cluster Name: $CLUSTER_NAME | Region: $REGION"

gcloud container clusters get-credentials $CLUSTER_NAME --region $REGION
