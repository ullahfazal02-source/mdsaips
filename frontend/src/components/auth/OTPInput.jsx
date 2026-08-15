import React, { useRef, useEffect } from 'react';

/**
 * Reusable 6-digit OTP Input Component for MDSAIPS
 * Handles auto-focus, backspace, paste, and arrow keys.
 */
export const OTPInput = ({ value = '', onChange, disabled = false }) => {
  const inputRefs = useRef([]);

  // Ensure digits array is always length 6
  const digits = Array(6)
    .fill('')
    .map((_, i) => (value && value[i] ? value[i] : ''));

  useEffect(() => {
    // Focus first empty input on mount if empty
    if (!value && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, e) => {
    const val = e.target.value;
    // Allow only numeric digit
    if (val && !/^\d+$/.test(val)) return;

    const newDigits = [...digits];

    // If multiple digits (e.g. pasted into single box)
    if (val.length > 1) {
      const pastedDigits = val.replace(/\D/g, '').slice(0, 6);
      onChange(pastedDigits);
      const focusIndex = Math.min(pastedDigits.length, 5);
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex].focus();
      }
      return;
    }

    newDigits[index] = val;
    const combined = newDigits.join('');
    onChange(combined);

    // Auto-advance focus to next field if digit entered
    if (val && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
        // Move to previous box if current is empty
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      onChange(pastedData);
      const targetIndex = Math.min(pastedData.length - 1, 5);
      if (inputRefs.current[targetIndex]) {
        inputRefs.current[targetIndex].focus();
      }
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2 sm:space-x-3 my-4">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={6}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold text-white bg-slate-900/90 border border-slate-700 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all duration-200 disabled:opacity-50"
        />
      ))}
    </div>
  );
};

export default OTPInput;
