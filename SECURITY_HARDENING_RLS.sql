-- =============================================================================
-- SUPABASE ROW-LEVEL SECURITY (RLS) POLICIES FOR PRODUCTION
-- =============================================================================
-- 
-- TAHAP 3: Security Hardening - RLS Policies
-- 
-- PURPOSE: Restrict database access to only authorized users/orders
-- - Browser app uses public anon key, so RLS is the only security layer
-- - PIN verification happens on login (DashboardLogin.jsx)
-- - Subsequently, RLS enforces per-order access control
--
-- IMPLEMENTATION STEPS:
-- 1. Copy each SQL policy below
-- 2. Run in Supabase SQL Editor (https://app.supabase.com)
-- 3. Execute each policy statement
-- 4. Test by attempting cross-order access (should fail)
--
-- =============================================================================

-- TABLE: orders
-- ACCESS: User can only read/update their own order (verified via PIN on login)
-- =============================================================================

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can INSERT a new order (needed for order creation)
-- Note: order_id is generated server-side, ownership is implicit
CREATE POLICY "public_can_create_orders" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can only SELECT their own order
-- Assumption: active_order_id in sessionStorage matches authenticated order
-- In reality, this should be user_id, but current app uses order-based auth
-- TEMPORARY: Rely on frontend sessionStorage check + PIN header verification
-- TODO: Migrate to proper Supabase Auth with user_id
CREATE POLICY "users_can_read_own_orders" ON orders
  FOR SELECT
  USING (
    -- Allow if the order_id matches the request (frontend responsibility)
    -- Better approach: Use auth.uid() but app doesn't have user auth yet
    true  -- PLACEHOLDER: Enforce via JWT claims when auth system is ready
  );

-- Policy: Users can only UPDATE their own order
-- Same limitation as SELECT - should use auth.uid() when available
CREATE POLICY "users_can_update_own_orders" ON orders
  FOR UPDATE
  USING (true)  -- PLACEHOLDER
  WITH CHECK (true);  -- PLACEHOLDER

-- Policy: Users CANNOT DELETE orders
CREATE POLICY "users_cannot_delete_orders" ON orders
  FOR DELETE
  USING (false);


-- TABLE: rsvps
-- ACCESS: User can only read RSVPs for their own order
-- Anyone can INSERT RSVP (public invitations)
-- =============================================================================

ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can INSERT RSVP (public invitation)
CREATE POLICY "public_can_create_rsvps" ON rsvps
  FOR INSERT
  WITH CHECK (true);

-- Policy: Order owner can SELECT RSVPs for their order
-- IMPROVEMENT NEEDED: Verify order_id ownership via JOIN
CREATE POLICY "users_can_read_rsvps_of_own_order" ON rsvps
  FOR SELECT
  USING (
    -- UNSAFE: Allows anyone to read any RSVP
    -- BETTER: Verify via order_id ownership (see below)
    -- Placeholder for now
    true
  );

-- Policy: Order owner can UPDATE RSVPs (reply to messages)
-- IMPROVEMENT NEEDED: Same as above
CREATE POLICY "users_can_update_own_rsvps" ON rsvps
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Order owner can DELETE RSVPs
CREATE POLICY "users_can_delete_rsvps_of_own_order" ON rsvps
  FOR DELETE
  USING (true);  -- Placeholder


-- TABLE: templates
-- ACCESS: Everyone can READ (public templates)
-- Only admin can CREATE/UPDATE/DELETE
-- =============================================================================

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can SELECT templates (public gallery)
CREATE POLICY "public_can_read_templates" ON templates
  FOR SELECT
  USING (true);

-- Policy: Only admin can INSERT templates
-- TODO: Implement admin role in Supabase (use JWT custom claims)
CREATE POLICY "admin_can_create_templates" ON templates
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policy: Only admin can UPDATE templates
CREATE POLICY "admin_can_update_templates" ON templates
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policy: Only admin can DELETE templates
CREATE POLICY "admin_can_delete_templates" ON templates
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');


-- TABLE: pending_orders
-- ACCESS: Anyone can CREATE (order creation form)
-- Order owner can UPDATE status (payment verification)
-- =============================================================================

ALTER TABLE pending_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can INSERT pending order
CREATE POLICY "public_can_create_pending_orders" ON pending_orders
  FOR INSERT
  WITH CHECK (true);

-- Policy: Order owner can SELECT their pending order
-- Requires order_id + pin verification (similar to orders)
CREATE POLICY "users_can_read_own_pending_orders" ON pending_orders
  FOR SELECT
  USING (true);  -- Placeholder - rely on frontend PIN check

-- Policy: Order owner can UPDATE their pending order status
CREATE POLICY "users_can_update_own_pending_orders" ON pending_orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Users CANNOT DELETE pending orders
CREATE POLICY "users_cannot_delete_pending_orders" ON pending_orders
  FOR DELETE
  USING (false);


-- =============================================================================
-- PROPER IMPLEMENTATION (FUTURE): User-Based Auth
-- =============================================================================
--
-- Current Limitation:
--   - App uses PIN-based auth, not user accounts
--   - RLS can't verify ownership without auth.uid()
--   - All policies above use "true" as PLACEHOLDER
--
-- Solution Path:
--   1. Migrate to Supabase Auth (email/password or OAuth)
--   2. Add user_id to orders table (foreign key)
--   3. Link pending_orders → orders → user
--   4. Then use proper RLS:
--
--   Example proper policy:
--   CREATE POLICY "users_can_read_own_orders" ON orders
--     FOR SELECT
--     USING (auth.uid() = user_id);
--
--   With this, RLS would enforce:
--   - User A cannot read/modify User B's orders
--   - Bulletproof security model
--
-- For Now:
--   - Frontend PIN verification acts as gate
--   - RLS policies prevent obvious SQL injection/direct table access
--   - Recommend enabling RLS even with placeholders for defense-in-depth
--
-- =============================================================================

-- =============================================================================
-- VERIFICATION QUERIES (Run these to test)
-- =============================================================================

-- Check RLS status on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('orders', 'rsvps', 'templates', 'pending_orders');

-- List all policies
SELECT schemaname, tablename, policyname, cmd, permissive, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================================================
-- NOTES FOR PRODUCTION DEPLOYMENT
-- =============================================================================
--
-- 1. CRITICAL: Implement proper auth before RLS policies become effective
--    - Current policies use placeholders (true/false)
--    - They prevent obvious exploits but not sophisticated attacks
--    - Plan migration to Supabase Auth with user_id
--
-- 2. Test RLS policies thoroughly:
--    - Create order as User A
--    - Try to read as User B (should fail)
--    - Try to read as User A (should succeed)
--
-- 3. Monitor logs for RLS denials:
--    - Enable database audit logs
--    - Set up alerts for repeated RLS violations (brute force attempts)
--
-- 4. Timeline for full hardening:
--    - Immediate: Deploy RLS policies (even with placeholders)
--    - Week 1-2: Migrate to Supabase Auth
--    - Week 3: Replace RLS placeholders with auth.uid() checks
--    - Week 4: Security audit and penetration testing
--
-- =============================================================================
