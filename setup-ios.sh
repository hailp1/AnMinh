#!/bin/bash

# Script tự động setup Capacitor cho iOS
# Chạy trên Mac: chmod +x setup-ios.sh && ./setup-ios.sh

echo "🚀 Bắt đầu setup iOS build..."

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt. Vui lòng cài Node.js trước."
    exit 1
fi

# Kiểm tra Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo "⚠️  Xcode chưa được cài đặt. Vui lòng cài Xcode từ App Store."
    exit 1
fi

echo "✅ Node.js và Xcode đã được cài đặt"

# Di chuyển vào thư mục client
cd client || exit

echo "📦 Đang cài đặt Capacitor..."
npm install @capacitor/core @capacitor/cli @capacitor/ios

echo "🔧 Đang khởi tạo Capacitor..."
npx cap init "An Minh" "com.ammedtech.anminh" --web-dir=build

echo "📱 Đang thêm iOS platform..."
npx cap add ios

echo "🔨 Đang build React app..."
npm run build

echo "🔄 Đang sync với Capacitor..."
npx cap sync ios

echo "✅ Hoàn tất!"
echo ""
echo "📋 Bước tiếp theo:"
echo "1. Mở Xcode: npx cap open ios"
echo "2. Cấu hình Signing & Capabilities"
echo "3. Chọn Team (Apple Developer Account)"
echo "4. Product → Archive"
echo "5. Distribute App → Ad Hoc"
echo ""
echo "📖 Xem chi tiết: BUILD_IOS_IPA.md"

