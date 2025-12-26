# 🏥 An Minh DMS - Distribution Management System

**Version:** Pilot v1.0  
**Date:** December 2025  
**Status:** Production Ready ✅

---

## 📋 Overview

An Minh DMS is a comprehensive Distribution Management System designed for pharmaceutical distribution companies. The system manages sales representatives (TDV), customers (pharmacies), orders, inventory, delivery, and provides detailed analytics.

---

## 🎯 Features

### ✅ **Admin Portal** (Web)
- **Dashboard** - Real-time KPIs and analytics
- **User Management** - TDV, Admin, Delivery staff
- **Customer Management** - Pharmacy database with Excel import/export
- **Product Management** - Product catalog management
- **Order Management** - Visual workflow with status tracking
- **Inventory** - Warehouse, stock, batch tracking
- **Route Planning** - Territory and visit plan management
- **Reports & Analytics** - Compliance, sales, performance reports
- **GPS Tracking** - Real-time delivery staff location

### 📱 **TDV Mobile App** (React Native)
- Customer list with territory filtering
- Order creation and management
- Visit schedule tracking
- Check-in/check-out functionality
- GPS integration
- Offline support (planned)

### 🚚 **Delivery Module** (Mobile)
- Morning check-in at company (GPS verification)
- Delivery order list
- Real-time GPS tracking
- Delivery status updates
- Proof of delivery

---

## 🏗️ Architecture

```
AM_DMS/
├── DMS/
│   ├── backend/          # Node.js + Express + Prisma
│   ├── frontend/         # React.js (Admin Portal)
│   ├── mobile/           # React Native (TDV & Delivery)
│   └── portal/           # (Legacy/Optional)
├── home/
│   └── landing/          # Landing page (Vercel)
├── docker-compose.yml    # Multi-container setup
├── cloudflare-tunnel.yml # Tunnel configuration
└── backups/              # Database backups
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Database:** PostgreSQL 15
- **ORM:** Prisma
- **Authentication:** JWT
- **API:** RESTful

### Frontend (Admin)
- **Framework:** React.js
- **Routing:** React Router v6
- **Charts:** Recharts
- **Styling:** CSS-in-JS

### Mobile
- **Framework:** React Native
- **Navigation:** React Navigation
- **Storage:** AsyncStorage
- **Maps:** React Native Maps
- **GPS:** Geolocation Service

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Reverse Proxy:** Cloudflare Tunnel
- **Deployment:** Self-hosted
- **Landing Page:** Vercel

---

## 🚀 Quick Start - Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (optional, for local dev without Docker)

### Option 1: Docker (Recommended - Fastest)

**1. Start the system:**
```bash
cd d:\AM_DMS
scripts\START_LOCAL.bat
```

**2. Access the system:**
- **DMS Frontend:** http://localhost:3099
- **Backend API:** http://localhost:5001
- **Landing Page:** http://localhost:3000
- **Database:** localhost:5433

**3. Login:**
- Username: `admin`
- Password: `123456`

**4. Stop the system:**
```bash
scripts\STOP_LOCAL.bat
```

📖 **Detailed Guide:** See [HUONG_DAN_CHAY_LOCAL.md](HUONG_DAN_CHAY_LOCAL.md)

### Option 2: Manual Docker Commands

```bash
# Clone repository
git clone https://github.com/yourusername/am-dms.git
cd am-dms

# Start all services
docker-compose up -d

# Initialize database (first time only)
docker exec dms_backend npx prisma db push
scripts\SEED_COMPLETE_DATA.bat

# Access the system
# - DMS Frontend: http://localhost:3099
# - Backend API: http://localhost:5001
# - Landing Page: http://localhost:3000

# Stop services
docker-compose down
```

---

## 🌐 Production Deployment

### Publish to Production (via Cloudflare Tunnel)

**Quick Start:**
```bash
cd d:\AM_DMS
scripts\PUBLISH_PRODUCTION.bat
```

This will:
1. ✅ Check Docker and Cloudflare credentials
2. 🛑 Stop old containers
3. 🏗️ Build all services
4. 🚀 Start the system
5. 🌐 Connect Cloudflare Tunnel

**Production URLs:**
- **DMS System:** https://dms.ammedtech.com
- **Backend API:** https://dms.ammedtech.com/api
- **Landing Page:** https://ammedtech.com (Vercel)

**Management Commands:**
```bash
# Check system status
scripts\CHECK_PRODUCTION.bat

# Stop production
scripts\STOP_PRODUCTION.bat

# View logs
docker-compose -f docker-compose.yml logs -f

# Restart a service
docker-compose -f docker-compose.yml restart backend
```

**After Code Changes:**
```bash
# Rebuild backend
docker-compose -f docker-compose.yml up -d --build backend

# Rebuild frontend
docker-compose -f docker-compose.yml up -d --build frontend
```

📖 **Detailed Guide:** See [HUONG_DAN_PUBLISH_PRODUCTION.md](HUONG_DAN_PUBLISH_PRODUCTION.md)  
⚡ **Quick Reference:** See [QUICK_START_PUBLISH.md](QUICK_START_PUBLISH.md)

---

## 👥 Default Credentials

### Admin
- **URL:** `/Anminh/admin`
- **Username:** `admin`
- **Password:** `123456`

### TDV Sample
- **Employee Code:** `TDV001`
- **Password:** `123456`

### Delivery Staff
- **Employee Code:** `TX001`
- **Password:** `123456`

⚠️ **Change these in production!**

---

## 📊 Database Schema

Key models:
- **User** - Admin, TDV, Delivery staff
- **Pharmacy** - Customer database
- **Product** - Product catalog
- **Order** - Sales orders with workflow
- **Warehouse** - Inventory locations
- **InventoryTransaction** - Stock movements
- **VisitPlan** - Daily route planning
- **LocationTracking** - GPS tracking data

See `DMS/backend/prisma/schema.prisma` for complete schema.

---

## 🔧 Configuration

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/anminh_db"
JWT_SECRET="your-secret-key"
PORT=5000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CUSTOMER_ID=Anminh
```

### Mobile (.env)
```env
API_URL=http://your-server-ip:5000/api
```

---

## 📱 Mobile App Build

### Android
```bash
cd DMS/mobile
npm install
npx react-native run-android
```

### iOS
```bash
cd DMS/mobile
npm install
cd ios && pod install && cd ..
npx react-native run-ios
```

---

## 🔄 Backup & Restore

### Automatic Backup
```bash
# Setup daily backup (Windows Task Scheduler)
d:\AM_DMS\backup_database.bat
```

### Manual Backup
```bash
docker exec dms_postgres pg_dump -U postgres anminh_db > backup.sql
```

### Restore
```bash
docker exec -i dms_postgres psql -U postgres anminh_db < backup.sql
```

---

## 📈 Reports & KPIs

### Compliance Report Metrics
- **Plan Call** - Customers to visit
- **Visited Customer** - Actual visits
- **PC (Productive Call)** - Orders placed
- **Strike Rate** - Conversion rate (%)
- **Revenue** - Total sales
- **VPO** - Value per order
- **Check-in Time** - Daily start time
- **First Visit Time** - First customer visit

---

## 🔒 Security

- JWT authentication with expiry
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Rate limiting (200 req/15min)
- HTTPS via Cloudflare Tunnel
- Input validation with express-validator
- SQL injection protection (Prisma)

---

## 🧪 Testing

```bash
# Backend tests
cd DMS/backend
npm test

# Frontend tests
cd DMS/frontend
npm test

# E2E tests
npm run test:e2e
```

---

## 📚 Documentation

- [System Audit Report](SYSTEM_AUDIT_REPORT.md)
- [Medium Issues Plan](MEDIUM_ISSUES_PLAN.md)
- [Delivery Module Plan](DELIVERY_MODULE_PLAN.md)
- [GPS Tracking Guide](DELIVERY_GPS_TRACKING.md)
- [API Documentation](docs/API.md) (Coming soon)

---

## 🎯 Roadmap

### Phase 2 (Q1 2026)
- [ ] Mobile offline support
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Customer portal
- [ ] Integration APIs

### Phase 3 (Q2 2026)
- [ ] AI-powered route optimization
- [ ] Predictive analytics
- [ ] Mobile signature capture
- [ ] E-invoice integration

---

## 🤝 Contributing

This is a private project for An Minh Business. Contact the development team for contribution guidelines.

---

## 📄 License

Proprietary - An Minh Business System  
© 2025 An Minh Med Tech. All rights reserved.

---

## 👨‍💻 Development Team

- **Project Manager:** [Name]
- **Backend Lead:** [Name]
- **Frontend Lead:** [Name]
- **Mobile Lead:** [Name]

---

## 📞 Support

- **Email:** support@ammedtech.com
- **Website:** https://ammedtech.com
- **DMS Portal:** https://dms.ammedtech.com

---

## 🔖 Version History

### v1.0 - Pilot (Dec 2025)
- ✅ Complete admin portal
- ✅ TDV mobile app
- ✅ Delivery module with GPS
- ✅ Reports & analytics
- ✅ Docker deployment
- ✅ Production ready

---

**Built with ❤️ for efficient pharmaceutical distribution**
