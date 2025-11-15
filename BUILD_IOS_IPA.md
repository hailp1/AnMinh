# 📱 Hướng Dẫn Build File .ipa cho iOS (Không Cần App Store)

## 🎯 Mục Tiêu

Tạo file `.ipa` để cài đặt trực tiếp trên iPhone/iPad mà **không cần** đưa lên App Store.

---

## ✅ Yêu Cầu

### Bắt Buộc:
- ✅ **Mac computer** (macOS)
- ✅ **Xcode** (tải từ App Store, miễn phí)
- ✅ **Apple Developer Account** ($99/năm - Personal Developer)
- ✅ **Node.js** và **npm**

### Không Cần:
- ❌ App Store Connect
- ❌ App Store Review
- ❌ Public distribution

---

## 📦 Cài Đặt Capacitor

Capacitor sẽ convert web app thành native iOS app.

### Bước 1: Cài đặt Capacitor

```bash
cd client
npm install @capacitor/core @capacitor/cli @capacitor/ios
```

### Bước 2: Khởi tạo Capacitor

```bash
npx cap init "An Minh" "com.ammedtech.anminh"
```

Khi được hỏi:
- **App name**: `An Minh`
- **App ID**: `com.ammedtech.anminh`
- **Web dir**: `build` (sau khi build React)

### Bước 3: Thêm iOS Platform

```bash
npx cap add ios
```

---

## 🔧 Cấu Hình

### Bước 1: Build React App

```bash
cd client
npm run build
```

### Bước 2: Sync với Capacitor

```bash
npx cap sync ios
```

Lệnh này sẽ:
- Copy `build/` vào iOS project
- Cập nhật native dependencies
- Tạo iOS project trong `ios/` folder

---

## 🍎 Mở Xcode và Cấu Hình

### Bước 1: Mở Project

```bash
npx cap open ios
```

Hoặc mở thủ công:
```bash
open ios/App/App.xcworkspace
```

**Lưu ý:** Phải mở `.xcworkspace`, không phải `.xcodeproj`!

### Bước 2: Cấu Hình Signing

1. Chọn project **"App"** trong sidebar trái
2. Chọn target **"App"**
3. Tab **"Signing & Capabilities"**
4. Chọn **Team** (Apple Developer Account của bạn)
5. Xcode sẽ tự động tạo:
   - **Bundle Identifier**: `com.ammedtech.anminh`
   - **Provisioning Profile**

### Bước 3: Cấu Hình App Info

1. Tab **"General"**
2. **Display Name**: `An Minh`
3. **Bundle Identifier**: `com.ammedtech.anminh`
4. **Version**: `1.0.0`
5. **Build**: `1`

### Bước 4: Cấu Hình Icons và Splash

1. Tab **"App Icons and Launch Images"**
2. Kéo thả icon vào **AppIcon**
3. Icon sizes cần có:
   - 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

---

## 📦 Build .ipa File

### Phương Pháp 1: Ad Hoc Distribution (Khuyến nghị)

**Giới hạn:** Cài trên tối đa **100 devices** đã đăng ký UDID.

#### Bước 1: Đăng ký Devices

1. Vào [Apple Developer Portal](https://developer.apple.com/account/)
2. **Certificates, Identifiers & Profiles**
3. **Devices** → **+** (Add device)
4. Thêm UDID của iPhone/iPad cần cài
5. Lưu lại

#### Bước 2: Tạo Ad Hoc Provisioning Profile

1. **Profiles** → **+**
2. Chọn **"Ad Hoc"**
3. Chọn **App ID**: `com.ammedtech.anminh`
4. Chọn **Certificates**
5. Chọn **Devices** (tối đa 100)
6. Đặt tên: `An Minh Ad Hoc`
7. **Generate** và **Download**

#### Bước 3: Cài Provisioning Profile

1. Double-click file `.mobileprovision` đã download
2. Profile sẽ được cài vào Xcode

#### Bước 4: Archive và Export

1. Trong Xcode: **Product** → **Archive**
2. Đợi build xong
3. Window **Organizer** sẽ mở
4. Chọn archive vừa tạo
5. Click **"Distribute App"**
6. Chọn **"Ad Hoc"**
7. Chọn **Provisioning Profile** vừa tạo
8. Click **"Next"** → **"Export"**
9. Chọn thư mục lưu
10. File `.ipa` sẽ được tạo!

---

### Phương Pháp 2: Enterprise Distribution

**Yêu cầu:** Enterprise Developer Account ($299/năm)

**Ưu điểm:** Cài không giới hạn devices, không cần đăng ký UDID

#### Các bước tương tự Ad Hoc, nhưng:
1. Chọn **"Enterprise"** thay vì **"Ad Hoc"**
2. Cần **Enterprise Provisioning Profile**
3. Có thể distribute qua website/internal server

---

### Phương Pháp 3: Development Build

**Giới hạn:** Chỉ cài trên devices đã đăng ký trong team

1. **Product** → **Archive**
2. **Distribute App** → **"Development"**
3. Chọn devices
4. Export `.ipa`

---

## 📥 Cài Đặt .ipa File

### Cách 1: iTunes/Finder (macOS Catalina+)

1. Kết nối iPhone/iPad với Mac
2. Mở **Finder** (hoặc iTunes trên macOS cũ)
3. Chọn device
4. Kéo thả file `.ipa` vào
5. Đồng bộ

### Cách 2: AltStore (Miễn phí)

1. Tải [AltStore](https://altstore.io/)
2. Cài AltStore trên Mac
3. Cài AltStore trên iPhone (qua Mac)
4. Mở AltStore trên iPhone
5. **My Apps** → **+** → Chọn file `.ipa`
6. Cài đặt

### Cách 3: Sideloadly (Miễn phí)

1. Tải [Sideloadly](https://sideloadly.io/)
2. Kết nối iPhone
3. Chọn file `.ipa`
4. Nhập Apple ID (không cần Developer Account)
5. Cài đặt

**Lưu ý:** Sideloadly dùng free Apple ID, app sẽ hết hạn sau 7 ngày (cần cài lại).

### Cách 4: TestFlight (Beta Testing)

1. Upload `.ipa` lên [App Store Connect](https://appstoreconnect.apple.com/)
2. Thêm testers (tối đa 10,000)
3. Testers cài qua TestFlight app
4. Không cần App Store approval

---

## 🔄 Update App

Khi có bản cập nhật:

1. **Build React:**
   ```bash
   cd client
   npm run build
   ```

2. **Sync Capacitor:**
   ```bash
   npx cap sync ios
   ```

3. **Tăng Build Number** trong Xcode:
   - General → Build: `2`, `3`, ...

4. **Archive và Export** lại như trên

---

## 📋 Checklist

### Setup:
- [ ] Cài đặt Capacitor
- [ ] Khởi tạo Capacitor project
- [ ] Thêm iOS platform
- [ ] Build React app
- [ ] Sync với Capacitor

### Xcode:
- [ ] Mở project trong Xcode
- [ ] Cấu hình Signing & Capabilities
- [ ] Chọn Team
- [ ] Cấu hình App info
- [ ] Thêm App icons

### Build:
- [ ] Đăng ký devices (nếu Ad Hoc)
- [ ] Tạo Provisioning Profile
- [ ] Archive app
- [ ] Export .ipa

### Distribution:
- [ ] Chọn phương pháp (Ad Hoc/Enterprise/Development)
- [ ] Tạo file .ipa
- [ ] Cài đặt trên devices

---

## 🚀 Quick Start Script

Tạo file `build-ios.sh`:

```bash
#!/bin/bash

echo "🔨 Building React app..."
cd client
npm run build

echo "🔄 Syncing with Capacitor..."
npx cap sync ios

echo "🍎 Opening Xcode..."
npx cap open ios

echo "✅ Done! Build in Xcode: Product → Archive"
```

Chạy:
```bash
chmod +x build-ios.sh
./build-ios.sh
```

---

## ⚠️ Lưu Ý Quan Trọng

### Ad Hoc Distribution:
- ✅ Cài trên tối đa 100 devices
- ✅ Không cần App Store
- ✅ Cần đăng ký UDID trước
- ✅ File .ipa có thể share qua email/website

### Enterprise Distribution:
- ✅ Cài không giới hạn
- ✅ Không cần đăng ký UDID
- ❌ Cần Enterprise Account ($299/năm)
- ✅ Phù hợp cho công ty lớn

### Development Build:
- ✅ Dễ nhất
- ❌ Chỉ cài trên devices trong team
- ✅ Phù hợp cho testing

---

## 🔗 Links Hữu Ích

- [Capacitor iOS Guide](https://capacitorjs.com/docs/ios)
- [Apple Developer Portal](https://developer.apple.com/account/)
- [Xcode Download](https://apps.apple.com/app/xcode/id497799835)
- [AltStore](https://altstore.io/)
- [Sideloadly](https://sideloadly.io/)

---

## 📞 Troubleshooting

### Lỗi: "No signing certificate found"
→ Cần tạo Certificate trong Apple Developer Portal

### Lỗi: "Provisioning profile doesn't match"
→ Kiểm tra Bundle Identifier và Provisioning Profile

### Lỗi: "Device not registered"
→ Thêm UDID vào Apple Developer Portal

### Lỗi: "App installation failed"
→ Kiểm tra device đã trust developer certificate chưa (Settings → General → Device Management)

