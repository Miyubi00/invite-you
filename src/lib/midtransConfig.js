// src/lib/midtransConfig.js
// 
// Midtrans Payment Gateway Configuration
// Dynamically loads Snap widget based on environment
//

export const initializeMidtrans = () => {
  const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

  if (!clientKey) {
    console.warn('[Midtrans] Payment gateway not configured. VITE_MIDTRANS_CLIENT_KEY is not set.');
    // Fallback: prevent errors when snap is called
    if (!window.snap) {
      window.snap = {
        pay: () => {
          throw new Error('Midtrans payment gateway is not configured. Please set VITE_MIDTRANS_CLIENT_KEY environment variable.');
        }
      };
    }
    return false;
  }

  // If Snap is already loaded (from index.html), verify it's configured correctly
  if (window.snap && typeof window.snap.pay === 'function') {
    console.log('[Midtrans] Snap widget loaded successfully');
    return true;
  }

  console.warn('[Midtrans] Snap widget not found. Make sure Midtrans script is loaded in index.html');
  return false;
};

export const isMidtransEnabled = () => {
  return !!import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
};

export const getMidtransEnvironment = () => {
  return import.meta.env.VITE_MIDTRANS_ENVIRONMENT || 'sandbox';
};

export const isMidtransProduction = () => {
  return getMidtransEnvironment() === 'production';
};
