// ============================================================
// src/lib/mutationGuard.ts
// ------------------------------------------------------------
// Membedakan mutasi berhasil vs "0 baris terpengaruh" (RLS memblokir tanpa error) - mencegah toast sukses palsu.
// Dipakai di  : hooks/useEditActions, hooks/useRsvpTools, komponen admin
// Keterikatan : -(helper murni, tanpa dependency)
// ============================================================

// Membedakan "mutasi berhasil" dari "0 baris terpengaruh".
//
// Supabase PostgREST tidak mengembalikan error ketika RLS memblokir
// UPDATE/DELETE — hasilnya sukses dengan count 0. Tanpa pemeriksaan
// count, UI menampilkan toast sukses palsu.

/** Hasil mutasi supabase-js yang menyertakan opsi { count: 'exact' }. */
export interface CountedMutation {
  count: number | null;
  error: { message: string } | null;
}

/**
 * Melempar Error bila mutasi gagal ATAU mengenai 0 baris.
 * Pesan error siap ditampilkan via toast.
 */
export function requireAffected(
  result: CountedMutation,
  zeroRowsMessage: string,
): number {
  if (result.error) throw new Error(result.error.message);
  const affected = result.count ?? 0;
  if (affected === 0) throw new Error(zeroRowsMessage);
  return affected;
}
