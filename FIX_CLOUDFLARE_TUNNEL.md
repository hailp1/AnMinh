# Sửa Lỗi Cloudflare Tunnel

Hiện tại `dms.ammedtech.com` chưa chạy được là do cấu hình Tunnel trên Cloudflare đang trỏ sai địa chỉ (có thể đang trỏ về `localhost` của máy tính, nhưng Docker lại chạy trong mạng riêng).

Bạn cần vào **Cloudflare Zero Trust Dashboard** để cập nhật lại cấu hình như sau:

## 1. Truy cập Dashboard
- Vào [Cloudflare Zero Trust](https://one.dash.cloudflare.com/)
- Chọn **Access** > **Tunnels**
- Chọn Tunnel của bạn > **Configure**
- Chọn tab **Public Hostname**

## 2. Cập nhật các bản ghi (Public Hostnames)

Hãy sửa (hoặc thêm) các dòng sau để trỏ đúng vào các container trong Docker:

| Domain (Subdomain) | Path | Service (Type : URL) | Ghi chú |
| :--- | :--- | :--- | :--- |
| **dms.ammedtech.com** | / | `http://frontend:80` | **QUAN TRỌNG**: Chọn HTTP và nhập `frontend:80` |
| **ammedtech.com** | / | `http://landing:3000` | Trỏ vào Landing Page |
| **portal.ammedtech.com** | / | `http://webapp:3000` | Trỏ vào Web App |
| **api.ammedtech.com** | / | `http://backend:5000` | Trỏ vào API Server |

> **Lưu ý quan trọng**: 
> - Trong Docker, tên service (`frontend`, `backend`, `landing`) chính là hostname.
> - **KHÔNG** dùng `localhost` hay `127.0.0.1` vì nó sẽ trỏ vào chính container Tunnel chứ không phải ứng dụng của bạn.
> - Nếu `http://frontend:80` không hoạt động, hãy thử `http://host.docker.internal:3099` (tôi đã bật tính năng này trong update vừa rồi).

## 3. Sau khi lưu
Tunnel sẽ tự động cập nhật trong vài giây. Bạn không cần khởi động lại Docker.
