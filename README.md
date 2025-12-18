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

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- PostgreSQL 15+ (or use Docker)

### Installation

1. **Clone repository**
```bash
git clone https://github.com/yourusername/am-dms.git
cd am-dms
```

2. **Setup environment variables**
```bash
# Backend
cp DMS/backend/.env.example DMS/backend/.env
# Edit DMS/backend/.env with your settings

# Frontend
cp DMS/frontend/.env.example DMS/frontend/.env
# Edit DMS/frontend/.env
```

3. **Start with Docker**
```bash
docker-compose up -d
```

4. **Initialize database**
```bash
docker exec dms_backend npx prisma db push
docker exec dms_backend npx prisma db seed
```

5. **Access the system**
- Admin Portal: http://localhost:3001
- Backend API: http://localhost:5000
- Landing Page: http://localhost:3000

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
