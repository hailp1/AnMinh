# 📱 Hướng Dẫn Build và Cài Đặt App trên iOS

## 🎯 Tổng Quan

Dự án này đã được cấu hình như **Progressive Web App (PWA)**, có thể cài đặt trên iOS như một ứng dụng native.

---

## ✅ Đã Cấu Hình

- ✅ `manifest.json` - Cấu hình PWA
- ✅ `service-worker.js` - Offline support
- ✅ iOS meta tags trong `index.html`
- ✅ Apple touch icons

---

## 📦 Cách 1: Cài Đặt Trực Tiếp trên iOS (Khuyến nghị)

### Bước 1: Build Production

```bash
cd client
npm run build
```

### Bước 2: Deploy lên Server

Build files sẽ ở trong `client/build/`. Upload lên server hoặc dùng Docker:

```bash
docker-compose up -d --build frontend
```

### Bước 3: Cài Đặt trên iPhone/iPad

1. **Mở Safari** trên iPhone/iPad (không dùng Chrome/Firefox)
2. Truy cập: **https://sales.ammedtech.com**
3. Click nút **Share** (hình vuông với mũi tên lên)
4. Chọn **"Add to Home Screen"** (Thêm vào Màn hình chính)
5. Đặt tên: **"An Minh"**
6. Click **"Add"**

### Kết quả:
- ✅ App icon xuất hiện trên Home Screen
- ✅ Mở như app native (không có thanh địa chỉ Safari)
- ✅ Có thể dùng offline (với service worker)

---

## 📦 Cách 2: Build Native iOS App (React Native)

Nếu muốn tạo **native iOS app** thực sự (cần App Store), cần chuyển sang React Native:

### Option A: React Native WebView

Tạo app React Native wrapper cho web app:

```bash
# Tạo React Native project
npx react-native init AnMinhApp --template react-native-template-typescript

# Cài đặt WebView
npm install react-native-webview
```

### Option B: Capacitor (Ionic)

Chuyển đổi web app thành native app:

```bash
# Cài đặt Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios

# Khởi tạo
npx cap init "An Minh" "com.ammedtech.anminh"

# Thêm iOS platform
npx cap add ios

# Build và sync
npm run build
npx cap sync ios

# Mở Xcode
npx cap open ios
```

---

## 📦 Cách 3: Build .ipa File (Cần Mac + Xcode)

### Yêu cầu:
- ✅ Mac computer
- ✅ Xcode installed
- ✅ Apple Developer Account ($99/năm)
- ✅ Certificates và Provisioning Profiles

### Các bước:

1. **Dùng Capacitor** (như trên)
2. **Mở Xcode:**
   ```bash
   npx cap open ios
   ```
3. **Cấu hình trong Xcode:**
   - Chọn Team (Apple Developer Account)
   - Bundle Identifier: `com.ammedtech.anminh`
   - Signing & Capabilities
4. **Build:**
   - Product → Archive
   - Distribute App
   - Chọn method (App Store, Ad Hoc, Enterprise)
5. **Export .ipa:**
   - Chọn "Save for Ad Hoc Distribution" hoặc "Enterprise Distribution"
   - Lưu file `.ipa`

---

## 🔧 Cấu Hình Chi Tiết

### 1. Icon Sizes cho iOS

Tạo các icon sizes:
- 180x180 (iPhone)
- 120x120 (iPhone)
- 152x152 (iPad)
- 167x167 (iPad Pro)

Đặt trong `client/public/image/`:
- `icon-180.png`
- `icon-120.png`
- `icon-152.png`
- `icon-167.png`

Cập nhật `index.html`:
```html
<link rel="apple-touch-icon" sizes="180x180" href="/image/icon-180.png" />
<link rel="apple-touch-icon" sizes="120x120" href="/image/icon-120.png" />
<link rel="apple-touch-icon" sizes="152x152" href="/image/icon-152.png" />
<link rel="apple-touch-icon" sizes="167x167" href="/image/icon-167.png" />
```

### 2. Splash Screen

Thêm splash screen cho iOS trong `index.html`:
```html
<link rel="apple-touch-startup-image" href="/image/splash-iphone.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
```

### 3. Service Worker Update

Service worker đã được cấu hình để:
- Cache static assets
- Hoạt động offline
- Bỏ qua API requests (luôn dùng network)

---

## 🚀 Quick Start (PWA)

### 1. Build:
```bash
cd client
npm run build
```

### 2. Deploy:
```bash
docker-compose up -d --build frontend
```

### 3. Test trên iOS:
- Mở Safari
- Truy cập https://sales.ammedtech.com
- Add to Home Screen

---

## 📋 Checklist

### PWA (Cách 1):
- [x] manifest.json
- [x] service-worker.js
- [x] iOS meta tags
- [x] Apple touch icons
- [ ] Build production
- [ ] Deploy lên server
- [ ] Test trên iOS Safari
- [ ] Add to Home Screen

### Native App (Cách 2/3):
- [ ] Cài đặt React Native hoặc Capacitor
- [ ] Cấu hình iOS project
- [ ] Apple Developer Account
- [ ] Certificates
- [ ] Build .ipa
- [ ] Test trên device
- [ ] Submit App Store (nếu cần)

---

## 🎯 Khuyến Nghị

**Cho nhu cầu hiện tại:** Dùng **Cách 1 (PWA)** vì:
- ✅ Không cần Mac
- ✅ Không cần Apple Developer Account
- ✅ Không cần Xcode
- ✅ Cài đặt nhanh
- ✅ Hoạt động như native app
- ✅ Có thể update ngay lập tức

**Chỉ cần native app nếu:**
- Cần publish lên App Store
- Cần truy cập native features (camera, GPS, notifications)
- Cần performance cao hơn

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra HTTPS (bắt buộc cho PWA)
2. Kiểm tra service worker trong DevTools
3. Clear cache và reload
4. Kiểm tra manifest.json trong DevTools → Application

---

## 🔗 Links Hữu Ích

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [iOS PWA Guide](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [React Native Documentation](https://reactnative.dev/)

