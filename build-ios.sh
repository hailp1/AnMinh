#!/bin/bash

# Script build iOS app nhanh
# Chạy sau khi đã setup: chmod +x build-ios.sh && ./build-ios.sh

echo "🔨 Building React app..."
cd client || exit
npm run build

echo "🔄 Syncing with Capacitor..."
npx cap sync ios

echo "🍎 Opening Xcode..."
npx cap open ios

echo "✅ Done!"
echo ""
echo "📋 Trong Xcode:"
echo "1. Product → Archive"
echo "2. Distribute App → Ad Hoc"
echo "3. Export .ipa file"

