# Sửa nhanh Auto-Deploy Vercel

## Vấn đề
Vercel đã kết nối GitHub nhưng không tự động deploy khi push code.

## Giải pháp nhanh (5 phút)

### Bước 1: Kiểm tra trong Vercel Dashboard
1. Vào: https://vercel.com/dashboard
2. Chọn project `sapharco`
3. Vào **Settings** → **Git**

### Bước 2: Kiểm tra Production Branch
- Production Branch phải là: **`main`**
- Nếu là `master`, đổi thành `main`

### Bước 3: Kiểm tra Auto-Deploy
- Vào **Settings** → **Git** → **Deployment Protection**
- Đảm bảo: **"Auto-deploy from Production Branch"** = **Enabled**

### Bước 4: Kiểm tra Build Settings
Vào **Settings** → **General** → **Build & Development Settings**

Đảm bảo:
```
Root Directory: ./
Build Command: cd client && npm ci && npm run build
Output Directory: client/build
Install Command: npm install
Node.js Version: 18.x (hoặc 20.x)
```

### Bước 5: Test ngay
```bash
# Push một commit test
git add .
git commit -m "Test auto-deploy"
git push origin main
```

Sau đó vào **Deployments** tab và xem có deployment mới không.

## Nếu vẫn không hoạt động

### Option 1: Reconnect Repository
1. **Settings** → **Git** → **Disconnect**
2. **Connect Git Repository** lại
3. Chọn `Sacvui/sapharco`
4. Chọn branch `main`

### Option 2: Manual Deploy để test
1. Vào **Deployments**
2. Click **"..."** → **"Redeploy"**
3. Xem Build Logs để tìm lỗi

### Option 3: Kiểm tra Webhook
1. Vào GitHub: https://github.com/Sacvui/sapharco/settings/hooks
2. Kiểm tra có webhook từ Vercel không
3. Nếu không có → Vercel sẽ tự tạo khi reconnect

## Lỗi thường gặp

### "Build Command failed"
→ Kiểm tra `client/package.json` có script `build` không

### "Output Directory not found"
→ Đảm bảo build command chạy thành công và tạo folder `client/build`

### "Module not found"
→ Chạy `cd client && npm install` và commit `package-lock.json`

## Checklist
- [ ] Production branch = `main`
- [ ] Auto-deploy = Enabled
- [ ] Build command đúng
- [ ] Output directory đúng
- [ ] Node version = 18.x hoặc 20.x
- [ ] Đã test push commit mới

