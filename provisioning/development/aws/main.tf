provider "aws" {
  region = var.region
}

resource "aws_key_pair" "auth" {
  key_name   = "default"
  public_key = file(var.public_key_path)
}

resource "aws_security_group" "minikube" {
  name = "minikube"
  description = "Minikube Security Group"
  
  ingress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["144.64.111.7/32"]
  }
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "template_file" "cloud-init-config" {
  template = file("${path.module}/templates/cloudconfig-minikube.tpl")

  vars = {
    username = var.username
    authorized_key1 = var.authorized_key1
    authorized_key2 = var.authorized_key2
    authorized_key3 = var.authorized_key3
  }
}

data "template_file" "init_minikube" {
  template = file("${path.module}/templates/init-aws-minikube.sh")
  vars = {
    username = var.username
  }
}

data "template_cloudinit_config" "minikube_cloud_init" {
  gzip = true
  base64_encode = true

  part {
    filename = "cloud-init-config.yaml"
    content_type = "text/cloud-config"
    content = data.template_file.cloud-init-config.rendered
  }

  part {
    filename = "init-aws-minikube.sh"
    content_type = "text/x-shellscript"
    content = data.template_file.init_minikube.rendered
  }
}

resource "aws_instance" "minikube" {
  ami = var.ami
  instance_type = var.instance_type
  key_name = "default"
  vpc_security_group_ids = [aws_security_group.minikube.id]
  user_data = data.template_cloudinit_config.minikube_cloud_init.rendered
}

output "public_ip" {
  value       = aws_instance.minikube.public_ip
}