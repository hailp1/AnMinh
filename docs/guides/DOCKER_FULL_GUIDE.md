# Hướng dẫn Chạy Toàn bộ Hệ thống với Docker

Hệ thống AM Medtech DMS đã được docker hóa hoàn toàn, bao gồm:

1.  **PostgreSQL**: Cơ sở dữ liệu chính.
2.  **Backend API**: Node.js Express server (Port 5001).
3.  **Frontend DMS**: React Client App (Port 3099).
4.  **Landing Page**: Trang giới thiệu sản phẩm (Port 3000).
5.  **Web App Portal**: Cổng thông tin khách hàng (Port 3001).
6.  **Redis**: Cache service (Port 6379) - *Mới thêm*.
7.  **Cloudflare Tunnel**: Để public ra internet (nếu có token).

## Cách chạy

Chỉ cần chạy file script duy nhất:

```bash
START_FULL_DOCKER.bat
```

Script này sẽ:
1.  Dừng các container cũ.
2.  Build lại toàn bộ image mới nhất.
3.  Khởi động tất cả dịch vụ.

## Truy cập

Sau khi khởi động thành công:

- **Landing Page**: [http://localhost:3000](http://localhost:3000)
- **Web App Portal**: [http://localhost:3001](http://localhost:3001)
- **DMS Admin/Client**: [http://localhost:3099](http://localhost:3099)
- **API Server**: [http://localhost:5001](http://localhost:5001)

## Xử lý lỗi "Lopix Server" (Lỗi Server)

Nếu bạn gặp lỗi "Lỗi Server" khi đăng nhập:
1.  Đảm bảo container `dms_postgres` đang chạy (`docker-compose ps`).
2.  Đảm bảo `dms_backend` đã kết nối được với DB (xem logs: `docker-compose logs backend`).
3.  Hệ thống đã được bổ sung **Redis** để đảm bảo các tính năng cần cache/session hoạt động ổn định.

## Lưu ý

- Lần đầu chạy sẽ mất vài phút để build các image Next.js.
- Dữ liệu database được lưu trong volume `postgres_data`, không bị mất khi restart container.
