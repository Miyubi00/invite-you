// ============================================================
// src/types/database.ts
// ------------------------------------------------------------
// Tipe baris (Row) tabel Supabase yang dipakai app: orders, pending_orders, rsvps, templates + EventDetails, BankAccount, dsb.
// Dipakai di  : Sangat luas: pages, components, hooks, utils
// Keterikatan : -(type-only, tanpa runtime dependency)
// ============================================================

// Shared Supabase row shapes for the tables used across the app.

export const PAYMENT_STATUS_SUCCESS = 'success';

export type PaymentStatus =
  | 'success'
  | 'paid'
  | 'pending'
  | 'failed'
  | (string & {});

/** Status RSVP — didukung ENUM PostgreSQL `public.rsvp_status` (lihat migrasi 20260824170000). */
export type RsvpStatus = 'hadir' | 'tidak_hadir' | 'ragu';

export interface BankAccount {
  bank: string;
  number: string;
  name: string;
}

/**
 * The dynamic `event_details` JSON column on an order.
 * Fields are optional because older / partial records may not set all of them;
 * pages and themes always guard with optional chaining + fallbacks.
 */
export interface EventDetails {
  venue_name?: string;
  venue_address?: string;
  maps_link?: string;
  akad_date?: string;
  akad_time?: string;
  resepsi_date?: string;
  resepsi_time?: string;
  groom_parents?: string;
  bride_parents?: string;
  groom_photo?: string;
  bride_photo?: string;
  cover_photo?: string;
  gallery?: string[];
  banks?: BankAccount[];
  audio_url?: string;
  quote?: string;
  quote_src?: string;
}

export interface OrderRow {
  id: string;
  slug: string;
  groom_name: string;
  bride_name: string;
  wedding_date: string;
  whatsapp: string;
  pin_code: string;
  template_slug: string;
  payment_status: string;
  event_details?: EventDetails | null;
  midtrans_order_id?: string | null;
  snap_token?: string | null;
  created_at?: string;
  /** Email pelanggan tujuan pengiriman PIN otomatis. */
  email?: string | null;
}

export interface RsvpRow {
  id: string;
  order_id: string;
  session_id: string;
  guest_name: string;
  status: RsvpStatus;
  pax: number;
  message?: string;
  reply?: string;
  created_at?: string;
}

export interface PendingOrderRow {
  id: string;
  groom_name: string;
  bride_name: string;
  wedding_date: string;
  whatsapp: string;
  template_slug: string;
  status?: string;
  created_at?: string;
  event_details?: EventDetails | null;
  /** Email pelanggan, dipindahkan ke orders saat aktivasi admin. */
  email?: string | null;
}

export interface TemplateRow {
  id?: string;
  name: string;
  slug: string;
  category?: string;
  price: number;
  image?: string;
  is_active?: boolean;
  created_at?: string;
}

/**
 * Kolom aman yang terekspose lewat view `public_invitations` untuk
 * halaman undangan publik. Tanpa pin_code / snap_token /
 * midtrans_order_id / email / whatsapp.
 */
export interface PublicInvitationRow {
  id: string;
  slug: string;
  groom_name: string;
  bride_name: string;
  wedding_date: string;
  template_slug: string;
  payment_status: string;
  event_details?: EventDetails | null;
  created_at?: string;
}

/**
 * Shape used by the Admin "Edit Order" modal and Dashboard forms:
 * editable order columns merged with the dynamic event_details fields.
 */
export interface OrderEditForm extends Partial<Omit<OrderRow, 'event_details'>>, Partial<EventDetails> {
  gallery?: string[];
  banks?: BankAccount[];
}

/**
 * Minimal Supabase "Database" schema covering only the tables/columns the app
 * touches. Passed as the generic to `createClient` so every `.from('...')`
 * query and `.rpc(...)` call is validated against these row shapes.
 */
export interface Database {
  public: {
    Tables: {
      orders: {
        Row: OrderRow;
        Insert: Partial<OrderRow> & { wedding_date: string };
        Update: Partial<OrderRow>;
        Relationships: [];
      };
      rsvps: {
        Row: RsvpRow;
        Insert: Partial<RsvpRow> & { order_id: string };
        Update: Partial<RsvpRow>;
        Relationships: [];
      };
      pending_orders: {
        Row: PendingOrderRow;
        Insert: Partial<PendingOrderRow>;
        Update: Partial<PendingOrderRow>;
        Relationships: [];
      };
      templates: {
        Row: TemplateRow;
        Insert: Partial<TemplateRow>;
        Update: Partial<TemplateRow>;
        Relationships: [];
      };
    };
    Views: {
      public_invitations: { Row: PublicInvitationRow };
    },
    Functions: {
      login_client: {
        Args: { p_whatsapp: string; p_pin: string };
        Returns: Pick<OrderRow, 'id' | 'payment_status'> & Partial<OrderRow>;
      };
    };
    Enums: Record<string, object>;
    CompositeTypes: Record<string, object>;
  };
}