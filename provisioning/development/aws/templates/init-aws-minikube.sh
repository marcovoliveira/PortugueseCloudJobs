#!/bin/bash

echo "Installing kubectl"
curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/linux/amd64/kubectl

chmod +x ./kubectl

sudo mv ./kubectl /usr/local/bin/kubectl

echo "Installing Docker"

sudo apt-get -y remove docker docker-engine docker.io containerd runc

sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common \
    conntrack

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io 

sudo usermod -aG docker ${username}

echo "Installing Minikube"
curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 \

chmod +x minikube

sudo mv ./minikube /usr/local/bin/minikube

echo "Starting Minikube"

sudo minikube start --vm-driver=none

sudo minikube addons enable ingress

sudo kubectl proxy --address='0.0.0.0' --disable-filter=true &

sudo minikube dashboard &