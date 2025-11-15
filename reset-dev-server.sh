#!/bin/bash
# Script to reset dev server and clear localStorage

echo "🔄 Resetting Dev Server and Clearing localStorage..."

# Step 1: Clear localStorage instructions
echo ""
echo "📋 Hướng dẫn xóa localStorage:"
echo "1. Mở trình duyệt và vào trang admin: http://localhost:3099/admin/reset"
echo "2. Hoặc mở Console (F12) và chạy lệnh:"
echo "   localStorage.clear()"
echo "   location.reload()"

# Step 2: Stop any running Node processes
echo ""
echo "🛑 Đang dừng các process Node.js..."
pkill -f "node.*react-scripts" || pkill -f "node.*react-app-rewired" || echo "ℹ️  Không có Node.js process nào đang chạy"

# Step 3: Clear npm cache (optional)
echo ""
echo "🧹 Đang xóa npm cache..."
cd client
npm cache clean --force
echo "✅ Đã xóa npm cache"

# Step 4: Start dev server
echo ""
echo "🚀 Đang khởi động lại dev server..."
echo "   Port: 3099"
sleep 1

# Start server in background
npm start &

cd ..

echo ""
echo "✅ Hoàn tất!"
echo ""
echo "📝 Lưu ý:"
echo "   - Dev server đang chạy trên port 3099"
echo "   - Vào http://localhost:3099/admin/reset để xóa localStorage"
echo "   - Hoặc mở Console (F12) và chạy: localStorage.clear()"

