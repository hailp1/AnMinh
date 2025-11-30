# Thiết Kế Kiến Trúc Hệ Thống An Minh DMS (Hybrid Architecture)

## 1. Tổng Quan
Hệ thống An Minh DMS (Distribution Management System) được thiết kế theo mô hình **Hybrid**, kết hợp giữa **Web App** (cho quản trị/văn phòng) và **Mobile App** (cho Trình Dược Viên - TDV) chạy song song trên cùng một Backend.

Mục tiêu: Tối ưu hóa trải nghiệm người dùng theo đặc thù công việc, đảm bảo tính ổn định, hiệu năng và khả năng mở rộng.

## 2. Sơ Đồ Kiến Trúc (High-Level Diagram)

```mermaid
graph TD
    subgraph "Clients"
        WebApp[Web App (ReactJS)] -->|HTTPS/REST API| API_Gateway
        MobileApp[Mobile App (React Native)] -->|HTTPS/REST API| API_Gateway
    end

    subgraph "Backend Layer (Node.js)"
        API_Gateway[Express API Server]
        Auth_Service[Auth Service (JWT)]
        Business_Logic[Business Logic Modules]
        
        API_Gateway --> Auth_Service
        API_Gateway --> Business_Logic
    end

    subgraph "Data Layer"
        DB[(PostgreSQL / MySQL)]
        Prisma[Prisma ORM]
        
        Business_Logic --> Prisma
        Prisma --> DB
    end

    subgraph "External Services"
        Maps[Google Maps / OpenStreetMap]
        Storage[File Storage (Local/Cloud)]
    end

    MobileApp -->|GPS| Maps
    WebApp -->|Maps API| Maps
    API_Gateway --> Storage
```

## 3. Chi Tiết Các Thành Phần

### 3.1. Backend Layer (Shared Core)
Đây là "trái tim" của hệ thống, phục vụ cả Web và Mobile App.
*   **Công nghệ:** Node.js, Express.js.
*   **Database:** PostgreSQL hoặc MySQL (thông qua Prisma ORM).
*   **Vai trò:**
    *   **Single Source of Truth:** Đảm bảo dữ liệu đồng nhất giữa Web và Mobile.
    *   **API Endpoints:** Cung cấp RESTful API cho các client.
        *   `/api/auth`: Đăng nhập, cấp token (JWT).
        *   `/api/orders`: Quản lý đơn hàng (CRUD).
        *   `/api/pharmacies`: Quản lý nhà thuốc.
        *   `/api/users`: Quản lý nhân viên/TDV.
        *   `/api/reports`: Tổng hợp báo cáo (chủ yếu cho Web).
    *   **Logic:** Xử lý nghiệp vụ (tính khuyến mãi, KPI, phân quyền).

### 3.2. Web App (Frontend - Admin/Office)
Dành cho Admin, Kế toán, Quản lý vùng (ASM/RSM).
*   **Công nghệ:** ReactJS (SPA).
*   **Chức năng chính:**
    *   **Dashboard:** Xem báo cáo tổng quan, biểu đồ doanh số.
    *   **Quản trị:** CRUD User, Sản phẩm, Nhà thuốc, Cấu hình hệ thống.
    *   **Duyệt đơn:** Kiểm tra và duyệt đơn hàng từ TDV.
    *   **Bản đồ:** Xem vị trí tất cả TDV theo thời gian thực (AdminMap).
*   **Ưu điểm:** Tận dụng màn hình lớn, thao tác chuột/phím nhanh cho nhập liệu phức tạp.

### 3.3. Mobile App (Frontend - TDV)
Dành riêng cho Trình Dược Viên đi thị trường.
*   **Công nghệ:** React Native (Expo).
*   **Chức năng chính:**
    *   **Check-in/Check-out:** Sử dụng GPS điện thoại để chấm công tại nhà thuốc.
    *   **Lên đơn hàng (Sales Order):** Giao diện tối ưu cho chạm (touch), chọn nhanh sản phẩm, xem khuyến mãi.
    *   **Chụp ảnh trưng bày:** Truy cập Camera, chụp và upload ảnh trưng bày/biển hiệu.
    *   **Tra cứu:** Xem lịch sử mua hàng, công nợ của nhà thuốc ngay tại điểm bán.
    *   **Offline Mode (Tương lai):** Lưu đơn hàng tạm khi mất sóng, đồng bộ khi có mạng.
*   **Ưu điểm:**
    *   Truy cập Native API (GPS, Camera, Push Notification) tốt hơn Web.
    *   Hiệu năng cao, mượt mà trên thiết bị di động.
    *   Trải nghiệm người dùng (UX) chuẩn Mobile.

## 4. Chiến Lược Triển Khai & Đồng Bộ

### 4.1. Chia sẻ Tài nguyên (Shared Resources)
Để giảm công sức phát triển, Web và Mobile sẽ chia sẻ:
*   **API Service Logic:** Logic gọi API, xử lý lỗi, interceptor (token).
*   **Utilities:** Hàm format tiền tệ, ngày tháng, validate dữ liệu.
*   **Constants:** Các hằng số hệ thống (Role, Status, Error Codes).
*   **Assets:** Logo, icon, hình ảnh sản phẩm.

### 4.2. Quy trình Phát triển (Development Workflow)
1.  **Backend First:** Phát triển API trước, đảm bảo logic đúng.
2.  **Parallel Frontend:** Team Web và Team Mobile có thể làm việc song song, gọi cùng 1 API.
3.  **Testing:**
    *   Test API bằng Postman.
    *   Test Web trên Chrome/Edge.
    *   Test Mobile trên Simulator/Emulator và thiết bị thật (qua Expo Go).

### 4.3. Bảo Mật
*   **Authentication:** Sử dụng JWT (JSON Web Token). Mobile App lưu token trong `SecureStore`, Web App lưu trong `localStorage` (hoặc `httpOnly cookie`).
*   **Authorization:** Phân quyền chặt chẽ tại Backend (Role-based: ADMIN, TDV, MANAGER).
*   **Data:** Mọi dữ liệu nhạy cảm (mật khẩu) đều được hash (bcrypt). Kết nối qua HTTPS.

## 5. Lộ Trình Chuyển Đổi (Migration Plan)
1.  **Giai đoạn 1 (Hiện tại):** Dọn dẹp "rác" (các file mẫu EV Charging), ổn định Backend API.
2.  **Giai đoạn 2:** Hoàn thiện Web App cho Admin (đã làm tốt).
3.  **Giai đoạn 3:** Khởi tạo dự án React Native (Expo), tái sử dụng logic API từ Web.
4.  **Giai đoạn 4:** Port các tính năng `Visit`, `CreateOrder`, `Map` từ Web sang Mobile App.
5.  **Giai đoạn 5:** Phát hành bản APK cho TDV cài đặt.

---
*Tài liệu này dùng làm kim chỉ nam cho việc phát triển và bảo trì hệ thống An Minh DMS.*
