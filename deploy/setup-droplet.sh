#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Preparación del droplet para Qunuq Alpaca — Ubuntu 24.04 LTS
# Ejecutar UNA VEZ como root en el droplet:
#     bash setup-droplet.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

# ⬇️  PEGA AQUÍ la CLAVE PÚBLICA de despliegue (contenido de qunuq_deploy.pub)
DEPLOY_PUBKEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIShHZG6Q4yiDcx6eGx3ik+Sm3CdqdVGYqHqIK1fZK0q github-actions-deploy"

if [[ "$DEPLOY_PUBKEY" != ssh-* ]]; then
  echo "ERROR: edita el script y pega la clave pública de despliegue en DEPLOY_PUBKEY." >&2
  exit 1
fi

echo "==> 1/6 Actualizando el sistema"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y && apt-get upgrade -y

echo "==> 2/6 Instalando Docker + Compose"
apt-get install -y ca-certificates curl git rsync ufw
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker

echo "==> 3/6 Creando usuario 'deploy' (para el CI)"
if ! id deploy &>/dev/null; then
  adduser --disabled-password --gecos "" deploy
fi
usermod -aG docker deploy
mkdir -p /home/deploy/.ssh
echo "$DEPLOY_PUBKEY" > /home/deploy/.ssh/authorized_keys
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh

echo "==> 4/6 Carpetas del proyecto"
mkdir -p /opt/qunuq/www/landing /opt/qunuq/www/erp /opt/qunuq/qunuq-alpaca-api
chown -R deploy:deploy /opt/qunuq

echo "==> 5/6 Swap de 2 GB (evita quedarse sin RAM al construir la API)"
if [[ ! -f /swapfile ]]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> 6/6 Firewall (SSH + HTTP + HTTPS)"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "✅ Droplet listo."
echo "   Siguiente paso: crear el .env de la API en"
echo "   /opt/qunuq/qunuq-alpaca-api/.env"
echo "   (usa la plantilla .env.production.example)"
