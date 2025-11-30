# Setup Named Tunnel cho DMS Client

## Bước 1: Tạo Named Tunnel

```bash
cloudflared.exe tunnel create dms-ammedtech
```

Lưu lại **Tunnel ID** được tạo.

## Bước 2: Tạo file config

Tạo file `dms-tunnel-config.yml`:

```yaml
tunnel: <YOUR-TUNNEL-ID>
credentials-file: C:\Users\OWNER\.cloudflared\<YOUR-TUNNEL-ID>.json

ingress:
  - hostname: dms.ammedtech.com
    service: http://localhost:3099
  - service: http_status:404
```

## Bước 3: Route DNS

```bash
cloudflared.exe tunnel route dns dms-ammedtech dms.ammedtech.com
```

## Bước 4: Chạy Named Tunnel

```bash
cloudflared.exe tunnel --config dms-tunnel-config.yml run dms-ammedtech
```

## Hoặc chạy cả 2 tunnels với 1 config

Tạo file `tunnels-config.yml`:

```yaml
tunnel: <YOUR-TUNNEL-ID>
credentials-file: C:\Users\OWNER\.cloudflared\<YOUR-TUNNEL-ID>.json

ingress:
  - hostname: ammedtech.com
    service: http://localhost:3000
  - hostname: dms.ammedtech.com
    service: http://localhost:3099
  - service: http_status:404
```

Sau đó chạy:

```bash
cloudflared.exe tunnel --config tunnels-config.yml run <tunnel-name>
```

---

**Lưu ý**: Named tunnel cần login Cloudflare trước:

```bash
cloudflared.exe tunnel login
```
