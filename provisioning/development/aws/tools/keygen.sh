#!/bin/bash

ssh-keygen -t rsa -b 4096 -C "ricardo@meicm" -f $HOME/.ssh/meicm_rsa

echo "Authorized Key"
cat $HOME/.ssh/meicm-rsa.pub