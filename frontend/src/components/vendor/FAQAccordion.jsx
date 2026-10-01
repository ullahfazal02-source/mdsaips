import React, { useState } from 'react';

/**
 * FAQAccordion Component
 * Renders interactive expandable Q&A accordion section on Service Details page.
 */
const FAQAccordion = ({ faqs = [] }) => {
  const [openIndex, setOpenIndex] = useState(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
        <span>❓</span> Frequently Asked Questions
      </h3>

      <div className="divide-y divide-gray-100">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-3">
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between text-left font-semibold text-gray-800 text-sm hover:text-indigo-600 transition-colors py-1"
              >
                <span>{faq.question}</span>
                <span className="text-base text-gray-400 ml-2">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="mt-2 text-xs text-gray-600 leading-relaxed pl-2 border-l-2 border-indigo-500">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQAccordion;
