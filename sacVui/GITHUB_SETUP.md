# Hướng dẫn Push lên GitHub và Deploy Vercel

## Bước 1: Authenticate GitHub
Bạn cần đăng nhập GitHub trước:

### Cách 1: Sử dụng GitHub CLI (khuyến nghị)
```bash
# Cài GitHub CLI
winget install --id GitHub.cli

# Đăng nhập
gh auth login

# Push code
git push -u origin master
```

### Cách 2: Sử dụng Personal Access Token
1. Vào GitHub.com > Settings > Developer settings > Personal access tokens
2. Tạo token mới với quyền `repo`
3. Copy token
4. Chạy lệnh:
```bash
git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/Sacvui/1st.git
git push -u origin master
```

### Cách 3: Sử dụng GitHub Desktop
1. Tải GitHub Desktop
2. Đăng nhập tài khoản
3. Add existing repository
4. Push to GitHub

## Bước 2: Deploy lên Vercel từ GitHub

1. **Vào Vercel.com và đăng nhập**
2. **Import Project từ GitHub:**
   - Click "New Project"
   - Chọn repository `Sacvui/1st`
   - Click "Import"

3. **Cấu hình Build Settings:**
   - Framework Preset: `Other`
   - Build Command: `npm run vercel-build`
   - Output Directory: `client/build`
   - Install Command: `npm install`

4. **Thêm Environment Variables:**
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your-super-secret-jwt-key-2024
   ```

5. **Deploy:**
   - Click "Deploy"
   - Vercel sẽ tự động build và deploy

## Bước 3: Tạo Database và Migration

1. **Tạo Supabase Database:**
   - Vào https://supabase.com
   - Tạo project mới
   - Copy connection string

2. **Chạy Migration:**
   ```bash
   # Cài Vercel CLI
   npm i -g vercel

   # Link project
   vercel link

   # Chạy migration
   vercel env pull .env.local
   npx prisma db push
   ```

## Bước 4: Auto-Deploy
Từ giờ, mỗi khi push code lên GitHub, Vercel sẽ tự động deploy!

```bash
git add .
git commit -m "Update features"
git push
```

## Lưu ý:
- Vercel sẽ tự động detect changes và redeploy
- Database chỉ cần setup 1 lần
- Có thể xem logs trong Vercel Dashboard