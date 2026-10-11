import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import MessageBubble from './MessageBubble';
import { Send, MessageSquare, Shield } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const ChatWindow = ({ therapistId, clientId, currentUserRole = 'therapist', participantName = 'Participant' }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const roomId = `${therapistId}_${clientId}`;

  useEffect(() => {
    // 1. Fetch persistent chat history
    const fetchHistory = async () => {
      try {
        const res = await axiosInstance.get(`/clients/${clientId}/chat`);
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
    };
    if (clientId) fetchHistory();

    // 2. Connect Socket
    const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.emit('join_room', roomId);

    socket.on('receive_message', (newMsg) => {
      if (newMsg.room === roomId || (newMsg.therapist_id === therapistId && newMsg.client_id === clientId)) {
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    socket.on('user_typing', (data) => {
      if (data.sender !== currentUserRole) {
        setIsOtherTyping(data.isTyping);
      }
    });

    socket.on('messages_read', (data) => {
      if (data.reader !== currentUserRole) {
        setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
      }
    });

    // Mark as read
    socket.emit('mark_as_read', {
      therapist_id: therapistId,
      client_id: clientId,
      reader: currentUserRole,
      room: roomId
    });

    return () => {
      socket.disconnect();
    };
  }, [therapistId, clientId, roomId, currentUserRole]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!socketRef.current) return;

    socketRef.current.emit('typing_start', { room: roomId, sender: currentUserRole });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing_stop', { room: roomId, sender: currentUserRole });
    }, 1200);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current) return;

    const messageData = {
      therapist_id: therapistId,
      client_id: clientId,
      sender: currentUserRole,
      message: inputText.trim(),
      room: roomId
    };

    socketRef.current.emit('send_message', messageData);
    socketRef.current.emit('typing_stop', { room: roomId, sender: currentUserRole });

    setInputText('');
  };

  return (
    <div className="flex flex-col h-[560px] bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-inner">
            {participantName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{participantName}</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Encrypted Direct Messaging</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
          <Shield size={12} className="text-indigo-600" />
          <span>Confidential</span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-2">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
            <MessageSquare size={36} className="mb-2 text-slate-300" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1">Start a private conversation with {participantName}.</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <MessageBubble
            key={msg._id || index}
            message={msg}
            isCurrentUser={msg.sender === currentUserRole}
          />
        ))}
        {isOtherTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic py-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <span>{participantName} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder={`Type a secure message to ${participantName}...`}
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
