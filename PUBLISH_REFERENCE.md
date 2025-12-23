# 🚀 PUBLISH QUICK REFERENCE

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀 PUBLISH AM MEDTECH DMS TO PRODUCTION                    ║
║   Domain: https://dms.ammedtech.com                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

## 📋 CHECKLIST TRƯỚC KHI PUBLISH

- [ ] Docker Desktop đang chạy
- [ ] File `tunnel-creds.json` tồn tại
- [ ] Code đã được test trên local

---

## 🎯 LỆNH PUBLISH (1 dòng)

```bash
scripts\PUBLISH_PRODUCTION.bat
```

**Thời gian:** 5-10 phút (lần đầu build)

---

## ✅ SAU KHI PUBLISH XONG

1. **Kiểm tra:** `scripts\CHECK_PRODUCTION.bat`
2. **Truy cập:** https://dms.ammedtech.com
3. **Login:** admin / 123456
4. **Test** các chức năng chính

---

## 🔧 CÁC LỆNH HỮU ÍCH

| Mục đích | Lệnh |
|----------|------|
| Xem logs | `docker-compose -f docker-compose.yml logs -f` |
| Restart | `docker-compose -f docker-compose.yml restart` |
| Stop | `scripts\STOP_PRODUCTION.bat` |
| Check status | `scripts\CHECK_PRODUCTION.bat` |

---

## 🌐 URLs

### Production (Public)
- **DMS System:** https://dms.ammedtech.com
- **Backend API:** https://dms.ammedtech.com/api
- **Landing Page:** https://ammedtech.com

### Local (Testing)
- **DMS Frontend:** http://localhost:3099
- **Backend API:** http://localhost:5001
- **Landing Page:** http://localhost:3000
- **Database:** localhost:5433

---

## 📚 TÀI LIỆU

- **Chi tiết:** [HUONG_DAN_PUBLISH_PRODUCTION.md](HUONG_DAN_PUBLISH_PRODUCTION.md)
- **Quick Start:** [QUICK_START_PUBLISH.md](QUICK_START_PUBLISH.md)
- **Scripts:** [SCRIPTS_REFERENCE.md](SCRIPTS_REFERENCE.md)
- **Main README:** [README.md](README.md)

---

## 🆘 GẶP LỖI?

1. Chạy: `scripts\CHECK_PRODUCTION.bat`
2. Xem logs: `docker-compose -f docker-compose.yml logs`
3. Restart: 
   ```bash
   scripts\STOP_PRODUCTION.bat
   scripts\PUBLISH_PRODUCTION.bat
   ```

---

## 💡 LƯU Ý

- ✅ Cloudflare Tunnel tự động kết nối
- ✅ Tất cả traffic qua HTTPS
- ✅ Database data được giữ nguyên khi restart
- ✅ Có thể test local trước khi publish
