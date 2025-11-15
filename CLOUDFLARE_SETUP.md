# Hướng dẫn cấu hình Cloudflare cho sales.ammedtech.com

> **💡 Khuyến nghị:** Sử dụng **Cloudflare Tunnel** thay vì DNS A Record để có bảo mật tốt hơn và không cần mở port. Xem file `CLOUDFLARE_TUNNEL_SETUP.md` để biết cách setup.

## Phương pháp 1: Cloudflare Tunnel (Khuyến nghị)

Xem file `CLOUDFLARE_TUNNEL_SETUP.md` để biết cách cấu hình Cloudflare Tunnel.

## Phương pháp 2: DNS A Record (Truyền thống)

## Bước 1: Đăng nhập Cloudflare

1. Truy cập https://dash.cloudflare.com
2. Đăng nhập vào tài khoản Cloudflare của bạn
3. Chọn domain `ammedtech.com`

## Bước 2: Thêm DNS Record

### Option A: Sử dụng Cloudflare Proxy (Khuyến nghị)

1. Vào **DNS** > **Records**
2. Thêm record mới:
   - **Type**: `A`
   - **Name**: `sales`
   - **IPv4 address**: **Địa chỉ IP công khai của server** (xem hướng dẫn bên dưới)
   - **Proxy status**: 🟠 **Proxied** (bật proxy - Cloudflare sẽ bảo vệ và tăng tốc)
   - **TTL**: Auto

#### Làm sao để lấy IPv4 address?

**IPv4 address** là địa chỉ IP công khai (public IP) của server nơi bạn deploy Docker.

**Cách 1: Trên server Linux**
```bash
# SSH vào server, chạy lệnh:
curl ifconfig.me
# hoặc
hostname -I
```

**Cách 2: Trên server Windows**
```powershell
# Chạy PowerShell:
Invoke-RestMethod -Uri "https://api.ipify.org"
```

**Cách 3: Từ máy tính khác**
- Truy cập: https://whatismyipaddress.com
- Hoặc: https://ifconfig.me

**Cách 4: Từ dashboard nhà cung cấp**
- Nếu dùng VPS/Cloud (DigitalOcean, AWS, Vultr, Linode, v.v.)
- Vào dashboard → Servers → Xem IP Address

**Ví dụ:**
- Nếu IP của server là: `123.45.67.89`
- Thì nhập: `123.45.67.89` vào trường **IPv4 address**

### Option B: Không dùng Proxy (Direct)

1. Vào **DNS** > **Records**
2. Thêm record mới:
   - **Type**: `A`
   - **Name**: `sales`
   - **IPv4 address**: **Địa chỉ IP công khai của server** (xem hướng dẫn ở Option A)
   - **Proxy status**: ⚪ **DNS only** (tắt proxy)
   - **TTL**: Auto

> **Lưu ý:** Nếu chưa có server, bạn cần thuê VPS/Cloud Server trước. Xem phần "Chưa có server?" bên dưới.

## Bước 3: Cấu hình SSL/TLS

1. Vào **SSL/TLS** > **Overview**
2. Chọn **Full (strict)** mode:
   - Đảm bảo server có SSL certificate hợp lệ
   - Cloudflare sẽ mã hóa kết nối giữa client và Cloudflare, và giữa Cloudflare và server

## Bước 4: Cấu hình Page Rules (Tùy chọn)

1. Vào **Rules** > **Page Rules**
2. Tạo rule mới:
   - **URL**: `sales.ammedtech.com/*`
   - **Settings**:
     - **Cache Level**: Standard
     - **Browser Cache TTL**: 4 hours
     - **Edge Cache TTL**: 1 month

## Bước 5: Cấu hình Firewall Rules (Bảo mật)

1. Vào **Security** > **WAF** > **Custom rules**
2. Tạo rule để bảo vệ API:
   ```
   (http.request.uri.path contains "/api/") and (not ip.src in {your_office_ips})
   ```
   - Action: Challenge hoặc Block

## Bước 6: Cấu hình Backend để nhận requests từ Cloudflare

### Cập nhật server.js

Đảm bảo server có thể nhận requests từ Cloudflare:

```javascript
// Trust Cloudflare proxy
app.set('trust proxy', true);
```

### Environment Variables

Thêm vào `.env`:
```
TRUST_PROXY=true
```

## Bước 7: Kiểm tra

1. Chờ DNS propagation (có thể mất vài phút đến vài giờ)
2. Kiểm tra DNS: `nslookup sales.ammedtech.com`
3. Truy cập: `https://sales.ammedtech.com`
4. Kiểm tra SSL: https://www.ssllabs.com/ssltest/analyze.html?d=sales.ammedtech.com

## Chưa có server?

Nếu bạn chưa có server để deploy, bạn cần:

1. **Thuê VPS/Cloud Server:**
   - **DigitalOcean**: https://www.digitalocean.com (khuyến nghị cho người mới)
   - **Vultr**: https://www.vultr.com
   - **Linode**: https://www.linode.com
   - **AWS EC2**: https://aws.amazon.com/ec2
   - **Google Cloud**: https://cloud.google.com

2. **Yêu cầu tối thiểu:**
   - CPU: 2 cores
   - RAM: 2GB
   - Storage: 20GB
   - OS: Ubuntu 20.04/22.04 LTS hoặc Debian 11

3. **Sau khi có server:**
   - Cài đặt Docker: `curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh`
   - Cài đặt Docker Compose: `sudo apt-get install docker-compose-plugin`
   - Lấy IP công khai: `curl ifconfig.me`
   - Nhập IP đó vào Cloudflare DNS

## Lưu ý quan trọng

1. **IP Address**: Cần có IP công khai (public IP) của server để cấu hình DNS A record. IP này có thể là:
   - **IP tĩnh** (static IP): Không thay đổi - khuyến nghị cho production
   - **IP động** (dynamic IP): Có thể thay đổi - cần cập nhật DNS khi IP thay đổi

2. **SSL Certificate**: Server cần có SSL certificate hợp lệ nếu dùng Full (strict) mode. Có thể dùng:
   - Let's Encrypt (miễn phí): `sudo certbot --nginx -d sales.ammedtech.com`
   - Hoặc Cloudflare Origin Certificate (miễn phí trong Cloudflare)

3. **Firewall**: Mở port trên server:
   ```bash
   # Ubuntu/Debian
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 5000/tcp
   sudo ufw enable
   ```

4. **Backend API URL**: Cập nhật `REACT_APP_API_URL` trong frontend để trỏ đến `https://sales.ammedtech.com/api`

## Troubleshooting

### DNS không resolve
- Kiểm tra DNS record đã được tạo đúng chưa
- Chờ DNS propagation (có thể mất 24-48 giờ)
- Xóa DNS cache: `ipconfig /flushdns` (Windows) hoặc `sudo dscacheutil -flushcache` (Mac)

### SSL Error
- Kiểm tra SSL certificate trên server
- Đảm bảo Cloudflare SSL mode là "Full" hoặc "Full (strict)"
- Kiểm tra certificate chain

### 502 Bad Gateway
- Kiểm tra backend server đang chạy
- Kiểm tra firewall rules
- Kiểm tra Cloudflare proxy status

