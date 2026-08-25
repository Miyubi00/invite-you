import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePagination } from './usePagination';

const items = Array.from({ length: 25 }, (_, i) => i + 1);

describe('usePagination', () => {
  it('memotong halaman pertama sesuai ukuran default (10)', () => {
    const { result } = renderHook(() => usePagination(items, ''));
    expect(result.current.pageItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.total).toBe(25);
  });

  it('berpindah halaman via setPage', () => {
    const { result } = renderHook(() => usePagination(items, ''));
    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);
    expect(result.current.pageItems).toEqual([21, 22, 23, 24, 25]);
  });

  it('reset ke halaman 1 saat resetKey (filter) berubah', () => {
    const { result, rerender } = renderHook(({ key }: { key: string }) => usePagination(items, key), {
      initialProps: { key: 'filter-a' },
    });
    act(() => result.current.setPage(2));
    expect(result.current.page).toBe(2);
    rerender({ key: 'filter-b' });
    expect(result.current.page).toBe(1);
  });

  it('clamp halaman bila jumlah data menyusut', () => {
    const { result, rerender } = renderHook(
      ({ data }: { data: number[] }) => usePagination(data, ''),
      { initialProps: { data: items } },
    );
    act(() => result.current.setPage(3));
    rerender({ data: items.slice(0, 5) });
    expect(result.current.totalPages).toBe(1);
    expect(result.current.page).toBe(1);
  });

  it('setPageSize kembali ke halaman 1', () => {
    const { result } = renderHook(() => usePagination(items, '', 10));
    act(() => result.current.setPage(2));
    act(() => result.current.setPageSize(50));
    expect(result.current.pageSize).toBe(50);
    expect(result.current.page).toBe(1);
    expect(result.current.pageItems.length).toBe(25);
  });
});