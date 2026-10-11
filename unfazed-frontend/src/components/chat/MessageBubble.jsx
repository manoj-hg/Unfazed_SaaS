import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = ({ message, isCurrentUser }) => {
  const formattedTime = new Date(message.createdAt || message.timestamp || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex flex-col mb-4 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isCurrentUser
            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-xs'
            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.message}</p>
        <div
          className={`flex items-center justify-end gap-1 text-[10px] mt-1.5 ${
            isCurrentUser ? 'text-indigo-200' : 'text-slate-400'
          }`}
        >
          <span>{formattedTime}</span>
          {isCurrentUser && (
            <span>
              {message.read ? <CheckCheck size={12} className="text-emerald-300" /> : <Check size={12} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
