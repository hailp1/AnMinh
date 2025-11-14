# Hướng dẫn kết nối Vercel với GitHub để Auto Deploy

## Cách 1: Kết nối qua Vercel Dashboard (Khuyến nghị)

### Bước 1: Đăng nhập Vercel
1. Truy cập: https://vercel.com
2. Đăng nhập bằng tài khoản GitHub của bạn

### Bước 2: Import Project từ GitHub
1. Click vào **"Add New..."** → **"Project"**
2. Chọn **"Import Git Repository"**
3. Nếu chưa kết nối GitHub, click **"Configure GitHub App"** hoặc **"Import"**
4. Chọn repository: **`Sacvui/sapharco`**
5. Click **"Import"**

### Bước 3: Cấu hình Project Settings
Vercel sẽ tự động phát hiện cấu hình từ `vercel.json`, nhưng bạn cần kiểm tra:

**Framework Preset:** Other (hoặc để trống)

**Root Directory:** `./` (root của project)

**Build Command:**
```bash
cd client && npm ci && npm run build
```

**Output Directory:**
```
client/build
```

**Install Command:**
```bash
npm install
```

### Bước 4: Environment Variables (nếu cần)
Nếu có biến môi trường, thêm vào:
- Settings → Environment Variables
- Thêm các biến như: `DATABASE_URL`, `JWT_SECRET`, etc.

### Bước 5: Deploy
1. Click **"Deploy"**
2. Vercel sẽ tự động build và deploy project
3. Sau khi deploy thành công, bạn sẽ có URL: `https://sapharco.vercel.app`

### Bước 6: Cấu hình Custom Domain (nếu cần)
1. Vào **Settings** → **Domains**
2. Thêm domain: `ammedtech.com`
3. Làm theo hướng dẫn để cấu hình DNS

## Cách 2: Sử dụng Vercel CLI

### Bước 1: Cài đặt Vercel CLI
```bash
npm install -g vercel
```

### Bước 2: Đăng nhập Vercel
```bash
vercel login
```

### Bước 3: Link project với GitHub
```bash
vercel link
```

Chọn:
- **Set up and deploy?** → Yes
- **Which scope?** → Chọn tài khoản của bạn
- **Link to existing project?** → No (tạo mới)
- **Project name?** → `sapharco` (hoặc tên bạn muốn)
- **Directory?** → `./`

### Bước 4: Deploy
```bash
vercel --prod
```

### Bước 5: Kết nối với GitHub Repository
1. Vào Vercel Dashboard
2. Chọn project vừa tạo
3. Vào **Settings** → **Git**
4. Click **"Connect Git Repository"**
5. Chọn **`Sacvui/sapharco`**
6. Chọn branch: **`main`**
7. Click **"Save"**

## Auto Deploy Setup

Sau khi kết nối GitHub, Vercel sẽ tự động:
- ✅ Deploy mỗi khi có push lên branch `main`
- ✅ Tạo Preview Deployment cho mỗi Pull Request
- ✅ Tự động build và deploy khi có thay đổi

## Kiểm tra Auto Deploy

1. Push code mới lên GitHub:
```bash
git add .
git commit -m "Test auto deploy"
git push origin main
```

2. Vào Vercel Dashboard → **Deployments**
3. Bạn sẽ thấy deployment mới được tạo tự động

## Troubleshooting

### Lỗi Build
- Kiểm tra **Build Logs** trong Vercel Dashboard
- Đảm bảo `vercel.json` được cấu hình đúng
- Kiểm tra Node version (cần >= 16.0.0)

### Lỗi Environment Variables
- Vào **Settings** → **Environment Variables**
- Thêm các biến cần thiết cho Production

### Lỗi API Routes
- Đảm bảo file `api/index.js` tồn tại
- Kiểm tra `vercel.json` có rewrite rules đúng

## Cấu hình hiện tại

File `vercel.json` đã được cấu hình với:
- ✅ Build Command: `cd client && npm ci && npm run build`
- ✅ Output Directory: `client/build`
- ✅ API Routes: `/api/*` → `/api/index.js`
- ✅ Frontend Routes: `/*` → `/index.html`
- ✅ Cache Headers cho static assets

## Lưu ý

1. **GitHub Repository:** `https://github.com/Sacvui/sapharco.git`
2. **Branch mặc định:** `main`
3. **Node Version:** >= 16.0.0 (Vercel tự động phát hiện)
4. **Build Timeout:** 60 giây (có thể tăng trong Settings)

## Next Steps

Sau khi setup xong:
1. ✅ Test deployment đầu tiên
2. ✅ Cấu hình custom domain (nếu cần)
3. ✅ Thêm environment variables
4. ✅ Kiểm tra auto deploy bằng cách push code mới

