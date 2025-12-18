# MEDIUM PRIORITY ISSUES - IMPLEMENTATION PLAN
## DMS System Enhancement

**Generated:** 2025-12-18  
**Status:** IN PROGRESS

---

## ✅ COMPLETED ACTIONS

### 1. Project Cleanup
- [x] Identified 15+ temporary test files
- [x] Created cleanup scripts (cleanup_project.bat)
- [x] Files to delete:
  - assign_tdv020.js
  - check_admin_role.js
  - check_customers.js
  - check_tdv020.js
  - check_visits.js
  - fix_admin.js
  - fix_unassigned.js
  - test_warehouse.js
  - test_warehouse_api.js
  - All .txt temp reports

**Files KEPT (Production):**
- `server.js` - Main backend
- `verify_critical_issues.js` - Verification tool
- `backup_database.bat` - Backup automation
- `SYSTEM_AUDIT_REPORT.md` - Documentation

---

## 📋 MEDIUM ISSUES TO IMPLEMENT

### Issue #3: Order Status Confirmation Modal
**Priority:** HIGH  
**Effort:** 2 hours

**Tasks:**
- [ ] Add `showConfirmModal` state
- [ ] Add `confirmAction` state (which status to change to)
- [ ] Create ConfirmationModal component
- [ ] Update all status change buttons to show modal first
- [ ] Test workflow

**UX Flow:**
```
User clicks "Xác nhận" button
→ Modal appears with order summary
→ User reviews & confirms
→ API call to update status
→ Success message
```

---

### Issue #5: Excel Import Feedback
**Priority:** MEDIUM  
**Effort:** 1 hour

**Tasks:**
- [ ] Track import results (success/fail count)
- [ ] Show detailed alert after import
- [ ] Add error list for failed rows
- [ ] Test with sample Excel files

**Message Format:**
```
✅ Import thành công!
- Đã import: 50 dòng
- Thành công: 48
- Lỗi: 2
Chi tiết lỗi: Dòng 3 (Mã trùng), Dòng 15 (Thiếu tên)
```

---

### Issue #12: API Rate Limiting
**Priority:** MEDIUM  
**Effort:** 30 minutes

**Current:** 1000 req/15min  
**Recommended:** 100 req/15min for production

**Tasks:**
- [ ] Update rate limit in server.js
- [ ] Add custom error message
- [ ] Test with load tool
- [ ] Document new limits

**Code:**
```javascript
// server.js
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Changed from 1000
  message: 'Quá nhiều requests, vui lòng thử lại sau 15 phút'
});
```

---

### Issue #13: Structured Logging & Monitoring
**Priority:** HIGH  
**Effort:** 3 hours

**Tasks:**
- [ ] Install Winston or Pino
- [ ] Create logger service
- [ ] Replace all console.log
- [ ] Add log rotation
- [ ] Add error tracking (optional: Sentry)

**Logger Levels:**
- ERROR - Critical errors
- WARN - Warnings
- INFO - General info
- DEBUG - Debug only

**Files:**
```
logs/
  ├── error.log       (errors only)
  ├── combined.log    (all logs)
  └── access.log      (HTTP requests)
```

---

### Issue #14: Database Connection Pool
**Priority:** LOW  
**Effort:** 30 minutes

**Tasks:**
- [ ] Add Prisma connection config
- [ ] Set pool size limits
- [ ] Monitor connection usage
- [ ] Document settings

**Config:**
```javascript
// DATABASE_URL
postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
```

---

### Issue #16: Database Indexes
**Priority:** HIGH  
**Effort:** 1 hour

**Tasks:**
- [ ] Add index on Order.createdAt
- [ ] Add index on InventoryTransaction.transactionDate
- [ ] Add indexes on Pharmacy province/district
- [ ] Run migration
- [ ] Test query performance

**Migration:**
```prisma
@@index([createdAt])
@@index([province, district])
```

---

### Issue #17: Soft Delete Standardization
**Priority:** LOW  
**Effort:** 2 hours

**Tasks:**
- [ ] Audit all models for delete pattern
- [ ] Standardize to isActive/deletedAt
- [ ] Update delete routes to soft delete
- [ ] Add restore functionality (optional)
- [ ] Test thoroughly

---

### Issue #9: Mobile Offline Support
**Priority:** HIGH  
**Effort:** 4 hours

**Tasks:**
- [ ] Implement AsyncStorage caching
- [ ] Cache critical data (products, customers)
- [ ] Queue offline actions
- [ ] Sync when online
- [ ] Add offline indicator UI

**Features:**
- View cached customers/products offline
- Create orders offline (queue)
- Auto-sync when reconnected
- Show sync status

---

### Issue #10: Push Notifications (BONUS)
**Priority:** MEDIUM  
**Effort:** 3 hours

**Tasks:**
- [ ] Setup Firebase Cloud Messaging
- [ ] Add notification permission request
- [ ] Backend: Send notifications on events
- [ ] Test notification delivery
- [ ] Add notification settings

**Use Cases:**
- New order assigned to TDV
- Visit plan updated
- Order status changed

---

## 📊 EFFORT SUMMARY

| Priority | Issues | Total Hours |
|----------|--------|-------------|
| HIGH | 4 | 10 hours |
| MEDIUM | 3 | 4.5 hours |
| LOW | 2 | 2.5 hours |
| **TOTAL** | **9** | **17 hours (~2-3 days)** |

---

## 🎯 IMPLEMENTATION PRIORITY

### Phase 1 (Today - 4 hours):
1. ✅ Project Cleanup
2. API Rate Limiting (#12)
3. Database Indexes (#16)
4. Excel Import Feedback (#5)

### Phase 2 (Tomorrow - 6 hours):
1. Structured Logging (#13)
2. Order Confirmation Modal (#3)
3. Database Pool Config (#14)

### Phase 3 (Day 3 - 7 hours):
1. Mobile Offline Support (#9)
2. Soft Delete Standard (#17)
3. Push Notifications (#10) - If time allows

---

## ✅ QUICK WINS (Can do now)

### Quick Win #1: API Rate Limit (5 mins)
```bash
# Edit server.js line ~35
max: 100  # Change from 1000
```

### Quick Win #2: Database Indexes (10 mins)
```bash
# Edit schema.prisma
# Add @@index lines
# Run: npx prisma db push
```

### Quick Win #3: Excel Feedback (15 mins)
```javascript
// After import success
alert(`✅ Import: ${successCount}/${totalRows} dòng thành công`);
```

---

## 📝 NEXT STEPS

1. Run cleanup script to remove temp files
2. Implement Quick Wins (30 mins total)
3. Start Phase 1 high-priority items
4. Test each change thoroughly
5. Update documentation

---

**Ready to implement!** 🚀
