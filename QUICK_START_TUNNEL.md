# Quick Start - Cloudflare Tunnel

## 🚀 Setup nhanh với Cloudflare Tunnel

### 1. Tạo Tunnel trong Cloudflare Dashboard

1. Đăng nhập: https://dash.cloudflare.com
2. Chọn domain `ammedtech.com`
3. Vào **Zero Trust** > **Networks** > **Tunnels**
4. Click **Create a tunnel**
5. Chọn **Cloudflared**
6. Đặt tên: `sales-tunnel`
7. Click **Save tunnel**
8. **Copy Token** (bạn sẽ cần token này)

### 2. Cấu hình Public Hostname

1. Vào tunnel vừa tạo
2. Click **Configure**
3. Thêm **Public Hostname**:
   - **Subdomain**: `sales`
   - **Domain**: `ammedtech.com`
   - **Service**: `http://frontend:80`
4. Click **Save hostname**

### 3. Thêm Token vào .env

```bash
# Thêm vào file .env
echo "CLOUDFLARE_TUNNEL_TOKEN=your_token_here" >> .env
```

### 4. Uncomment Cloudflared trong docker-compose.yml

Mở `docker-compose.yml` và uncomment phần cloudflared:

```yaml
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: ambs_cloudflared
    command: tunnel --no-autoupdate run
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - ambs_network
    restart: unless-stopped
    depends_on:
      - frontend
      - backend
```

### 5. Start Services

```bash
# Start tất cả services (bao gồm tunnel)
docker-compose up -d

# Xem logs tunnel
docker-compose logs -f cloudflared
```

### 6. Kiểm tra

- Đợi vài phút để tunnel kết nối
- Truy cập: `https://sales.ammedtech.com`
- Kiểm tra status trong Cloudflare Dashboard

## ✅ Xong!

Bây giờ ứng dụng của bạn đã được expose qua Cloudflare Tunnel mà không cần:
- Mở port trên server
- IP công khai
- Cấu hình firewall

Xem `CLOUDFLARE_TUNNEL_SETUP.md` để biết thêm chi tiết.

