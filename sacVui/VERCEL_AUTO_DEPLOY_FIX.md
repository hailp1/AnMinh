# Hướng dẫn sửa lỗi Auto-Deploy trên Vercel

## Vấn đề
GitHub đã có code nhưng Vercel chưa tự động deploy khi có push mới.

## Các bước kiểm tra và sửa

### 1. Kiểm tra cấu hình trong Vercel Dashboard

#### Bước 1: Vào Project Settings
1. Truy cập: https://vercel.com/dashboard
2. Chọn project `sapharco`
3. Vào **Settings** → **Git**

#### Bước 2: Kiểm tra Git Repository Connection
- Đảm bảo repository: `Sacvui/sapharco`
- Production Branch: `main` (hoặc `master`)
- ✅ Đã kết nối thành công

#### Bước 3: Kiểm tra Build & Development Settings
Vào **Settings** → **General** → **Build & Development Settings**

**Cấu hình đúng:**
```
Framework Preset: Other
Root Directory: ./
Build Command: cd client && npm ci && npm run build
Output Directory: client/build
Install Command: npm install
```

**Node.js Version:** `18.x` hoặc `20.x`

### 2. Kiểm tra Branch Settings

Vào **Settings** → **Git** → **Production Branch**

- Production Branch: `main`
- Preview Branches: `*` (tất cả branches)

### 3. Kiểm tra Deployment Triggers

Vào **Settings** → **Git** → **Deployment Protection**

Đảm bảo:
- ✅ Auto-deploy từ Production Branch: **Enabled**
- ✅ Auto-deploy từ Preview Branches: **Enabled**

### 4. Test Auto-Deploy

#### Cách 1: Tạo test commit
```bash
git add .
git commit -m "Test auto-deploy"
git push origin main
```

Sau khi push, kiểm tra:
1. Vào Vercel Dashboard → **Deployments**
2. Bạn sẽ thấy deployment mới được tạo tự động
3. Xem **Build Logs** để kiểm tra lỗi (nếu có)

#### Cách 2: Trigger manual deployment
1. Vào **Deployments** tab
2. Click **"..."** menu trên deployment mới nhất
3. Chọn **"Redeploy"**

### 5. Kiểm tra Build Logs

Nếu deployment fail, kiểm tra:

1. Vào **Deployments** → Click vào deployment failed
2. Xem **Build Logs** tab
3. Tìm lỗi phổ biến:

**Lỗi thường gặp:**

#### Lỗi 1: "Build Command failed"
```
Error: Build Command failed
```
**Giải pháp:**
- Kiểm tra `vercel.json` có đúng không
- Đảm bảo `client/package.json` có script `build`
- Kiểm tra Node version trong Vercel (nên dùng 18.x hoặc 20.x)

#### Lỗi 2: "Module not found"
```
Error: Cannot find module 'xxx'
```
**Giải pháp:**
- Đảm bảo `package.json` có đầy đủ dependencies
- Chạy `npm install` trong `client/` directory
- Commit `package-lock.json` nếu có

#### Lỗi 3: "Output Directory not found"
```
Error: Output Directory "client/build" not found
```
**Giải pháp:**
- Đảm bảo build command chạy thành công
- Kiểm tra `client/build` folder có được tạo sau khi build

### 6. Cập nhật cấu hình Vercel (nếu cần)

Nếu cấu hình trong Dashboard khác với `vercel.json`, Vercel sẽ ưu tiên cấu hình trong Dashboard.

**Khuyến nghị:** Để cấu hình trong `vercel.json` để dễ quản lý.

### 7. Kiểm tra Webhook từ GitHub

1. Vào GitHub repository: https://github.com/Sacvui/sapharco
2. Vào **Settings** → **Webhooks**
3. Kiểm tra có webhook từ Vercel không
4. Nếu không có, Vercel sẽ tự tạo khi bạn kết nối repository

### 8. Kiểm tra Environment Variables (nếu cần)

Nếu app cần environment variables:

1. Vào Vercel Dashboard → **Settings** → **Environment Variables**
2. Thêm các biến cần thiết:
   - `NODE_ENV=production`
   - `REACT_APP_API_URL=...` (nếu cần)
   - Các biến khác...

### 9. Force Reconnect Git Repository

Nếu vẫn không hoạt động:

1. Vào **Settings** → **Git**
2. Click **"Disconnect"** repository
3. Click **"Connect Git Repository"** lại
4. Chọn `Sacvui/sapharco`
5. Chọn branch `main`
6. Click **"Save"**

### 10. Kiểm tra Vercel CLI (nếu dùng)

Nếu bạn đã dùng Vercel CLI để link project:

```bash
# Kiểm tra project đã link chưa
npx vercel ls

# Nếu chưa link, link lại
npx vercel link

# Deploy thủ công để test
npx vercel --prod
```

## Cấu hình đúng trong vercel.json

File `vercel.json` hiện tại đã đúng:

```json
{
  "version": 2,
  "buildCommand": "cd client && npm ci && npm run build",
  "outputDirectory": "client/build",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [...],
  "headers": [...]
}
```

## Checklist để Auto-Deploy hoạt động

- [ ] Repository đã kết nối trong Vercel Dashboard
- [ ] Production branch: `main`
- [ ] Auto-deploy enabled trong Git settings
- [ ] Build command đúng: `cd client && npm ci && npm run build`
- [ ] Output directory đúng: `client/build`
- [ ] Node version: 18.x hoặc 20.x
- [ ] `vercel.json` đã commit vào repository
- [ ] Test push một commit mới và kiểm tra deployment

## Troubleshooting nhanh

### Nếu deployment không tự động chạy:
1. Vào **Deployments** → Xem có deployment mới không
2. Nếu không có → Kiểm tra webhook từ GitHub
3. Nếu có nhưng failed → Xem Build Logs để tìm lỗi

### Nếu build fail:
1. Copy error message từ Build Logs
2. Kiểm tra local build có chạy được không:
   ```bash
   cd client
   npm ci
   npm run build
   ```
3. Nếu local build fail → Sửa lỗi trước
4. Nếu local build OK → Kiểm tra cấu hình Vercel

### Nếu cần hỗ trợ thêm:
- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support

## Test ngay

Sau khi kiểm tra các bước trên, test bằng cách:

```bash
# Tạo một thay đổi nhỏ
echo "# Test auto-deploy" >> README.md

# Commit và push
git add README.md
git commit -m "Test: Trigger auto-deploy"
git push origin main
```

Sau đó vào Vercel Dashboard → **Deployments** và xem deployment mới có được tạo tự động không.

