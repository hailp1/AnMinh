# 🏥 Sapharco Sales - Hệ thống quản lý bán hàng cho Trình dược viên

## 📱 Giới thiệu

**Sapharco Sales** là ứng dụng web quản lý bán hàng chuyên nghiệp dành cho Trình dược viên (Pharmaceutical Representatives) tại các nhà thuốc. Ứng dụng giúp quản lý khách hàng, đặt đơn hàng, theo dõi doanh thu và tối ưu hóa quy trình bán hàng.

## ✨ Tính năng chính

### 👨‍⚕️ Cho Trình dược viên:
- 🏥 **Quản lý nhà thuốc**: Xem danh sách nhà thuốc phụ trách theo Hub
- 📋 **Tạo đơn hàng**: Chọn nhà thuốc, sản phẩm và số lượng
- 💊 **Danh mục sản phẩm**: Quản lý nhóm sản phẩm và sản phẩm
- 📊 **Lịch sử mua hàng**: Xem lịch sử đơn hàng của nhà thuốc
- 💰 **Thống kê doanh thu**: Theo dõi doanh thu 3 tháng gần nhất
- 🗺️ **Bản đồ tương tác**: Xem vị trí nhà thuốc và đồng nghiệp
- 💬 **Chat với đồng nghiệp**: Liên hệ với các Trình dược viên khác
- 📱 **Tối ưu mobile**: Giao diện responsive, tối ưu cho điện thoại

### 🏪 Cho Nhà thuốc:
- 📝 **Đăng ký thông tin**: Đăng ký và cập nhật thông tin nhà thuốc
- 📍 **Quản lý Hub**: Phân loại theo Hub phụ trách (Trung tâm, Củ Chi, Đồng Nai)
- 📸 **Hình ảnh**: Upload hình ảnh nhà thuốc

### 🚚 Cho Giao hàng:
- 📦 **Quản lý đơn hàng**: Xem và xử lý đơn hàng cần giao
- 🗺️ **Tối ưu tuyến đường**: Xem vị trí khách hàng trên bản đồ

## 🎨 Bảng màu

Dự án sử dụng bảng màu chuyên nghiệp:

- **Xanh bích (Primary)**: `#1a5ca2` - Màu chủ đạo
- **Xanh ngọc (Secondary)**: `#3eb4a8` - Màu phụ
- **Vàng (Accent)**: `#e5aa42` - Màu nhấn

## 🛠️ Công nghệ sử dụng

### Frontend:
- **React** 18.2.0 - UI Framework
- **React Router DOM** 6.3.0 - Routing
- **Leaflet** 1.9.4 - Interactive maps
- **Axios** 1.4.0 - HTTP client
- **CSS3** - Modern styling với gradients và animations

### Backend & Services:
- **Node.js** - Runtime environment
- **Express.js** 4.18.2 - Web framework
- **Prisma** 5.7.1 - ORM (planned)
- **PostgreSQL** - Database (planned)

### Deployment:
- **Vercel** - Frontend hosting với auto-deploy từ GitHub
- **GitHub** - Version control
- **CI/CD** - Automated deployment

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống:
- Node.js >= 16.0.0
- npm >= 8.0.0

### Cài đặt:

```bash
# Clone repository
git clone https://github.com/Sacvui/sapharco.git
cd sapharco

# Cài đặt dependencies cho root
npm install

# Cài đặt dependencies cho client
cd client
npm install

# Quay lại root
cd ..
```

### Chạy Development Server:

```bash
# Từ root directory
npm start

# Hoặc từ client directory
cd client
npm start
```

### Truy cập ứng dụng:
- **Local**: http://localhost:3000 (hoặc port được cấu hình)
- **Production**: https://sapharco.vercel.app

## 📁 Cấu trúc dự án

```
sapharco/
├── client/                 # React frontend
│   ├── public/            # Static files
│   │   └── image/         # Images (logo, etc.)
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   └── PageTransition.js
│   │   ├── pages/         # Page components
│   │   │   ├── Home.js
│   │   │   ├── CreateOrder.js
│   │   │   ├── CreatePharmacy.js
│   │   │   ├── OrderSummary.js
│   │   │   ├── StationDetail.js
│   │   │   └── ...
│   │   ├── context/       # React context
│   │   │   └── AuthContext.js
│   │   ├── data/          # Static data
│   │   │   ├── customers.json
│   │   │   ├── products.json
│   │   │   └── provinces.json
│   │   ├── utils/         # Utility functions
│   │   │   └── mockData.js
│   │   └── styles-production.css
│   └── package.json
├── api/                    # API routes (Vercel serverless)
│   └── index.js
├── server.js              # Express server
├── routes/                # API routes
├── vercel.json            # Vercel configuration
├── package.json
└── README.md
```

## 🌐 Pages và Routes

| Route | Component | Mô tả |
|-------|-----------|-------|
| `/` | Onboarding | Trang chào mừng |
| `/home` | Home | Dashboard chính - Các nhà thuốc chăm sóc |
| `/login` | Login | Đăng nhập |
| `/register` | QuickRegister | Đăng ký nhanh (Nhà thuốc, Trình dược viên, Giao hàng) |
| `/map` | Map | Bản đồ - Nhà thuốc phụ trách và Đồng nghiệp |
| `/station/:id` | StationDetail | Chi tiết nhà thuốc (Lịch sử, Doanh thu, SP đề nghị) |
| `/create-pharmacy` | CreatePharmacy | Thêm nhà thuốc mới |
| `/edit-pharmacy/:id` | CreatePharmacy | Cập nhật thông tin nhà thuốc |
| `/create-order` | CreateOrder | Tạo đơn hàng mới |
| `/order-summary` | OrderSummary | Tổng kết đơn hàng |
| `/profile` | Profile | Hồ sơ người dùng |
| `/chat/:userId` | Chat | Chat với đồng nghiệp |

## 👥 Vai trò người dùng

### 1. Trình dược viên (PHARMACY_REP)
- Chọn Hub phụ trách: Trung tâm, Củ Chi, Đồng Nai
- Xem danh sách nhà thuốc trong Hub
- Tạo đơn hàng cho nhà thuốc
- Xem lịch sử mua hàng và doanh thu
- Chat với đồng nghiệp

### 2. Nhà thuốc (PHARMACY)
- Đăng ký thông tin nhà thuốc
- Xem lịch sử đơn hàng
- Quản lý thông tin

### 3. Giao hàng (DELIVERY)
- Xem danh sách đơn hàng cần giao
- Quản lý tuyến đường

## 📊 Quy trình tạo đơn hàng

1. **Chọn nhà thuốc**: Tìm và chọn nhà thuốc từ danh sách
2. **Chọn sản phẩm**: 
   - Chọn nhóm sản phẩm
   - Chọn sản phẩm cụ thể
   - Nhập số lượng
3. **Thêm vào đơn hàng**: Xác nhận và thêm sản phẩm
4. **Xem lại**: Kiểm tra đơn hàng trước khi hoàn tất
5. **Hoàn tất**: Tạo đơn hàng và xem tổng kết

## 🎨 Design System

### Colors:
- **Primary Blue**: `#1a5ca2` - Màu chủ đạo
- **Secondary Teal**: `#3eb4a8` - Màu phụ
- **Accent Yellow**: `#e5aa42` - Màu nhấn

### Typography:
- **Font**: SF Pro Display, Segoe UI, Roboto
- **Sizes**: Responsive từ 12px - 48px

### Components:
- **Cards**: Modern cards với gradient backgrounds
- **Buttons**: Gradient buttons với hover effects
- **Forms**: Modern input styling với focus states
- **Navigation**: Sticky navbar với blur background

## 📱 Responsive Design

- **Mobile First**: Thiết kế ưu tiên mobile
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

## 🔧 Development

### Available Scripts:

```bash
# Root directory
npm start          # Start development server
npm run build      # Production build
npm run dev        # Development mode

# Client directory
cd client
npm start          # Start React dev server (port 3000)
npm run build      # Build for production
npm test           # Run tests
```

### Environment Variables:

Tạo file `.env` trong thư mục `client/`:

```env
PORT=3089
REACT_APP_API_URL=your_api_url
REACT_APP_MAPS_API_KEY=your_maps_key
```

## 🚀 Deployment

### Vercel (Recommended):

1. **Kết nối GitHub repository**:
   - Vào Vercel Dashboard
   - Import project từ GitHub
   - Chọn repository: `Sacvui/sapharco`

2. **Cấu hình Build Settings**:
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: cd client && npm ci && npm run build
   Output Directory: client/build
   Install Command: npm install
   Node.js Version: 18.x
   ```

3. **Auto-deploy**:
   - Vercel tự động deploy khi có push lên branch `main`
   - Xem hướng dẫn chi tiết: [VERCEL_AUTO_DEPLOY_FIX.md](VERCEL_AUTO_DEPLOY_FIX.md)

### Manual Deployment:

```bash
# Build project
cd client
npm ci
npm run build

# Deploy build folder to your hosting service
```

## 📦 Dữ liệu mẫu

Dự án sử dụng dữ liệu mẫu trong các file JSON:

- `client/src/data/customers.json` - Danh sách nhà thuốc
- `client/src/data/products.json` - Danh mục sản phẩm
- `client/src/data/provinces.json` - Danh sách tỉnh thành

## 🔐 Authentication

- Đăng ký bằng số điện thoại
- Cache số điện thoại đã đăng ký
- Phân quyền theo vai trò (Trình dược viên, Nhà thuốc, Giao hàng)
- Local storage cho authentication

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Đăng ký người dùng với vai trò
- ✅ Quản lý nhà thuốc theo Hub
- ✅ Tạo và quản lý đơn hàng
- ✅ Bản đồ tương tác
- ✅ Chat với đồng nghiệp
- ✅ Thống kê doanh thu
- ✅ Responsive design cho mobile

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Sapharco Sales Team** - Development Team
- **Contact**: [GitHub Issues](https://github.com/Sacvui/sapharco/issues)

## 🔗 Links

- **Repository**: https://github.com/Sacvui/sapharco
- **Issues**: https://github.com/Sacvui/sapharco/issues
- **Vercel Deployment**: https://sapharco.vercel.app

## 📚 Documentation

- [VERCEL_AUTO_DEPLOY_FIX.md](VERCEL_AUTO_DEPLOY_FIX.md) - Hướng dẫn sửa auto-deploy Vercel
- [VERCEL_QUICK_FIX.md](VERCEL_QUICK_FIX.md) - Hướng dẫn nhanh Vercel
- [VERCEL_SETUP_INSTRUCTIONS.md](VERCEL_SETUP_INSTRUCTIONS.md) - Hướng dẫn setup Vercel

---

**🏥 Sapharco Sales - Quản lý đơn hàng - Hiệu quả tối ưu!**
