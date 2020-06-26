# Notes

## Minikube Dashboard
http://<ec2_ip>:8001/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/

## Useful commands

### SSH
ssh meicm@<ec2_ip>

### Cloud Init Logs
tail -f /var/log/cloud-init-output.log

### Docker Context
docker context create remote --docker "host=ssh://meicm@<ec2_ip>" --default-stack-orchestrator swarm

docker --context remote ps

### Kubernetes Cluster and Context
kubectl config set-cluster remote-cluster --server=http://<ec2_ip>:8001

kubectl config set-context remote --cluster remote-cluster

kubectl config use-context remote

### Update Version of docker-compose to use --context
sudo curl -L https://github.com/docker/compose/releases/download/1.26.0-rc4/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose