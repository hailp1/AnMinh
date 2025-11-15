# Hướng dẫn cấu hình Cloudflare Tunnel cho sales.ammedtech.com

Cloudflare Tunnel (Cloudflared) là cách tốt nhất để expose ứng dụng mà không cần:
- Mở port trên server
- IP công khai
- Cấu hình firewall phức tạp

## Bước 1: Cài đặt Cloudflared trên Server

### Linux (Ubuntu/Debian)

```bash
# Download và cài đặt cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

### Hoặc dùng Docker (Khuyến nghị)

Thêm service vào `docker-compose.yml`:

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

## Bước 2: Tạo Cloudflare Tunnel

### Cách 1: Qua Cloudflare Dashboard (Khuyến nghị)

1. Đăng nhập Cloudflare: https://dash.cloudflare.com
2. Chọn domain `ammedtech.com`
3. Vào **Zero Trust** > **Networks** > **Tunnels**
4. Click **Create a tunnel**
5. Chọn **Cloudflared** và đặt tên: `sales-tunnel`
6. Click **Save tunnel**
7. **Copy Token** (bạn sẽ cần token này)

### Cách 2: Qua Command Line

```bash
# Login vào Cloudflare
cloudflared tunnel login

# Tạo tunnel mới
cloudflared tunnel create sales-tunnel

# List tunnels để xem ID
cloudflared tunnel list
```

## Bước 3: Cấu hình Tunnel

### Cách 1: Qua Cloudflare Dashboard

1. Vào tunnel vừa tạo: **Zero Trust** > **Networks** > **Tunnels** > `sales-tunnel`
2. Click **Configure**
3. Thêm **Public Hostname**:
   - **Subdomain**: `sales`
   - **Domain**: `ammedtech.com`
   - **Service**: `http://frontend:80` (hoặc `http://localhost:80` nếu chạy ngoài Docker)
4. Click **Save hostname**

### Cách 2: Tạo file config

Tạo file `config.yml`:

```yaml
tunnel: <TUNNEL_ID>
credentials-file: /etc/cloudflared/credentials.json

ingress:
  # Frontend
  - hostname: sales.ammedtech.com
    service: http://frontend:80
  
  # Backend API (optional - nếu muốn expose riêng)
  - hostname: api-sales.ammedtech.com
    service: http://backend:5000
  
  # Catch-all
  - service: http_status:404
```

## Bước 4: Chạy Tunnel

### Với Docker Compose

1. Thêm vào `.env`:
```env
CLOUDFLARE_TUNNEL_TOKEN=your_tunnel_token_here
```

2. Cập nhật `docker-compose.yml`:

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

3. Chạy:
```bash
docker-compose up -d cloudflared
```

### Với Cloudflared trực tiếp

```bash
# Chạy với token
cloudflared tunnel --token <YOUR_TUNNEL_TOKEN> run

# Hoặc chạy với config file
cloudflared tunnel --config config.yml run
```

### Chạy như service (Linux)

Tạo file `/etc/systemd/system/cloudflared.service`:

```ini
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/cloudflared tunnel --no-autoupdate run
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

Enable và start:
```bash
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```

## Bước 5: Cấu hình DNS (Tự động)

Khi bạn tạo Public Hostname trong Cloudflare Dashboard, DNS record sẽ được tạo tự động. Bạn không cần tạo DNS A record thủ công nữa!

## Bước 6: Cấu hình SSL/TLS

1. Vào **SSL/TLS** > **Overview**
2. Chọn **Full (strict)** mode
3. Với Tunnel, SSL được xử lý tự động bởi Cloudflare

## Bước 7: Kiểm tra

1. Chờ vài phút để tunnel kết nối
2. Kiểm tra tunnel status: Cloudflare Dashboard > Zero Trust > Networks > Tunnels
3. Truy cập: `https://sales.ammedtech.com`
4. Xem logs:
   ```bash
   docker-compose logs -f cloudflared
   # hoặc
   sudo journalctl -u cloudflared -f
   ```

## Ưu điểm của Cloudflare Tunnel

✅ **Không cần mở port** trên server  
✅ **Không cần IP công khai**  
✅ **Bảo mật cao** - traffic được mã hóa end-to-end  
✅ **Tự động SSL** - Cloudflare xử lý SSL certificate  
✅ **DDoS protection** tự động  
✅ **Miễn phí** với Cloudflare Zero Trust  

## Troubleshooting

### Tunnel không kết nối

```bash
# Kiểm tra logs
docker-compose logs cloudflared

# Kiểm tra token
echo $CLOUDFLARE_TUNNEL_TOKEN

# Test kết nối
cloudflared tunnel info
```

### DNS không resolve

- Kiểm tra Public Hostname đã được tạo trong Dashboard
- Đợi vài phút để DNS propagate
- Kiểm tra tunnel status phải là "HEALTHY"

### 502 Bad Gateway

- Kiểm tra frontend/backend đang chạy: `docker-compose ps`
- Kiểm tra service URL trong tunnel config đúng chưa
- Kiểm tra network: `docker network inspect ambs_network`

### Tunnel bị disconnect

- Kiểm tra internet connection
- Restart tunnel: `docker-compose restart cloudflared`
- Kiểm tra token còn hợp lệ không

## Cấu hình nâng cao

### Expose nhiều services

```yaml
ingress:
  - hostname: sales.ammedtech.com
    service: http://frontend:80
  - hostname: api.sales.ammedtech.com
    service: http://backend:5000
  - hostname: admin.sales.ammedtech.com
    service: http://frontend:80
    path: /admin
  - service: http_status:404
```

### Load balancing

Có thể cấu hình nhiều tunnels cho high availability trong Cloudflare Dashboard.

## So sánh với DNS A Record

| Tính năng | DNS A Record | Cloudflare Tunnel |
|-----------|-------------|-------------------|
| Cần IP công khai | ✅ Có | ❌ Không |
| Cần mở port | ✅ Có | ❌ Không |
| Bảo mật | Trung bình | Cao |
| DDoS Protection | Có (qua Cloudflare) | Có (tự động) |
| Setup phức tạp | Trung bình | Dễ |
| Chi phí | Miễn phí | Miễn phí |

**Kết luận:** Cloudflare Tunnel là lựa chọn tốt hơn cho production!

