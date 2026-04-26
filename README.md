# occlux

Share encrypted secrets with a view limit and TTL. Try it at [occlux.tech](https://occlux.tech).

Secrets are encrypted in the browser with AES-256-GCM before being sent to the server. The server stores only the ciphertext and never sees the plaintext. The decryption key lives only in the URL fragment and never touches the server.

## How it works

1. You paste a secret into the browser or CLI
2. It gets encrypted locally with a random AES-256-GCM key
3. The encrypted blob is sent to the server
4. You get a link — the decryption key is embedded in the `#fragment` of the URL
5. The recipient opens the link — the secret is decrypted in their browser
6. After the view limit or TTL is reached, the secret is permanently deleted

## CLI

Download the binary from [Releases](https://github.com/sweear/occlux/releases) for your platform.

```bash
# Linux / macOS
chmod +x occlux-linux-amd64
mv occlux-linux-amd64 /usr/local/bin/occlux

# create a secret
occlux create "my secret"
occlux create "my secret" --ttl 60 --views 3
echo "my secret" | occlux create

# get a secret
occlux get "https://occlux.tech/s/abc123#key"
```

By default the CLI talks to `https://occlux.tech`. To use a self-hosted instance:

```bash
export OCCLUX_SERVER_URL=https://your-instance.com
# or
occlux --server https://your-instance.com create "my secret"
```

## Self-hosting

### Requirements

- Docker and Docker Compose
- A domain with SSL (nginx + certbot recommended)

### 1. Clone the repository

```bash
git clone https://github.com/sweear/occlux.git
cd occlux
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```dotenv
# SERVER
OCCLUX_HOST=0.0.0.0
OCCLUX_PORT=8080

# REDIS
OCCLUX_REDIS_URL=redis://redis:6379

# RATE LIMITS
OCCLUX_RATE_LIMIT_SECRET_CREATE=20-M
OCCLUX_RATE_LIMIT_SECRET_GET=60-M
```

### 3. Start

```bash
docker compose up -d
```

The server will be available at `http://localhost:8080`.

### 4. Nginx + SSL

Install nginx and certbot:

```bash
apt install nginx certbot python3-certbot-nginx
```

Create nginx config at `/etc/nginx/sites-available/occlux`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and get SSL:

```bash
ln -s /etc/nginx/sites-available/occlux /etc/nginx/sites-enabled/
certbot --nginx -d your-domain.com
systemctl reload nginx
```

### 5. Update

```bash
git pull
docker compose up -d --build
```

## Configuration

All configuration is done via environment variables with the `OCCLUX_` prefix.

| Variable | Default | Description |
|---|---|---|
| `OCCLUX_HOST` | `0.0.0.0` | Server host |
| `OCCLUX_PORT` | `8080` | Server port |
| `OCCLUX_REDIS_URL` | — | Redis connection URL |
| `OCCLUX_REDIS_POOL_SIZE` | `10` | Redis connection pool size |
| `OCCLUX_REDIS_MIN_IDLE_CONNS` | `2` | Minimum idle connections |
| `OCCLUX_REDIS_PROTOCOL` | `3` | RESP protocol version |
| `OCCLUX_RATE_LIMIT_SECRET_CREATE` | `20-M` | Rate limit for secret creation |
| `OCCLUX_RATE_LIMIT_SECRET_GET` | `60-M` | Rate limit for secret retrieval |
| `OCCLUX_REDIS_SECRET_DB` | `0` | Redis DB for secrets |
| `OCCLUX_REDIS_LIMITER_DB` | `1` | Redis DB for rate limiter |

## Stack

- **Backend** — Go, Gin, Redis
- **Frontend** — React, Vite, TypeScript
- **Encryption** — AES-256-GCM via Web Crypto API (browser) and Go standard library (CLI)
