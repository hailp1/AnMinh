# 🚀 Hướng dẫn Deploy lên Vercel với Domain ammedtech.com

## 📋 Tổng quan dự án

**SacVui - Trạm Sạc Thông Minh**
- **Framework**: React 18.2.0
- **Build Tool**: Create React App với react-app-rewired
- **Backend**: Node.js/Express (Serverless Functions trên Vercel)
- **Database**: Prisma với PostgreSQL (tùy chọn)
- **Deployment**: Vercel

---

## ✅ Kiểm tra trước khi deploy

### 1. Cấu trúc dự án
```
sacVui/
├── client/              # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── config-overrides.js
├── api/                 # Serverless functions
│   └── index.js
├── routes/              # API routes
├── vercel.json          # Vercel configuration
└── package.json
```

### 2. Files đã được cấu hình
- ✅ `vercel.json` - Cấu hình build và routing
- ✅ `api/index.js` - Serverless function entry point
- ✅ `client/config-overrides.js` - Build configuration
- ✅ `client/package.json` - Dependencies

---

## 🚀 Bước 1: Chuẩn bị GitHub Repository

### 1.1. Kiểm tra git status
```bash
git status
```

### 1.2. Commit các thay đổi (nếu có)
```bash
git add .
git commit -m "Prepare for production deployment to ammedtech.com"
```

### 1.3. Push lên GitHub
```bash
git push origin main
```

**Repository URL**: `https://github.com/Sacvui/charging-station-app`

---

## 🌐 Bước 2: Deploy lên Vercel

### 2.1. Truy cập Vercel Dashboard
👉 **Đi tới**: https://vercel.com/dashboard

### 2.2. Import Project từ GitHub
1. Click **"Add New..."** → **"Project"**
2. Chọn **"Import Git Repository"**
3. Tìm và chọn repository: **`Sacvui/charging-station-app`**
4. Click **"Import"**

### 2.3. Cấu hình Build Settings

**Project Name**: `sacvui-charging-station` (hoặc tên bạn muốn)

**Framework Preset**: `Other` hoặc `Create React App`

**Root Directory**: `./` (root của repository)

**Build Command**: 
```bash
cd client && npm ci && npm run build
```

**Output Directory**: 
```
client/build
```

**Install Command**: 
```bash
npm install
```

**Development Command**: 
```bash
cd client && npm start
```

### 2.4. Environment Variables (Tùy chọn)

Nếu bạn sử dụng database hoặc API keys, thêm vào đây:

```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your-super-secret-jwt-key-2024
NODE_ENV=production
```

**Lưu ý**: Hiện tại app sử dụng localStorage, không cần database ngay lập tức.

### 2.5. Deploy
1. Click **"Deploy"**
2. Chờ 3-5 phút để Vercel build và deploy
3. Nhận được URL production: `https://sacvui-charging-station.vercel.app`

---

## 🔗 Bước 3: Cấu hình Custom Domain (ammedtech.com)

### 3.1. Thêm Domain trong Vercel
1. Vào **Project Settings** → **Domains**
2. Click **"Add Domain"**
3. Nhập domain: `ammedtech.com`
4. Click **"Add"**

### 3.2. Cấu hình DNS

Vercel sẽ hiển thị các DNS records cần thêm. Thông thường:

**Option 1: A Record (Recommended)**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Option 2: CNAME Record**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

**Option 3: Subdomain (www)**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3.3. Cấu hình DNS tại nhà cung cấp domain

1. Đăng nhập vào tài khoản quản lý domain (Namecheap, GoDaddy, v.v.)
2. Vào phần **DNS Management** hoặc **Domain Management**
3. Thêm các records theo hướng dẫn từ Vercel
4. Lưu thay đổi

### 3.4. Chờ DNS Propagation
- Thời gian: **5 phút - 48 giờ** (thường là 15-30 phút)
- Kiểm tra: https://dnschecker.org/#A/ammedtech.com

### 3.5. Xác minh Domain
1. Quay lại Vercel Dashboard
2. Vào **Domains** trong project
3. Click **"Verify"** hoặc chờ tự động verify
4. Khi thấy ✅ **"Valid Configuration"** là thành công!

---

## 🔒 Bước 4: Cấu hình HTTPS (Tự động)

Vercel tự động cung cấp SSL certificate cho custom domain:
- ✅ HTTPS tự động được bật
- ✅ Certificate tự động renew
- ✅ HTTP tự động redirect sang HTTPS

---

## ✅ Bước 5: Kiểm tra Deployment

### 5.1. Test các trang chính
- ✅ **Home**: https://ammedtech.com/
- ✅ **Login**: https://ammedtech.com/login
- ✅ **Register**: https://ammedtech.com/register
- ✅ **Map**: https://ammedtech.com/map
- ✅ **Create Station**: https://ammedtech.com/create-station
- ✅ **Admin**: https://ammedtech.com/admin

### 5.2. Test API Routes (nếu có)
- ✅ **API Health**: https://ammedtech.com/api/health
- ✅ **API Auth**: https://ammedtech.com/api/auth/login

### 5.3. Test Responsive
- ✅ Mobile (< 768px)
- ✅ Tablet (768px - 1024px)
- ✅ Desktop (> 1024px)

### 5.4. Test Performance
- ✅ Lighthouse Score: Mục tiêu > 90
- ✅ First Contentful Paint: < 2s
- ✅ Time to Interactive: < 4s

---

## 🔄 Bước 6: Auto-Deploy Setup

Sau khi deploy lần đầu, Vercel sẽ tự động:
- ✅ Detect mọi push lên GitHub
- ✅ Tự động build project
- ✅ Tự động deploy lên production
- ✅ Gửi notification về kết quả

**Workflow**:
```bash
# Local development
git add .
git commit -m "Update features"
git push origin main

# Vercel tự động deploy! 🚀
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Built-in)
- Real User Monitoring
- Core Web Vitals
- Page Performance
- Error Tracking

### Truy cập Analytics
1. Vào Vercel Dashboard
2. Chọn project
3. Click tab **"Analytics"**

---

## 🐛 Troubleshooting

### Vấn đề 1: Build Failed
**Nguyên nhân**: Dependencies hoặc build command sai
**Giải pháp**:
1. Kiểm tra build logs trong Vercel
2. Test build local: `cd client && npm run build`
3. Kiểm tra `package.json` dependencies

### Vấn đề 2: 404 trên các routes
**Nguyên nhân**: Rewrite rules chưa đúng
**Giải pháp**:
- Kiểm tra `vercel.json` có rewrite rule: `"source": "/(.*)", "destination": "/index.html"`

### Vấn đề 3: Domain không hoạt động
**Nguyên nhân**: DNS chưa propagate hoặc cấu hình sai
**Giải pháp**:
1. Kiểm tra DNS records: https://dnschecker.org
2. Đợi 15-30 phút sau khi thêm DNS
3. Verify lại trong Vercel Dashboard

### Vấn đề 4: API không hoạt động
**Nguyên nhân**: Serverless function chưa được deploy
**Giải pháp**:
1. Kiểm tra `api/index.js` tồn tại
2. Kiểm tra `vercel.json` có rewrite rule cho `/api/*`
3. Xem logs trong Vercel Functions tab

---

## 📝 Environment Variables Checklist

Nếu cần thêm sau này:

```
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication
JWT_SECRET=your-secret-key-here

# API Keys
REACT_APP_MAPS_API_KEY=your-google-maps-key
REACT_APP_GEOCODING_API_KEY=your-geocoding-key

# Environment
NODE_ENV=production
```

---

## 🎯 Success Criteria

### ✅ Deployment thành công nếu:
- [ ] App load không có lỗi
- [ ] Tất cả pages render đúng
- [ ] User registration/login hoạt động
- [ ] Station creation hoạt động
- [ ] Mobile experience mượt mà
- [ ] Performance scores tốt (> 90)
- [ ] Domain ammedtech.com hoạt động
- [ ] HTTPS được bật tự động

---

## 📞 Support & Resources

### Vercel Documentation
- **Deployment Guide**: https://vercel.com/docs
- **Custom Domains**: https://vercel.com/docs/concepts/projects/domains
- **Serverless Functions**: https://vercel.com/docs/concepts/functions

### Project Links
- **Repository**: https://github.com/Sacvui/charging-station-app
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 🚀 Quick Deploy Checklist

- [ ] Code đã push lên GitHub
- [ ] Vercel project đã được tạo
- [ ] Build settings đã cấu hình đúng
- [ ] Environment variables đã thêm (nếu cần)
- [ ] Deploy lần đầu thành công
- [ ] Domain ammedtech.com đã thêm
- [ ] DNS records đã cấu hình
- [ ] Domain đã verify
- [ ] HTTPS đã active
- [ ] Tất cả pages đã test
- [ ] Performance đã kiểm tra
- [ ] Auto-deploy đã hoạt động

---

**Status**: 🟢 **READY FOR DEPLOYMENT**

**Estimated Deploy Time**: 5-10 phút (không tính DNS propagation)

**Next Action**: 
1. Push code lên GitHub
2. Import project vào Vercel
3. Cấu hình domain ammedtech.com
4. Deploy và verify! 🎉

---

*Last Updated: $(date)*
*Version: 1.0.0*

