import React, { useState } from 'react';
import axios from 'axios';

/**
 * FAQBuilder Component
 * Vendor interface for managing frequently asked questions (FAQs) per service listing.
 */
const FAQBuilder = ({ serviceId, initialFaqs = [], onUpdate }) => {
  const [faqs, setFaqs] = useState(initialFaqs || []);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');
  const API_BASE = '/api/v1';

  const handleAddFaq = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    const newFaqList = [
      ...faqs,
      { question: question.trim(), answer: answer.trim(), displayOrder: faqs.length + 1 },
    ];

    saveFaqs(newFaqList);
  };

  const handleDeleteFaq = (index) => {
    const updated = faqs.filter((_, i) => i !== index);
    saveFaqs(updated);
  };

  const saveFaqs = async (updatedFaqs) => {
    setSaving(true);
    try {
      const res = await axios.put(
        `${API_BASE}/services/${serviceId}/faqs`,
        { faqs: updatedFaqs },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setFaqs(res.data.data.faqs || []);
        setQuestion('');
        setAnswer('');
        if (onUpdate) onUpdate(res.data.data.faqs);
      }
    } catch (err) {
      console.error('Failed to save service FAQs:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
      <div>
        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
          <span>❓</span> Service Frequently Asked Questions (FAQs)
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Answer common customer questions to resolve doubts before booking.
        </p>
      </div>

      {/* Existing FAQs list */}
      {faqs.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No FAQs added for this service yet.</p>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
              <div className="flex items-start justify-between">
                <h4 className="font-bold text-gray-900 text-sm">Q: {faq.question}</h4>
                <button
                  onClick={() => handleDeleteFaq(idx)}
                  className="text-gray-400 hover:text-red-600 text-xs font-semibold"
                >
                  Delete
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">A: {faq.answer}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add FAQ Form */}
      <form onSubmit={handleAddFaq} className="space-y-3 pt-4 border-t border-gray-100">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Question</label>
          <input
            type="text"
            placeholder="e.g. Do you provide spare parts?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Answer</label>
          <textarea
            rows="2"
            placeholder="e.g. Yes, spare parts are provided and billed separately at MRP."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={saving || !question.trim() || !answer.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : 'Add FAQ'}
        </button>
      </form>
    </div>
  );
};

export default FAQBuilder;
