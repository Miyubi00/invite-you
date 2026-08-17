# 🔍 TAHAP 4: Error Handling & Monitoring Guide

## Overview

Production error handling strategy:
1. **User-Facing Errors**: Toast notifications (already implemented with GlobalToast.jsx)
2. **System Errors**: Logged to console + external monitoring (Sentry optional)
3. **Database Errors**: Caught and displayed gracefully
4. **Network Errors**: Retry logic with exponential backoff

---

## ✅ Current Error Handling (Implemented)

### 1. Global Toast Notification System
**File**: `src/components/GlobalToast.jsx`

- Toast context provider for all pages
- Methods: `toast.success()`, `toast.error()`, `toast.warning()`
- Usage: Already used throughout Dashboard, OrderForm, etc.
- Production-ready ✅

### 2. Supabase Error Handling
Already implemented in key flows:

**DashboardLogin.jsx** (line 50-62):
```javascript
const { data, error } = await supabase.rpc('login_client', {...})
if (error) {
  throw new Error('Terjadi kesalahan sistem...');
}
if (!data) {
  throw new Error('Data tidak ditemukan...');
}
```

**Dashboard.jsx** (line 317+):
```javascript
const { error: deleteError } = await supabase...
if (!deleteError) {
  toast.success("Pesan berhasil dihapus.");
} else {
  toast.error("Gagal menghapus pesan: " + deleteError.message);
}
```

---

## 🔧 Production Error Monitoring Setup

### Option 1: Vercel Analytics (FREE, Built-In)

**No additional setup required!**
- Vercel automatically collects performance metrics
- Available in Vercel Dashboard → Analytics
- Tracks: LCP, FID, CLS, Core Web Vitals

### Option 2: Sentry (FREE tier, Recommended for Errors)

**Setup Steps** (when ready):

1. **Create Sentry Account**:
   - Go to https://sentry.io
   - Sign up (free tier available)
   - Create new project: React

2. **Install SDK**:
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

3. **Initialize in `src/main.jsx`**:
   ```javascript
   import * as Sentry from "@sentry/react";
   
   if (import.meta.env.PROD) {  // Only in production
     Sentry.init({
       dsn: import.meta.env.VITE_SENTRY_DSN,
       environment: import.meta.env.MODE,
       tracesSampleRate: 0.1,  // Capture 10% of transactions
       integrations: [
         new Sentry.Replay({
           maskAllText: true,  // Privacy: mask sensitive data
           blockAllMedia: true,
         }),
       ],
       replaysSessionSampleRate: 0.01,
       replaysOnErrorSampleRate: 1.0,
     });
   }
   
   // ... rest of app
   ```

4. **Set Environment Variable**:
   - Add to `.env.production`:
     ```
     VITE_SENTRY_DSN=https://[key]@[domain].ingest.sentry.io/[project-id]
     ```
   - Set in Vercel Project Settings → Environment Variables

5. **Verify Integration**:
   - After deployment, trigger test error:
     ```javascript
     throw new Error("Test error from Sentry");
     ```
   - Check Sentry dashboard for error report

---

## 📊 What to Monitor in Production

### Critical Error Categories

**1. Authentication Failures**
- Track: Login failures, session timeouts
- Alert threshold: > 5 failures in 5 minutes
- Action: Check Supabase auth logs

**2. Database Errors**
- Track: Query failures, timeout errors
- Alert threshold: Any database error
- Action: Check database performance, RLS policies

**3. Payment/Order Errors**
- Track: Order creation failures, payment gateway issues
- Alert threshold: Any payment error
- Action: Investigate Midtrans/WhatsApp integration

**4. File Upload Errors**
- Track: xlsx parsing failures (CVE mitigation indicator)
- Alert threshold: Multiple failures
- Action: Check file format, size limits

**5. API/Network Errors**
- Track: Supabase connection failures, timeouts
- Alert threshold: Connection errors > 3 in 1 minute
- Action: Check network status, Supabase uptime

---

## 🚨 Alerting Rules (Recommended)

### High Severity (Immediate Action)
- Database is down or unreachable
- Authentication service failure
- Payment gateway failure
- > 50% error rate on any endpoint

### Medium Severity (Within 1 Hour)
- Error rate > 5% on any endpoint
- Response time > 5 seconds
- CSV/xlsx upload failures
- Memory usage > 80%

### Low Severity (Daily Review)
- Error rate 1-5%
- Response time 2-5 seconds
- User reports in support
- Unusual user patterns

---

## 📝 Error Log Analysis

### Key Metrics to Review Daily

```
1. Error Rate by Page:
   - Landing.jsx: Should be 0% (no backend calls)
   - OrderForm.jsx: < 1% (order creation)
   - DashboardLogin.jsx: < 2% (auth)
   - Dashboard.jsx: < 1% (data queries)

2. Error Rate by Type:
   - Network errors: Should decrease over time
   - Database errors: Alert if > 0
   - Validation errors: Expected, acceptable

3. User Impact:
   - Failed order creations: Track revenue loss
   - Failed logins: Track user frustration
   - Session timeouts: Monitor and optimize
```

### Weekly Report Template

```markdown
## Production Error Report - Week of [DATE]

### Summary
- Total errors: [N]
- Error rate: [%]
- Users affected: [N]
- Critical incidents: [N]

### Top 5 Errors
1. [Error Type] - [Count] occurrences
2. [Error Type] - [Count] occurrences
...

### Action Items
- [ ] Investigate [top error]
- [ ] Fix [identified issue]
- [ ] Monitor [metric]

### Trend
- Improving / Stable / Degrading
```

---

## 🔐 Security Monitoring

### Suspicious Activity to Monitor

1. **Repeated Failed Logins**
   - Pattern: Same IP, multiple wrong PINs
   - Action: Rate limit or temporary block

2. **Cross-Order Access Attempts**
   - Pattern: User tries to access other user's order
   - Action: Log + alert (RLS should block)
   - Check: Verify RLS policies are working

3. **File Upload Abuse**
   - Pattern: Large files, rapid uploads
   - Action: Rate limit upload endpoint

4. **Database Query Anomalies**
   - Pattern: Unusual query patterns in logs
   - Action: Review access logs, check for injection attempts

---

## 🧪 Testing Error Handling

### Manual Testing in Staging

1. **Network Error Recovery**:
   - DevTools → Network → Throttle (Slow 3G)
   - Try login, should show timeout message
   - Verify retry works

2. **Database Error**:
   - Disconnect Supabase (set wrong URL temporarily)
   - Try operation, should show error toast
   - Recovery after reconnect

3. **Authentication Error**:
   - Login with wrong PIN
   - Should show clear error message
   - No stack trace exposed

4. **File Upload Error**:
   - Try uploading .csv file (should reject)
   - Try uploading 10MB file (should reject)
   - Try uploading malicious Excel (should handle gracefully)

### Automated Testing (Future Enhancement)

Consider adding e2e tests with Playwright/Cypress:
```javascript
// Example: Login error handling
test('shows error on wrong PIN', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="whatsapp"]', '+6281234567890');
  await page.fill('[name="pin"]', '000000');  // Wrong PIN
  await page.click('button[type="submit"]');
  
  // Should show error toast
  await expect(page.locator('text=tidak ditemukan')).toBeVisible();
});
```

---

## 📞 Escalation Procedure

### Level 1: Development Team
- Monitor daily logs
- Fix issues within SLA (24-48 hours)
- Small bugs, minor performance issues

### Level 2: DevOps/Infrastructure
- Database issues
- Deployment problems
- Infrastructure scaling
- SLA: 4 hours

### Level 3: Emergency Response
- Complete service outage
- Data security incident
- Revenue-impacting issue
- SLA: 30 minutes

---

## 📚 Logging Best Practices

### What to Log

**✅ Log These**:
- Error messages and stack traces
- User actions that caused error
- Request parameters (sanitized)
- Database queries that failed
- Response times for slow operations

**❌ Don't Log These**:
- PINs or passwords
- Credit card information
- Personally identifiable information (PII)
- Secret keys or tokens

### Example Safe Logging

```javascript
// ✅ GOOD: Sanitized logging
console.error('Login failed', {
  userId: order.id,  // Order ID, not sensitive
  timestamp: new Date().toISOString(),
  errorType: 'AUTHENTICATION_FAILED',
  // PIN/password never logged
});

// ❌ BAD: Exposes sensitive data
console.error('Login failed', {
  pin: pinValue,  // NEVER log this
  password: somePassword,  // NEVER log this
});
```

---

## 🔗 Integration Checklist

- [ ] GlobalToast is used for all user-facing errors (already implemented ✅)
- [ ] Try-catch wraps all async operations
- [ ] Database errors are caught and displayed
- [ ] Network timeouts show retry message
- [ ] Sensitive data is not logged
- [ ] Error logs are monitored (Vercel or Sentry)
- [ ] Alerting rules are configured
- [ ] Team knows escalation procedure
- [ ] On-call rotation is defined
- [ ] Incident runbooks are documented

---

**Implementation Status**: ✅ Core error handling ready  
**Next Steps**: Set up Sentry (optional) + Configure alerts  
**Owner**: DevOps/Monitoring Team
