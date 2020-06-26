#cloud-config
package_update: true
package_upgrade: true
packages:
  - apt-transport-https
  - ca-certificates
  - curl
  - gnupg-agent
  - software-properties-common

users:
  - name: ${username}
    ssh-authorized-keys:
      - ${authorized_key1}
      - ${authorized_key2}
      - ${authorized_key3}
    sudo: ['ALL=(ALL) NOPASSWD:ALL']
    groups: sudo
    shell: /bin/bash