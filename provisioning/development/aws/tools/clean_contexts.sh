#!/bin/bash

docker context use default

docker context rm remote

kubectl config use-context minikube 

kubectl config delete-context remote

kubectl config delete-cluster remote-cluster 