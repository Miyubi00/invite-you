// ============================================================
// src/types/template.ts
// ------------------------------------------------------------
// Kontrak props tema undangan: TemplateProps, TemplateData, RsvpPayload, RsvpStatus - semua tema wajib mengikuti shape ini.
// Dipakai di  : templates/Registry, InvitationPage, TemplateDemoPage, utils/templateHelpers
// Keterikatan : ./database (re-export RsvpStatus)
// ============================================================

// The props contract shared by every invitation theme component.
import type { EventDetails, RsvpRow, RsvpStatus } from './database';
export type { RsvpStatus } from './database';

export interface RsvpPayload {
  status: RsvpStatus;
  pax: number;
  message?: string;
}

export interface TemplateData extends EventDetails {
  rsvps?: RsvpRow[];
}

export interface TemplateProps {
  groom: string;
  bride: string;
  date: string;
  guestName: string;
  orderId?: string;
  onRsvpSubmit?: (payload: RsvpPayload) => Promise<void>;
  submittedData?: RsvpRow | null;
  data: TemplateData;
}