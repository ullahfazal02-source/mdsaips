/**
 * Dynamic Script Loader for Razorpay Checkout JS
 * 
 * Safely appends https://checkout.razorpay.com/v1/checkout.js to document body.
 * Prevents duplicate script tags and handles load/error events asynchronously.
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if script is already present in document
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById('razorpay-checkout-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

export default loadRazorpayScript;
