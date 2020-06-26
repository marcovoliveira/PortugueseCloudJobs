#!/bin/bash

echo "Moving to Terraform's base directory"
cd ..
REMOTE_IP=$(terraform output | awk -F ' ' '{print $3}')

ssh -t meicm@$REMOTE_IP tail -f /var/log/cloud-init-output.log