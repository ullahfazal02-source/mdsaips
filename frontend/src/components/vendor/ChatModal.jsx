import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * ChatModal Component
 * Booking-scoped customer ↔ vendor secure chat drawer/modal.
 */
const ChatModal = ({ booking, isOpen, onClose, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem('token');
  const API_BASE = '/api/v1';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!booking?._id && !booking?.id) return;
    const bookingId = booking._id || booking.id;
    try {
      const res = await axios.get(`${API_BASE}/chats/booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setMessages(res.data.data?.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch chat messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && booking) {
      setLoading(true);
      fetchMessages();
      const interval = setInterval(fetchMessages, 4000); // 4-sec polling
      return () => clearInterval(interval);
    }
  }, [isOpen, booking]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const bookingId = booking._id || booking.id;
    setSending(true);
    try {
      const res = await axios.post(
        `${API_BASE}/chats/booking/${bookingId}/messages`,
        { message: newMessage.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !booking) return null;

  const customerName = booking.customerId?.name || booking.customer?.name || 'Customer';
  const vendorName = booking.vendorId?.businessName || booking.vendor?.businessName || 'Vendor';
  const serviceTitle = booking.serviceId?.title || booking.service?.title || 'Service Booking';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-md">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <span>💬</span> Booking Chat
            </h3>
            <p className="text-xs text-indigo-100 mt-0.5 truncate max-w-xs">
              {serviceTitle} (#{booking.bookingNumber || booking.id})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Info Strip */}
        <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2 flex items-center justify-between text-xs text-indigo-900">
          <span>Customer: <strong>{customerName}</strong></span>
          <span>Status: <strong className="capitalize">{booking.status}</strong></span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Loading chat history...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm text-center">
              <span className="text-3xl mb-2">💬</span>
              <p>No messages yet.</p>
              <p className="text-xs mt-1">Start a conversation regarding this booking.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
              const currentUserId = currentUser?._id || currentUser?.id;
              const isMe = String(senderId) === String(currentUserId);

              return (
                <div
                  key={msg._id || idx}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    <div
                      className={`text-[10px] mt-1 text-right font-medium ${
                        isMe ? 'text-indigo-200' : 'text-gray-400'
                      }`}
                    >
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {isMe && <span className="ml-1">{msg.isRead ? '✓✓' : '✓'}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-full focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm rounded-full transition-colors flex items-center gap-1 shadow-xs"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
