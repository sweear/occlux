# Occlux

Occlux is a one-time secret sharing service. Paste a password, API key, or any sensitive text — get a link that expires after a set number of views or time. The secret is encrypted in the browser before it ever reaches the server.

## Features

- **Client-side encryption** — AES-256-GCM in the browser. The server stores only ciphertext and never sees the plaintext
- **View limit** — set how many times a secret can be opened (1–100). After that it's gone
- **TTL** — secrets auto-delete after a chosen time window (minutes to days)
- **Custom encryption key** — optionally set your own passphrase as the encryption key

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Go, Gin |
| Frontend | React, Vite, TypeScript |
| Storage | Redis |
| Infra | Docker, Nginx |

## Quick Start

```bash
git clone https://github.com/sweear/occlux.git
cd occlux
cp .env.example .env
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080)

## Configuration

Copy `.env.example` to `.env` and adjust:

```env
OCCLUX_PORT=8080
OCCLUX_REDIS_URL=redis://:password@localhost:6379/0
```

See `.env.example` for all available options.

## How It Works

1. User types a secret and picks view limit + TTL
2. Browser generates a random AES-256-GCM key and encrypts the secret locally
3. Encrypted blob is sent to the server and stored in Redis with the chosen TTL
4. The decryption key travels only in the URL fragment (`#key`) — never sent to the server
5. Recipient opens the link → browser decrypts locally → secret is decremented or deleted
