# 🐳 Docker Setup - DMS System

## 📋 Tổng Quan

Docker setup hoàn chỉnh cho AM Medtech DMS System bao gồm:
- **PostgreSQL** - Database
- **Backend API** - Node.js + Express + Prisma
- **Frontend** - React + Nginx
- **Cloudflare Tunnel** - Optional (cho production)

---

## 🚀 Quick Start (5 Phút)

### Bước 1: Chuẩn Bị Environment

```bash
cd d:\newNCSKITORG\newNCSkit\AM_BS

# Copy environment template
copy .env.docker.example .env

# Edit .env với editor của bạn
notepad .env
```

**Quan trọng**: Thay đổi các giá trị sau trong `.env`:
- `POSTGRES_PASSWORD` - Mật khẩu database
- `JWT_SECRET` - Secret key (tối thiểu 32 ký tự)
- `CLOUDFLARE_TUNNEL_TOKEN` - Nếu dùng tunnel

### Bước 2: Build Docker Images

```bash
# Chạy script build
BUILD_DOCKER.bat

# Hoặc manual:
docker-compose build
```

### Bước 3: Start Containers

```bash
# Chạy script
RUN_DOCKER.bat

# Hoặc manual:
docker-compose up -d
```

### Bước 4: Verify

```bash
# Check containers
docker-compose ps

# View logs
docker-compose logs -f

# Test endpoints
curl http://localhost:5001/api
curl http://localhost:3099
```

---

## 📦 Services

### PostgreSQL Database
- **Port**: 5433 (host) → 5432 (container)
- **User**: postgres (configurable)
- **Database**: anminh_db
- **Data**: Persistent volume `dms_postgres_data`

### Backend API
- **Port**: 5001 (host) → 5000 (container)
- **Tech**: Node.js 20 + Express + Prisma
- **Health**: http://localhost:5001/api
- **Logs**: `docker-compose logs backend`

### Frontend
- **Port**: 3099 (host) → 80 (container)
- **Tech**: React + Nginx
- **Health**: http://localhost:3099/health
- **Logs**: `docker-compose logs frontend`

### Cloudflare Tunnel (Optional)
- **Status**: Disabled by default
- **Enable**: `docker-compose --profile tunnel up -d`
- **Requires**: CLOUDFLARE_TUNNEL_TOKEN in .env

---

## 🔧 Configuration

### Environment Variables

File: `.env`

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=anminh_db
POSTGRES_PORT=5433

# Backend
BACKEND_PORT=5001
JWT_SECRET=your_32_character_minimum_secret_key

# Frontend
FRONTEND_PORT=3099
FRONTEND_ORIGIN=https://dms.ammedtech.com

# Optional: Cloudflare Tunnel
CLOUDFLARE_TUNNEL_TOKEN=your_token
```

### Ports

Default ports (configurable via .env):
- **5433**: PostgreSQL
- **5001**: Backend API
- **3099**: Frontend

---

## 🛠️ Common Commands

### Start/Stop

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data!)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Execute Commands

```bash
# Backend shell
docker-compose exec backend sh

# Database shell
docker-compose exec postgres psql -U postgres -d anminh_db

# Run Prisma commands
docker-compose exec backend npx prisma studio
docker-compose exec backend npx prisma db push
```

---

## 🔄 Development Workflow

### 1. Code Changes

```bash
# After changing backend code
docker-compose restart backend

# After changing frontend code
docker-compose build frontend
docker-compose up -d frontend
```

### 2. Database Migrations

```bash
# Run migrations
docker-compose exec backend npx prisma db push

# View database
docker-compose exec backend npx prisma studio
```

### 3. View Logs

```bash
# Real-time logs
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│   Docker Network: dms_network           │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │  Frontend    │  │  Backend     │   │
│  │  (Nginx)     │  │  (Node.js)   │   │
│  │  :80         │  │  :5000       │   │
│  └──────┬───────┘  └──────┬───────┘   │
│         │                  │            │
│         │    ┌─────────────┘            │
│         │    │                          │
│  ┌──────▼────▼──────┐                  │
│  │  PostgreSQL      │                  │
│  │  :5432           │                  │
│  └──────────────────┘                  │
│                                         │
└─────────────────────────────────────────┘
         │
         │ (Optional)
         ▼
┌─────────────────────┐
│ Cloudflare Tunnel   │
│ dms.ammedtech.com   │
└─────────────────────┘
```

---

## 🔐 Security

### Production Checklist

- [ ] Change default passwords in `.env`
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS (ENFORCE_HTTPS=true)
- [ ] Restrict database port (don't expose 5433 publicly)
- [ ] Use Cloudflare Tunnel for public access
- [ ] Regular backups of postgres_data volume
- [ ] Monitor logs for suspicious activity

### Backup Database

```bash
# Backup
docker-compose exec postgres pg_dump -U postgres anminh_db > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres anminh_db < backup.sql
```

---

## 🆘 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Check container status
docker-compose ps

# Rebuild
docker-compose build --no-cache backend
docker-compose up -d
```

### Database Connection Error

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check DATABASE_URL in .env
# Should match: postgresql://user:password@postgres:5432/database

# Restart backend
docker-compose restart backend
```

### Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :5001

# Kill process
taskkill /PID <PID> /F

# Or change port in .env
BACKEND_PORT=5002
```

### Frontend Can't Connect to Backend

```bash
# Check nginx config
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf

# Check backend is healthy
curl http://localhost:5001/api

# Check logs
docker-compose logs frontend
docker-compose logs backend
```

---

## 📊 Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:5001/api

# Frontend health
curl http://localhost:3099/health

# Database health
docker-compose exec postgres pg_isready -U postgres
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

---

## 🚀 Production Deployment

### With Cloudflare Tunnel

1. **Get Tunnel Token**:
   ```bash
   cloudflared tunnel create dms
   cloudflared tunnel token dms
   ```

2. **Add to .env**:
   ```env
   CLOUDFLARE_TUNNEL_TOKEN=your_token_here
   ```

3. **Start with Tunnel**:
   ```bash
   docker-compose --profile tunnel up -d
   ```

### Without Tunnel (Direct)

1. **Setup Reverse Proxy** (Nginx/Caddy)
2. **Configure SSL** (Let's Encrypt)
3. **Point to**:
   - Frontend: localhost:3099
   - Backend: localhost:5001

---

## 📝 Files Created

```
AM_BS/
├── Dockerfile                    # Backend image
├── docker-entrypoint.sh          # Backend startup script
├── docker-compose.yml            # Main compose file
├── .env.docker.example           # Environment template
├── BUILD_DOCKER.bat              # Build script
├── RUN_DOCKER.bat                # Start script
├── STOP_DOCKER.bat               # Stop script
└── client/
    ├── Dockerfile                # Frontend image
    └── nginx.conf                # Nginx config
```

---

## ✅ Checklist

### Initial Setup
- [ ] Copy .env.docker.example to .env
- [ ] Edit .env with your settings
- [ ] Run BUILD_DOCKER.bat
- [ ] Run RUN_DOCKER.bat
- [ ] Verify all services are running
- [ ] Test http://localhost:3099
- [ ] Test http://localhost:5001/api

### Production
- [ ] Strong passwords in .env
- [ ] Cloudflare Tunnel configured
- [ ] Database backups scheduled
- [ ] Monitoring setup
- [ ] Logs rotation configured

---

**Ready to start?** Run `BUILD_DOCKER.bat` then `RUN_DOCKER.bat`! 🚀
