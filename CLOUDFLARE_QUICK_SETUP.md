# 🚀 Quick Setup - sales.ammedtech.com

## Bước 1: Truy cập Cloudflare Dashboard

### Link trực tiếp:
👉 **https://dash.cloudflare.com**

1. Đăng nhập vào tài khoản Cloudflare
2. Chọn domain: **`ammedtech.com`**

---

## Bước 2: Kích hoạt Zero Trust (Nếu chưa có)

### Link trực tiếp:
👉 **https://one.dash.cloudflare.com/**

1. Nếu chưa kích hoạt Zero Trust:
   - Click **Get Started** hoặc **Sign up**
   - Chọn plan **Free** (miễn phí)
   - Xác nhận email nếu cần

---

## Bước 3: Tạo Tunnel

### Link trực tiếp đến Tunnels:
👉 **https://one.dash.cloudflare.com/cloudflare-tunnels**

1. Click **Create a tunnel**
2. Chọn **Cloudflared**
3. Đặt tên: **`sales-tunnel`**
4. Click **Save tunnel**

---

## Bước 4: Copy Tunnel Token

Sau khi tạo tunnel, bạn sẽ thấy một **Token** rất dài (bắt đầu bằng `eyJhIjoi...`)

**⚠️ QUAN TRỌNG: Copy token này ngay!**

Token có dạng:
```
eyJhIjoiY2xvdWRmbGFyZS10dW5uZWwtdG9rZW4t... (rất dài)
```

---

## Bước 5: Cấu hình Public Hostname (Tạo DNS tự động)

### Link trực tiếp đến Public Hostnames:
👉 **https://one.dash.cloudflare.com/cloudflare-tunnels** (sau đó click vào tunnel `sales-tunnel`)

1. Click vào tunnel **`sales-tunnel`** vừa tạo
2. Click tab **Public Hostnames**
3. Click **Add a public hostname**
4. Điền thông tin:

   ```
   Subdomain: sales
   Domain: ammedtech.com
   Service: http://frontend:80
   ```

   **Lưu ý:** Nếu không có option `http://frontend:80`, thử:
   - `http://localhost:80`
   - `http://127.0.0.1:80`
   - Hoặc chỉ cần điền `80` trong trường Port

5. Click **Save hostname**

**✅ DNS record sẽ được tạo TỰ ĐỘNG!**

**📖 Xem chi tiết về DNS:** `DNS_SETUP_GUIDE.md`

---

## Bước 6: Thêm Token vào .env

Mở file `.env` trong project và thêm:

```env
CLOUDFLARE_TUNNEL_TOKEN=your_token_from_step_4_here
```

**Ví dụ:**
```env
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoiY2xvdWRmbGFyZS10dW5uZWwtdG9rZW4t...
```

---

## Bước 7: Restart Cloudflared

Chạy lệnh trong terminal:

```bash
docker-compose restart cloudflared
```

Hoặc restart tất cả:

```bash
docker-compose restart
```

---

## Bước 8: Kiểm tra Status

### Link kiểm tra Tunnel Status:
👉 **https://one.dash.cloudflare.com/cloudflare-tunnels**

1. Click vào tunnel **`sales-tunnel`**
2. Kiểm tra **Status** phải là **🟢 HEALTHY**

### Link kiểm tra DNS:
👉 **https://dash.cloudflare.com/[your-account-id]/ammedtech.com/dns**

1. Tìm record:
   - **Type**: `CNAME`
   - **Name**: `sales`
   - **Target**: `...cfargotunnel.com`
   - **Proxy**: 🟠 Proxied

---

## Bước 9: Truy cập Website

Sau 5-10 phút (DNS propagation):

- **Main site**: https://sales.ammedtech.com
- **Admin panel**: https://sales.ammedtech.com/admin

---

## Checklist Hoàn Thành

- [ ] Đã đăng nhập Cloudflare Dashboard
- [ ] Đã kích hoạt Zero Trust (nếu cần)
- [ ] Đã tạo tunnel: **`sales-tunnel`**
- [ ] Đã copy **Tunnel Token**
- [ ] Đã cấu hình Public Hostname:
  - Subdomain: `sales`
  - Domain: `ammedtech.com`
  - Service: `http://frontend:80`
- [ ] Đã thêm `CLOUDFLARE_TUNNEL_TOKEN` vào `.env`
- [ ] Đã restart `cloudflared` service
- [ ] Tunnel status là **🟢 HEALTHY**
- [ ] DNS record đã được tạo tự động
- [ ] Có thể truy cập `https://sales.ammedtech.com`
- [ ] Có thể truy cập `https://sales.ammedtech.com/admin`

---

## Troubleshooting

### Tunnel không kết nối

```bash
# Kiểm tra logs
docker-compose logs cloudflared

# Kiểm tra token trong .env
cat .env | grep TUNNEL_TOKEN

# Restart
docker-compose restart cloudflared
```

### Token không đúng

- Đảm bảo copy đầy đủ token (rất dài)
- Không có khoảng trắng ở đầu/cuối
- Token phải bắt đầu bằng `eyJhIjoi...`

### DNS không resolve

- Đợi 5-10 phút để DNS propagate
- Kiểm tra tunnel status phải là HEALTHY
- Xóa DNS cache: `ipconfig /flushdns` (Windows)

### Backend/Frontend không chạy

```bash
# Kiểm tra status
docker-compose ps

# Xem logs
docker-compose logs backend
docker-compose logs frontend
```

---

## Links Tổng Hợp

| Mục đích | Link |
|----------|------|
| **Cloudflare Dashboard** | https://dash.cloudflare.com |
| **Zero Trust Dashboard** | https://one.dash.cloudflare.com/ |
| **Tunnels Management** | https://one.dash.cloudflare.com/cloudflare-tunnels |
| **DNS Records** | https://dash.cloudflare.com/[account-id]/ammedtech.com/dns |

---

## Kết quả

Sau khi hoàn tất, bạn sẽ có:

✅ **Website**: https://sales.ammedtech.com  
✅ **Admin Panel**: https://sales.ammedtech.com/admin  
✅ **API**: https://sales.ammedtech.com/api  
✅ **SSL tự động** (Cloudflare)  
✅ **DDoS protection tự động**  
✅ **Không cần mở port trên server**  
✅ **Không cần IP công khai**  

---

## Lưu ý Quan Trọng

1. **Token bảo mật**: Không chia sẻ token với ai
2. **DNS tự động**: Không cần tạo DNS record thủ công
3. **SSL tự động**: Cloudflare cung cấp SSL miễn phí
4. **Propagation**: DNS có thể mất 5-10 phút để propagate

---

## Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Tunnel status trong Cloudflare Dashboard
2. Logs: `docker-compose logs cloudflared`
3. Token trong `.env` file
4. DNS records trong Cloudflare Dashboard

