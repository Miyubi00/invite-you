# 🚀 TAHAP 4: Production Deploy Checklist

**Status**: Production Readiness Verification  
**Date**: 2026-08-17  
**Target**: Zero-downtime deployment to production

---

## 📋 PRE-DEPLOYMENT VERIFICATION (Week 1)

### ✅ Code Quality & Security (COMPLETED in Tahap 1-3)

- [x] ESLint: 0 errors, 3 non-blocking warnings
- [x] Build: Successful (4.46s, ~368KB gzip)
- [x] React purity: All violations fixed
- [x] Dependencies: xlsx CVE mitigated
- [x] Security: PIN header removed
- [x] RLS: SQL policies prepared

**Status**: ✅ CLEARED - No blockers


### ⏳ Environment Configuration (Week 1 - Before Deployment)

**Checklist**:
- [ ] Create `.env.production` file (based on `.env.example`)
- [ ] Verify `VITE_SUPABASE_URL` is correct (from Supabase dashboard)
- [ ] Verify `VITE_SUPABASE_ANON_KEY` is correct (public anon key)
- [ ] Add `.env.production` to `.gitignore` (never commit)
- [ ] Test environment variables locally: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are readable
- [ ] Confirm Vercel environment variables are set in project dashboard

**Commands to Test**:
```bash
# Verify env vars are loaded
npm run build 2>&1 | grep -i "vite_supabase"

# Run in preview mode (simulates production build)
npm run preview
```

**Vercel Setup**:
1. Go to: Vercel Project Dashboard → Settings → Environment Variables
2. Add variables:
   - `VITE_SUPABASE_URL`: `https://[project-id].supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: [your public anon key]
3. Scope to: Production
4. Redeploy after setting variables

---

### 🔐 Security Headers (COMPLETED in Tahap 4)

**Configuration**: `vercel.json` (updated with security headers)

- [x] X-Content-Type-Options: nosniff (prevent MIME sniffing)
- [x] X-Frame-Options: SAMEORIGIN (prevent clickjacking)
- [x] X-XSS-Protection: 1; mode=block (enable XSS protection)
- [x] Strict-Transport-Security: max-age=31536000 (enforce HTTPS)
- [x] Referrer-Policy: strict-origin-when-cross-origin (privacy)
- [x] Permissions-Policy: Disable geolocation, microphone, camera

**Verification**:
```bash
# After deployment, check headers
curl -I https://your-domain.com/
# Should see security headers in response
```

---

## 🛡️ DATABASE SECURITY (Week 1 - Before Deployment)

### Row-Level Security Policies

- [ ] Run `SECURITY_HARDENING_RLS.sql` in Supabase SQL Editor
- [ ] Verify RLS is enabled on all tables:
  ```sql
  SELECT tablename, rowsecurity FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename IN ('orders', 'rsvps', 'templates', 'pending_orders');
  ```
- [ ] Test RLS enforcement (should deny cross-order access)
- [ ] Monitor for RLS violation logs (may indicate attack attempts)

### Backups & Recovery

- [ ] Enable automated daily backups in Supabase:
  - Settings → Backups → Enable Point-In-Time Recovery
  - Test restore on staging database
- [ ] Document recovery procedure
- [ ] Schedule backup verification: Weekly manual backup test


### Database Optimization

- [ ] Add indexes to frequently queried columns:
  ```sql
  CREATE INDEX idx_orders_id ON orders(id);
  CREATE INDEX idx_rsvps_order_id ON rsvps(order_id);
  CREATE INDEX idx_pending_orders_id ON pending_orders(id);
  ```
- [ ] Monitor query performance with Supabase Analytics
- [ ] Set up alerts for slow queries (>1s)

---

## 📊 Monitoring & Alerting (Week 2 - Ongoing)

### Error Tracking (Optional but Recommended)

**Sentry Setup** (for production error tracking):
1. Create account: https://sentry.io
2. Create new project: React
3. Get DSN from project settings
4. Add to `.env.production`:
   ```
   VITE_SENTRY_DSN=https://[key]@[domain].ingest.sentry.io/[project-id]
   ```
5. Install and initialize in `src/main.jsx`:
   ```javascript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: "production",
     tracesSampleRate: 0.1,
   });
   ```

**Alternative**: Use Vercel Analytics (built-in, no extra setup)
- Go to Vercel Dashboard → Analytics → Enable

### Performance Monitoring

- [ ] Set up Vercel Performance Analytics
- [ ] Monitor Core Web Vitals (LCP, FID, CLS)
- [ ] Alert threshold: LCP > 2.5s
- [ ] Monitor build times: Target < 5s

### Uptime Monitoring

- [ ] Configure monitoring: https://uptimerobot.com (free tier)
- [ ] Monitor endpoints:
  - `https://your-domain.com/` (home page)
  - `https://your-domain.com/login` (login page)
- [ ] Alert on downtime: Email notifications

---

## 🧪 Staging & Testing (Week 1 - Before Deployment)

### Staging Environment Setup

- [ ] Deploy to Vercel staging environment:
  ```bash
  git checkout -b staging
  # Make any staging-specific changes
  git push origin staging
  # Configure Vercel to auto-deploy staging branch
  ```

### Smoke Tests on Staging

Run these tests on staging before production deployment:

1. **Homepage Load**:
   - [ ] Visit homepage
   - [ ] All images load
   - [ ] Responsive on mobile (test with DevTools)

2. **Order Creation Flow**:
   - [ ] Fill order form
   - [ ] Select template
   - [ ] Create order
   - [ ] Verify in database

3. **Login Flow**:
   - [ ] Login with WhatsApp & PIN
   - [ ] Access dashboard
   - [ ] Verify session persists on refresh

4. **Invitation Rendering**:
   - [ ] Visit public invitation link
   - [ ] All template themes render correctly
   - [ ] RSVP submission works

5. **Admin Panel**:
   - [ ] Login to admin
   - [ ] View orders
   - [ ] View RSVPs
   - [ ] Update order details

6. **Error Scenarios**:
   - [ ] Invalid login credentials
   - [ ] Network error recovery
   - [ ] Large file upload (xlsx) rejection
   - [ ] Cross-order access attempt (should fail with RLS)

### Performance Testing on Staging

```bash
# Lighthouse audit (Chrome DevTools)
# Target score: 80+

# Bundle analysis
npm run build
# Check: dist/assets sizes
# Goal: Main JS < 400KB gzip
```

---

## 🚀 DEPLOYMENT (Week 2)

### Pre-Deployment Checklist

- [ ] All staging tests passing
- [ ] RLS policies deployed to production database
- [ ] Environment variables set in Vercel
- [ ] Security headers configured (vercel.json updated)
- [ ] Backup created of staging database
- [ ] Team notified of deployment window
- [ ] Rollback plan documented (see below)

### Deployment Steps (Vercel)

1. **Merge to Main**:
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

2. **Verify Vercel Build**:
   - Check Vercel Dashboard → Deployments
   - Build should succeed in < 5s
   - No build errors or warnings

3. **Monitor First Hour**:
   - Watch error logs (Sentry or Vercel logs)
   - Monitor uptime alerts
   - Test critical user flows:
     - Order creation
     - Login
     - Invitation view
     - RSVP submission

### Rollback Plan (If Issues Occur)

1. **Immediate Rollback**:
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push origin main
   # Vercel auto-deploys
   ```

2. **Communication**:
   - Notify team immediately
   - Post status update to users (if applicable)
   - Investigate root cause

3. **Post-Incident Review**:
   - Document what went wrong
   - Create PR to prevent recurrence
   - Update runbooks

---

## 📈 POST-DEPLOYMENT (Week 2 Ongoing)

### First Week Monitoring

- [ ] Daily: Check error logs, performance metrics
- [ ] Daily: Test critical user flows
- [ ] Monitor user feedback (comments, support tickets)
- [ ] Track performance improvements/regressions

### Ongoing Maintenance

**Daily**:
- [ ] Monitor alerts (errors, uptime, performance)
- [ ] Review logs for suspicious activity

**Weekly**:
- [ ] Analyze performance trends
- [ ] Review user feedback
- [ ] Check for dependency updates (npm audit)
- [ ] Verify backups are working

**Monthly**:
- [ ] Security audit of access logs
- [ ] RLS policy effectiveness review
- [ ] Database optimization (reindex if needed)
- [ ] Cost analysis (Supabase, Vercel usage)

---

## 🔧 TROUBLESHOOTING

### Common Production Issues

**Issue**: Build fails on Vercel but works locally
- [ ] Verify env vars are set in Vercel dashboard
- [ ] Check for hardcoded paths (should use relative/env vars)
- [ ] Clear Vercel cache: Redeploy

**Issue**: Website shows blank page
- [ ] Check Vercel logs for build errors
- [ ] Verify supabaseClient.js env vars are correct
- [ ] Check browser console for JavaScript errors
- [ ] Test with `npm run preview` locally

**Issue**: Login fails in production but works staging
- [ ] Verify Supabase project URL and key match
- [ ] Check RLS policies are not blocking queries
- [ ] Verify CORS is not blocking requests
- [ ] Check browser cookies/sessionStorage (DevTools)

**Issue**: Slow page load in production
- [ ] Run Lighthouse audit
- [ ] Check bundle size: `npm run build`
- [ ] Verify images are optimized
- [ ] Enable compression in Vercel (usually automatic)

---

## 📋 FINAL CHECKLIST (Go/No-Go Decision)

Before marking as production-ready, verify:

- [ ] Code quality: ESLint 0 errors
- [ ] Build: Succeeds, no warnings
- [ ] Tests: Staging smoke tests all passing
- [ ] Security: All mitigations implemented
- [ ] Environment: All vars configured
- [ ] Database: RLS enabled, backups working
- [ ] Monitoring: Alerts configured
- [ ] Documentation: Runbooks ready
- [ ] Team: Training completed
- [ ] Stakeholders: Approval obtained

### Deployment Authorization

- [ ] Product Owner: _______________  Date: _______
- [ ] Technical Lead: _______________  Date: _______
- [ ] DevOps/Infrastructure: _______________  Date: _______

---

## 📚 Reference Documentation

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- React Best Practices: https://react.dev/learn
- Security Headers: https://securityheaders.com
- Performance Tips: https://web.dev/performance/

---

**Last Updated**: 2026-08-17  
**Next Review**: Before deployment  
**Owner**: DevOps/Deployment Team
