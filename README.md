# 🚀 SacVui - Trạm Sạc Thông Minh

## 📱 **Giới thiệu**
SacVui là ứng dụng web kết nối người dùng với mạng lưới trạm sạc pin xe máy điện thông minh tại Việt Nam. Ứng dụng cung cấp giải pháp toàn diện cho việc tìm kiếm, đặt chỗ và quản lý trạm sạc.

## ✨ **Tính năng chính**

### 👥 **Cho người dùng:**
- 🔍 **Tìm trạm sạc**: Tìm kiếm trạm sạc gần nhất
- 🗺️ **Bản đồ tương tác**: Xem vị trí trạm sạc trên bản đồ
- ⚡ **Thông tin chi tiết**: Loại sạc, giá cả, thời gian
- 📱 **Đặt chỗ trước**: Đặt trước slot sạc
- 💬 **Chat hỗ trợ**: Liên hệ với chủ trạm
- ⭐ **Đánh giá**: Đánh giá và nhận xét trạm sạc
- 👤 **Quản lý hồ sơ**: Thông tin cá nhân và lịch sử

### 🏪 **Cho chủ trạm:**
- ➕ **Đăng ký trạm**: Thêm trạm sạc mới
- 📊 **Quản lý trạm**: Theo dõi tình trạng và doanh thu
- 💰 **Thiết lập giá**: Cấu hình giá sạc linh hoạt
- 📈 **Thống kê**: Báo cáo doanh thu và sử dụng
- 🔧 **Bảo trì**: Quản lý tình trạng thiết bị

### 👨‍💼 **Cho quản trị viên:**
- 🎛️ **Dashboard**: Tổng quan hệ thống
- 👥 **Quản lý người dùng**: Duyệt và quản lý tài khoản
- 🏪 **Quản lý trạm**: Phê duyệt trạm mới
- 📊 **Báo cáo**: Thống kê toàn hệ thống

## 🛠️ **Công nghệ sử dụng**

### Frontend:
- **React** 18.2.0 - UI Framework
- **React Router DOM** 6.3.0 - Routing
- **Leaflet** 1.9.4 - Interactive maps
- **Axios** 1.4.0 - HTTP client
- **CSS3** - Modern styling với gradients và animations

### Backend & Services:
- **Node.js** - Runtime environment
- **Express.js** - Web framework (planned)
- **MongoDB** - Database (planned)
- **Socket.io** - Real-time communication (planned)

### Deployment:
- **Vercel** - Frontend hosting
- **GitHub** - Version control
- **CI/CD** - Automated deployment

## 🚀 **Cài đặt và chạy dự án**

### Yêu cầu hệ thống:
- Node.js >= 16.0.0
- npm >= 8.0.0

### Cài đặt:
```bash
# Clone repository
git clone https://github.com/Sacvui/charging-station-app.git
cd charging-station-app

# Cài đặt dependencies
cd client
npm install

# Chạy development server
npm start
```

### Truy cập ứng dụng:
- **Local**: http://localhost:3000
- **Production**: https://your-app.vercel.app

## 📁 **Cấu trúc dự án**

```
charging-station-app/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── hooks/         # Custom hooks
│   │   ├── data/          # Static data
│   │   ├── utils/         # Utility functions
│   │   └── styles.css     # Main stylesheet
│   └── package.json
├── docs/                  # Documentation
├── scripts/               # Build scripts
└── README.md
```

## 🌐 **Pages và Routes**

| Route | Component | Mô tả |
|-------|-----------|-------|
| `/` | Onboarding | Trang chào mừng |
| `/home` | Home | Dashboard chính |
| `/login` | Login | Đăng nhập |
| `/register` | QuickRegister | Đăng ký nhanh |
| `/nearby` | NearbyStations | Trạm gần đây |
| `/map` | Map | Bản đồ tương tác |
| `/station/:id` | StationDetail | Chi tiết trạm |
| `/create-station` | CreateStation | Tạo trạm mới |
| `/profile` | Profile | Hồ sơ người dùng |
| `/admin` | AdminDashboard | Quản trị |
| `/chat/:userId` | Chat | Chat hỗ trợ |

## 🎨 **Design System**

### Colors:
- **Primary**: iOS Blue (#007AFF)
- **Success**: iOS Green (#34C759)
- **Warning**: iOS Orange (#FF9500)
- **Danger**: iOS Red (#FF3B30)
- **Info**: iOS Teal (#5AC8FA)

### Typography:
- **Font**: SF Pro Display, Segoe UI, Roboto
- **Sizes**: 12px - 48px responsive scale

### Components:
- **Cards**: Glass morphism với backdrop blur
- **Buttons**: Gradient backgrounds với hover effects
- **Forms**: Modern input styling với focus states
- **Navigation**: Sticky navbar với blur background

## 📱 **Responsive Design**

- **Mobile First**: Thiết kế ưu tiên mobile
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

## 🔧 **Development**

### Available Scripts:
```bash
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
npm run lint       # Code linting
```

### Environment Variables:
```env
REACT_APP_API_URL=your_api_url
REACT_APP_MAPS_API_KEY=your_maps_key
```

## 🚀 **Deployment**

### Vercel (Recommended):
1. Connect GitHub repository
2. Configure build settings:
   - Framework: Create React App
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`

### Manual Deployment:
```bash
cd client
npm run build
# Deploy build folder to your hosting service
```

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 **Team**

- **SacVui Team** - Development Team
- **Contact**: [GitHub Issues](https://github.com/Sacvui/charging-station-app/issues)

## 🔗 **Links**

- **Repository**: https://github.com/Sacvui/charging-station-app
- **Issues**: https://github.com/Sacvui/charging-station-app/issues
- **Documentation**: [docs/](docs/)

---

**🚀 SacVui - Kết nối thông minh, sạc pin tiện lợi!**