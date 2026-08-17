# 🚀 Vestro AI 2.0 — Deployment Guide

## Prerequisites
- Ubuntu 22.04 EC2 (t3.small or better)
- Node.js 20, MongoDB Atlas, Redis (ElastiCache or local)
- Domain with SSL (via Certbot/nginx)

---

## Option A: Docker Compose (Recommended)

### 1. Clone & configure
```bash
git clone https://github.com/Ritesh9115/Vestro-Ai /opt/vestro
cd /opt/vestro
cp .env.example .env
nano .env  # Fill in all required values
```

### 2. Start all services
```bash
docker compose up -d
docker compose logs -f backend   # Watch logs
```

### 3. Health check
```bash
curl http://localhost:3001/api/health
```

---

## Option B: PM2 (Bare Metal / EC2)

### 1. Install dependencies
```bash
sudo apt update && sudo apt install -y nodejs npm redis-server
npm install -g pm2
```

### 2. Backend
```bash
cd /opt/vestro/backend
npm ci --only=production
cp ../.env.example .env && nano .env
pm2 start ecosystem.config.js
pm2 save
pm2 startup    # Follow the printed command
```

### 3. Frontend
```bash
cd /opt/vestro/frontend
npm ci
npm run build
# Serve with nginx (see below)
```

### 4. nginx config (SPA + API proxy)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # API proxy
    location /api/ {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # SPA frontend
    location / {
        root  /opt/vestro/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public,immutable";
    }
}
```

---

## GitHub Actions Auto-Deploy

Set the following secrets in **Settings → Secrets → Actions**:

| Secret | Description |
|---|---|
| `EC2_HOST` | EC2 public IP |
| `EC2_SSH_KEY` | Private key (PEM content) |
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password |
| `JWT_SECRET` | 256-bit random string |
| `JWT_REFRESH_SECRET` | Different 256-bit random string |
| `GOOGLE_API_KEY` | Gemini API key |
| `MONGO_USERNAME` | MongoDB Atlas username |
| `MONGO_PASSWORD` | MongoDB Atlas password |
| `FRONTEND_URL` | e.g. https://vestro.ai |
| `CLIENT_URL` | same as above |
| `EMAIL_USER` | SMTP email address |
| `EMAIL_PASS` | SMTP app password |

Then push to `main` → GitHub Actions automatically builds, pushes Docker images, deploys to EC2.

---

## PM2 Commands
```bash
pm2 status           # Check status
pm2 reload vestro-api  # Zero-downtime reload
pm2 logs vestro-api    # Stream logs
pm2 monit            # Real-time metrics
```

---

## Monitoring
- **Health endpoint**: `GET /api/health`
- **PM2 Plus**: Free tier at pm2.io for dashboards
- **MongoDB Atlas**: Built-in metrics and alerts
