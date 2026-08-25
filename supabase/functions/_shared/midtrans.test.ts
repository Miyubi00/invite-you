// supabase/functions/_shared/midtrans.test.ts
// Unit tests for webhook trust-boundary helpers.
//
// Run: deno test supabase/functions/_shared/midtrans.test.ts --allow-net
// (crypto.subtle is available in the Deno runtime; no other permissions needed)

import {
  assert,
  assertEquals,
  assertFalse,
} from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import {
  extractNotificationFields,
  mapTransactionStatus,
  verifyMidtransSignature,
} from './midtrans.ts';

const SERVER_KEY = 'test-server-key-not-a-real-secret';

async function sha512Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-512', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function validFields() {
  return {
    orderId: 'undangan-1700000000-abc123',
    statusCode: '200',
    grossAmount: '60000.00',
    signatureKey: '', // filled per-test
  };
}

Deno.test('valid signature is accepted', async () => {
  const f = validFields();
  f.signatureKey = await sha512Hex(
    `${f.orderId}${f.statusCode}${f.grossAmount}${SERVER_KEY}`,
  );
  assertEquals(await verifyMidtransSignature(f, SERVER_KEY), true);
});

Deno.test('MISSING signature is rejected (never skipped)', async () => {
  const f = validFields();
  const extractorResult = extractNotificationFields({
    order_id: f.orderId,
    status_code: f.statusCode,
    gross_amount: f.grossAmount,
    // signature_key intentionally absent
  });
  assertEquals(extractorResult, null); // rejected before verification

  // Even if an empty string slips through extraction, verification fails.
  f.signatureKey = '';
  assertEquals(
    await verifyMidtransSignature({ ...f }, SERVER_KEY),
    false,
  );
});

Deno.test('invalid signature is rejected', async () => {
  const f = validFields();
  f.signatureKey = await sha512Hex(
    `${f.orderId}${f.statusCode}${f.grossAmount}WRONG-KEY`,
  );
  assertFalse(await verifyMidtransSignature(f, SERVER_KEY));
});

Deno.test('tampered gross_amount invalidates signature', async () => {
  const f = validFields();
  f.signatureKey = await sha512Hex(
    `${f.orderId}${f.statusCode}1.00${SERVER_KEY}`, // signed as Rp 1
  );
  const tampered = { ...f, grossAmount: '60000.00' }; // claimed as Rp 60k
  assertFalse(await verifyMidtransSignature(tampered, SERVER_KEY));
});

Deno.test('unconfigured server key rejects everything', async () => {
  const f = validFields();
  f.signatureKey = 'x';
  assertFalse(await verifyMidtransSignature(f, undefined));
  assertFalse(await verifyMidtransSignature(f, ''));
});

Deno.test('malformed payloads are rejected', () => {
  const good = {
    order_id: 'o-1',
    status_code: '200',
    gross_amount: '10.00',
    signature_key: 'a'.repeat(128),
    transaction_status: 'settlement',
  };
  assert(extractNotificationFields(good) !== null);

  assertEquals(extractNotificationFields(null), null);
  assertEquals(extractNotificationFields('string'), null);
  assertEquals(extractNotificationFields({ ...good, order_id: undefined }), null);
  assertEquals(extractNotificationFields({ ...good, order_id: 42 }), null);
  assertEquals(extractNotificationFields({ ...good, gross_amount: 'abc' }), null);
  assertEquals(extractNotificationFields({ ...good, gross_amount: '' }), null);
  assertEquals(extractNotificationFields({ ...good, status_code: '' }), null);
  assertEquals(
    extractNotificationFields({ ...good, signature_key: undefined }),
    null,
  );
});

Deno.test('status mapping', () => {
  // Success paths
  assertEquals(mapTransactionStatus('settlement', 'accept'), 'success');
  assertEquals(mapTransactionStatus('capture', 'accept'), 'success');
  assertEquals(mapTransactionStatus('settlement', undefined), 'success');

  // Challenged transaction must NOT activate
  assertEquals(mapTransactionStatus('capture', 'challenge'), null);

  // Failure paths
  assertEquals(mapTransactionStatus('deny', 'accept'), 'failed');
  assertEquals(mapTransactionStatus('cancel', undefined), 'failed');
  assertEquals(mapTransactionStatus('expire', undefined), 'failed');

  // Everything else must NOT touch the database
  assertEquals(mapTransactionStatus('pending', undefined), null);
  assertEquals(mapTransactionStatus('refund', undefined), null);
  assertEquals(mapTransactionStatus('partial_refund', undefined), null);
  assertEquals(mapTransactionStatus('some_future_status', undefined), null);
  assertEquals(mapTransactionStatus(undefined, undefined), null);
  assertEquals(mapTransactionStatus(123, undefined), null);
});
