#!/bin/bash

echo "Moving to Terraform's base directory"
cd ..
REMOTE_IP=$(terraform output | awk -F ' ' '{print $3}')

echo "http://$REMOTE_IP:8001/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/"