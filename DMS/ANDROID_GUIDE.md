# Hướng dẫn Build App Android cho TDV (An Minh DMS)

Dự án Frontend hiện tại đã được tích hợp **Capacitor**, cho phép build thành ứng dụng Android native một cách dễ dàng.

## 1. Cấu hình Kết nối API

App Android sẽ chạy như một ứng dụng độc lập trên điện thoại, vì vậy nó cần biết địa chỉ của Backend API để kết nối.

### Cách 1: Kết nối với Server Production (Khuyên dùng khi release)
Nếu bạn muốn app kết nối với server thật (`https://dms.ammedtech.com`), hãy tạo/sửa file `.env.production` trong thư mục `frontend`:

```env
REACT_APP_API_URL=https://dms.ammedtech.com/api
```

### Cách 2: Kết nối với Máy tính Local (Để test)
Nếu bạn đang chạy backend trên máy tính và muốn điện thoại kết nối vào:
1. Tìm địa chỉ IP LAN của máy tính (Ví dụ: `192.168.1.10`).
2. Đảm bảo điện thoại và máy tính dùng chung mạng Wifi.
3. Sửa file `.env` hoặc `.env.development`:

```env
REACT_APP_API_URL=http://192.168.1.10:5000/api
```

## 2. Cấu hình Capacitor

Mở file `frontend/capacitor.config.json`.

Để app chạy nhanh và ổn định (load code từ trong app thay vì tải từ web), hãy **XÓA** phần `server.url`:

```json
{
  "appId": "com.ammedtech.anminh",
  "appName": "An Minh DMS",
  "webDir": "build",
  "bundledWebRuntime": false,
  "plugins": {
    ...
  }
}
```

*Lưu ý: Nếu bạn giữ `server.url`, app sẽ chỉ hoạt động như một trình duyệt web trỏ tới trang web đó.*

## 3. Quy trình Build

Thực hiện các lệnh sau trong thư mục `frontend`:

1.  **Cài đặt dependencies** (nếu chưa):
    ```bash
    npm install
    ```

2.  **Build React App**:
    Lệnh này sẽ tạo thư mục `build` chứa code frontend đã được tối ưu.
    ```bash
    npm run build
    ```

3.  **Thêm Platform Android** (nếu chưa):
    ```bash
    npx cap add android
    ```

4.  **Đồng bộ code vào Android**:
    Lệnh này copy thư mục `build` vào trong project Android.
    ```bash
    npx cap sync
    ```

5.  **Mở Android Studio**:
    ```bash
    npx cap open android
    ```

## 4. Trong Android Studio

1.  Đợi Android Studio sync Gradle xong.
2.  Kết nối điện thoại Android qua USB (bật USB Debugging) hoặc dùng Emulator.
3.  Nhấn nút **Run (▶)** để cài app lên điện thoại.

## 5. Lưu ý về Cleartext Traffic (Nếu dùng HTTP Local)

Nếu bạn kết nối tới `http://192.168.x.x` (không phải https), Android có thể chặn. Bạn cần cho phép cleartext traffic:

Mở `android/app/src/main/AndroidManifest.xml` và thêm `android:usesCleartextTraffic="true"` vào thẻ `<application>`:

```xml
<application
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    android:label="@string/app_name"
    android:usesCleartextTraffic="true"  <-- THÊM DÒNG NÀY
    ... >
```

## 6. Debug

Nếu app không kết nối được API:
1.  Mở Chrome trên máy tính, gõ `chrome://inspect`.
2.  Chọn thiết bị Android của bạn.
3.  Bạn sẽ thấy Console log của app, kiểm tra xem API request có bị lỗi mạng không.
