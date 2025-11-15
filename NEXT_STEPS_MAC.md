# 🍎 Bước Tiếp Theo Trên Mac

## ✅ Đã Hoàn Thành (Trên Windows)

- ✅ Đã cài đặt Capacitor: `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`
- ✅ Đã build React app: `client/build/` đã sẵn sàng
- ✅ Đã tạo `capacitor.config.json` trong `client/` folder

---

## 🚀 Các Bước Trên Mac

### Bước 1: Khởi tạo Capacitor

```bash
cd client
npx cap init "An Minh" "com.ammedtech.anminh" --web-dir=build
```

**Lưu ý:** Nếu hỏi có muốn overwrite config, chọn **Yes** (để giữ cấu hình đã tạo).

### Bước 2: Thêm iOS Platform

```bash
npx cap add ios
```

Lệnh này sẽ tạo folder `ios/` với Xcode project.

### Bước 3: Sync với Capacitor

```bash
npx cap sync ios
```

Lệnh này sẽ:
- Copy `build/` vào iOS project
- Cập nhật native dependencies
- Sẵn sàng để mở trong Xcode

### Bước 4: Mở Xcode

```bash
npx cap open ios
```

Hoặc mở thủ công:
```bash
open ios/App/App.xcworkspace
```

**⚠️ QUAN TRỌNG:** Phải mở `.xcworkspace`, không phải `.xcodeproj`!

---

## 🔧 Cấu Hình Trong Xcode

### 1. Chọn Team (Signing)

1. Click project **"App"** trong sidebar trái
2. Chọn target **"App"**
3. Tab **"Signing & Capabilities"**
4. Chọn **Team** (Apple Developer Account của bạn)
5. Xcode sẽ tự động:
   - Tạo Bundle Identifier: `com.ammedtech.anminh`
   - Tạo Provisioning Profile

### 2. Cấu Hình App Info

1. Tab **"General"**
2. **Display Name**: `An Minh`
3. **Bundle Identifier**: `com.ammedtech.anminh`
4. **Version**: `1.0.0`
5. **Build**: `1`

### 3. Thêm App Icons (Tùy chọn)

1. Tab **"App Icons and Launch Images"**
2. Kéo thả icon vào **AppIcon**
3. Icon sizes cần có:
   - 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

---

## 📦 Build .ipa File

### Bước 1: Archive

1. **Product** → **Archive**
2. Đợi build xong (có thể mất vài phút)
3. Window **Organizer** sẽ tự động mở

### Bước 2: Export .ipa

1. Chọn archive vừa tạo trong Organizer
2. Click **"Distribute App"**
3. Chọn **"Ad Hoc"** (cho tối đa 100 devices)
4. Chọn **Provisioning Profile** (Xcode tự tạo)
5. Click **"Next"** → **"Export"**
6. Chọn thư mục lưu
7. ✅ File `.ipa` đã sẵn sàng!

---

## 📥 Cài Đặt .ipa

### Cách 1: AltStore (Khuyến nghị - Miễn phí)

1. Tải [AltStore](https://altstore.io/) trên Mac
2. Cài AltStore lên iPhone (qua Mac)
3. Mở AltStore trên iPhone
4. **My Apps** → **+** → Chọn file `.ipa`
5. Cài đặt

**Lưu ý:** App sẽ hết hạn sau 7 ngày (cần refresh qua AltStore).

### Cách 2: Sideloadly (Miễn phí)

1. Tải [Sideloadly](https://sideloadly.io/)
2. Kết nối iPhone với Mac
3. Chọn file `.ipa`
4. Nhập Apple ID (không cần Developer Account)
5. Cài đặt

**Lưu ý:** App sẽ hết hạn sau 7 ngày.

### Cách 3: Finder (Cần Developer Account)

1. Kết nối iPhone với Mac
2. Mở **Finder**
3. Chọn device trong sidebar
4. Kéo thả file `.ipa` vào
5. Đồng bộ

**Lưu ý:** 
- Cần Apple Developer Account ($99/năm)
- Device phải được đăng ký UDID trong Apple Developer Portal

---

## ⚠️ Lưu Ý Quan Trọng

### Ad Hoc Distribution:
- ✅ Cài trên tối đa **100 devices**
- ✅ Không cần App Store
- ✅ Cần đăng ký **UDID** của devices (nếu dùng Ad Hoc)
- ✅ File `.ipa` có thể share qua email/website

### Đăng ký UDID (Nếu cần):

1. Vào [Apple Developer Portal](https://developer.apple.com/account/)
2. **Certificates, Identifiers & Profiles**
3. **Devices** → **+**
4. Thêm UDID của iPhone/iPad
5. Tạo **Ad Hoc Provisioning Profile** mới với devices đã đăng ký

### Lấy UDID:
- **iPhone/iPad:** Settings → General → About → UDID (copy)
- **iTunes/Finder:** Kết nối device → Click vào device → UDID

---

## 🔄 Update App

Khi có bản cập nhật:

```bash
cd client
npm run build
npx cap sync ios
npx cap open ios
```

Trong Xcode:
1. Tăng **Build Number** (General → Build: 2, 3, ...)
2. **Product** → **Archive**
3. **Distribute App** → **Ad Hoc**
4. Export `.ipa` mới

---

## 📋 Checklist

- [ ] Đã cài Xcode trên Mac
- [ ] Đã có Apple Developer Account
- [ ] Đã chạy `npx cap init`
- [ ] Đã chạy `npx cap add ios`
- [ ] Đã chạy `npx cap sync ios`
- [ ] Đã mở project trong Xcode
- [ ] Đã chọn Team trong Signing
- [ ] Đã Archive app
- [ ] Đã Export .ipa file
- [ ] Đã cài đặt trên iPhone

---

## 🎯 Tóm Tắt

1. **Khởi tạo:** `npx cap init` (1 lần)
2. **Thêm iOS:** `npx cap add ios` (1 lần)
3. **Sync:** `npx cap sync ios` (mỗi lần build)
4. **Mở Xcode:** `npx cap open ios`
5. **Archive:** Product → Archive
6. **Export:** Distribute App → Ad Hoc
7. **Cài:** AltStore/Sideloadly/Finder

---

## 📖 Chi Tiết

Xem hướng dẫn đầy đủ: **BUILD_IOS_IPA.md** và **QUICK_IOS_BUILD.md**

---

## 🔗 Links

- [Capacitor iOS Docs](https://capacitorjs.com/docs/ios)
- [AltStore](https://altstore.io/)
- [Sideloadly](https://sideloadly.io/)
- [Apple Developer](https://developer.apple.com/)

