# Hướng dẫn kết nối Vercel với GitHub và Verify

## ✅ Đã sửa lỗi vercel.json

Lỗi pattern đã được sửa. File `vercel.json` hiện tại đã đúng format.

## Cách 1: Kết nối qua Vercel Dashboard (Khuyến nghị - Dễ nhất)

### Bước 1: Đăng nhập Vercel
1. Truy cập: https://vercel.com
2. Click **"Sign Up"** hoặc **"Log In"**
3. Chọn **"Continue with GitHub"**
4. Cấp quyền truy cập GitHub

### Bước 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Chọn **"Import Git Repository"**
3. Nếu chưa kết nối GitHub:
   - Click **"Configure GitHub App"**
   - Chọn repository cần kết nối
   - Click **"Install"**
4. Tìm và chọn repository: **`Sacvui/sapharco`**
5. Click **"Import"**

### Bước 3: Cấu hình Project
Vercel sẽ tự động phát hiện cấu hình từ `vercel.json`, nhưng hãy kiểm tra:

**Project Name:** `sapharco` (hoặc tên bạn muốn)

**Framework Preset:** Other

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
Nếu có biến môi trường:
- Vào **Settings** → **Environment Variables**
- Thêm các biến như: `DATABASE_URL`, `JWT_SECRET`, etc.

### Bước 5: Deploy
1. Click **"Deploy"**
2. Vercel sẽ tự động:
   - Clone code từ GitHub
   - Install dependencies
   - Build project
   - Deploy lên Vercel

### Bước 6: Verify Deployment
Sau khi deploy thành công:
- URL sẽ là: `https://sapharco.vercel.app` (hoặc tên bạn chọn)
- Kiểm tra build logs để đảm bảo không có lỗi

## Cách 2: Sử dụng Vercel CLI

### Bước 1: Login
```bash
npx vercel login
```

### Bước 2: Link Project
```bash
npx vercel link --yes
```

Chọn:
- **Set up and deploy?** → Yes
- **Which scope?** → Chọn tài khoản của bạn
- **Link to existing project?** → No (tạo mới)
- **Project name?** → `sapharco`
- **Directory?** → `./`

### Bước 3: Deploy Production
```bash
npx vercel --prod
```

### Bước 4: Kết nối với GitHub
1. Vào Vercel Dashboard: https://vercel.com/dashboard
2. Chọn project `sapharco`
3. Vào **Settings** → **Git**
4. Click **"Connect Git Repository"**
5. Chọn **`Sacvui/sapharco`**
6. Chọn branch: **`main`**
7. Click **"Save"**

## Verify cấu hình vercel.json

File `vercel.json` đã được sửa và đúng format:

```json
{
  "version": 2,
  "buildCommand": "cd client && npm ci && npm run build",
  "outputDirectory": "client/build",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/static/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
    // ... các headers khác cho static files
  ]
}
```

## Lỗi đã sửa

**Lỗi cũ:**
```json
"source": "/(.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))"
```

**Đã sửa thành:**
- Tách thành các pattern riêng biệt cho từng loại file
- Sử dụng format `/:path*.extension` thay vì regex

## Auto Deploy Setup

Sau khi kết nối GitHub, Vercel sẽ tự động:
- ✅ Deploy mỗi khi có push lên branch `main`
- ✅ Tạo Preview Deployment cho mỗi Pull Request
- ✅ Tự động build và deploy khi có thay đổi

## Kiểm tra Auto Deploy

1. Push code mới:
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
- Đảm bảo Node version >= 16.0.0
- Kiểm tra `package.json` có đúng scripts không

### Lỗi Pattern trong vercel.json
- Đã sửa: Tách pattern thành các rule riêng biệt
- Format đúng: `/:path*.extension`

### Lỗi API Routes
- Đảm bảo file `api/index.js` tồn tại
- Kiểm tra rewrite rules trong `vercel.json`

## Next Steps

1. ✅ Deploy project lên Vercel
2. ✅ Kết nối với GitHub repository
3. ✅ Test auto deploy
4. ✅ Cấu hình custom domain (nếu cần)

