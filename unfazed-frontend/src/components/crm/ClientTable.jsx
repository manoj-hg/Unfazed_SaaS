import React from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, Tag, ChevronRight, CheckCircle2 } from 'lucide-react';

const ClientTable = ({ clients }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-4 px-6">Client Information</th>
              <th className="py-4 px-6">Clinical Status</th>
              <th className="py-4 px-6">Tags & Modalities</th>
              <th className="py-4 px-6">Last Session</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {clients.map((client) => {
              const lastSessionFormatted = client.last_session
                ? new Date(client.last_session).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                : 'No prior sessions';

              return (
                <tr key={client._id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-inner">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {client.name}
                        </div>
                        <div className="text-xs text-slate-400">{client.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        client.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : client.status === 'lead'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {client.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {client.tags?.length > 0 ? (
                        client.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-300 italic">No tags</span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6 text-slate-500 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      <span>{lastSessionFormatted}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <Link
                      to={`/dashboard/clients/${client._id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 font-bold text-xs transition-colors"
                    >
                      <span>Profile</span>
                      <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {clients.length === 0 && (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400">
                  No client records found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientTable;
