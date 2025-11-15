# 🚀 Quick Start: Build iOS .ipa File

## ⚡ Các Bước Nhanh

### 1. Setup (Chỉ làm 1 lần)

```bash
# Trên Mac
chmod +x setup-ios.sh
./setup-ios.sh
```

Script sẽ tự động:
- ✅ Cài đặt Capacitor
- ✅ Khởi tạo project
- ✅ Thêm iOS platform
- ✅ Build React app
- ✅ Sync với Capacitor

### 2. Build .ipa File

#### Bước 1: Mở Xcode

```bash
cd client
npx cap open ios
```

Hoặc dùng script:
```bash
chmod +x build-ios.sh
./build-ios.sh
```

#### Bước 2: Cấu hình trong Xcode

1. **Chọn Team:**
   - Click project "App" (sidebar trái)
   - Tab "Signing & Capabilities"
   - Chọn **Team** (Apple Developer Account)

2. **Kiểm tra Bundle ID:**
   - Bundle Identifier: `com.ammedtech.anminh`
   - Xcode sẽ tự tạo Provisioning Profile

#### Bước 3: Archive

1. **Product** → **Archive**
2. Đợi build xong
3. Window **Organizer** sẽ mở

#### Bước 4: Export .ipa

1. Chọn archive vừa tạo
2. Click **"Distribute App"**
3. Chọn **"Ad Hoc"** (cho tối đa 100 devices)
4. Chọn **Provisioning Profile**
5. Click **"Next"** → **"Export"**
6. Chọn thư mục lưu
7. ✅ File `.ipa` đã sẵn sàng!

---

## 📥 Cài Đặt .ipa

### Cách 1: AltStore (Miễn phí, dễ nhất)

1. Tải [AltStore](https://altstore.io/) trên Mac
2. Cài AltStore lên iPhone (qua Mac)
3. Mở AltStore trên iPhone
4. **My Apps** → **+** → Chọn file `.ipa`
5. Cài đặt

**Lưu ý:** App sẽ hết hạn sau 7 ngày (cần refresh qua AltStore).

### Cách 2: Sideloadly (Miễn phí)

1. Tải [Sideloadly](https://sideloadly.io/)
2. Kết nối iPhone
3. Chọn file `.ipa`
4. Nhập Apple ID (không cần Developer Account)
5. Cài đặt

**Lưu ý:** App sẽ hết hạn sau 7 ngày.

### Cách 3: Finder/iTunes (Cần Developer Account)

1. Kết nối iPhone với Mac
2. Mở **Finder** (hoặc iTunes)
3. Chọn device
4. Kéo thả file `.ipa` vào
5. Đồng bộ

**Lưu ý:** Cần Apple Developer Account ($99/năm) và device đã đăng ký UDID.

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

## ⚠️ Lưu Ý Quan Trọng

### Ad Hoc Distribution:
- ✅ Cài trên tối đa **100 devices**
- ✅ Không cần App Store
- ✅ Cần đăng ký **UDID** của devices trong Apple Developer Portal
- ✅ File `.ipa` có thể share qua email/website

### Đăng ký UDID:

1. Vào [Apple Developer Portal](https://developer.apple.com/account/)
2. **Certificates, Identifiers & Profiles**
3. **Devices** → **+**
4. Thêm UDID của iPhone/iPad
5. Tạo **Ad Hoc Provisioning Profile** mới với devices đã đăng ký

### Lấy UDID:

- **iPhone/iPad:** Settings → General → About → UDID (copy)
- **iTunes/Finder:** Kết nối device → Click vào device → UDID

---

## 🎯 Tóm Tắt

1. **Setup:** `./setup-ios.sh` (1 lần)
2. **Build:** `./build-ios.sh` hoặc `npx cap open ios`
3. **Archive:** Product → Archive
4. **Export:** Distribute App → Ad Hoc
5. **Cài:** AltStore/Sideloadly/Finder

---

## 📖 Chi Tiết

Xem hướng dẫn đầy đủ: **BUILD_IOS_IPA.md**

---

## 🔗 Links

- [Capacitor Docs](https://capacitorjs.com/docs/ios)
- [AltStore](https://altstore.io/)
- [Sideloadly](https://sideloadly.io/)
- [Apple Developer](https://developer.apple.com/)

