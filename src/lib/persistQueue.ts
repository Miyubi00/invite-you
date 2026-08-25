// ============================================================
// src/lib/persistQueue.ts
// ------------------------------------------------------------
// Antrean serialisasi penulisan event_details: operasi tulis dieksekusi satu-per-satu sesuai urutan panggil, mencegah read-modify-write bertabrakan.
// Dipakai di  : hooks/useDashboardData, useEditActions, useFileUpload
// Keterikatan : -(helper murni Promise chain)
// ============================================================

// Antrean serialisasi untuk penulisan event_details.
//
// Menjamin operasi tulis dari berbagai sumber (auto-save upload,
// tombol Simpan, hapus musik) dieksekusi satu-per-satu sesuai urutan
// dipanggil — mencegah read-modify-write yang saling menimpa di klien.
// Penulisan per-field sendiri sudah atomik di server via RPC
// (update_event_details_field / push_gallery_item).

let chain: Promise<unknown> = Promise.resolve();

export function enqueuePersist<T>(task: () => PromiseLike<T>): Promise<T> {
  // PostgrestFilterBuilder adalah thenable, bukan Promise penuh —
  // bungkus agar hasilnya selalu Promise sungguhan.
  const run = chain.then(() => Promise.resolve(task()));
  // Rejection tidak boleh memutus antrean untuk tugas berikutnya.
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
