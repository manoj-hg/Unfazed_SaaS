import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import NoteEditor from '../../components/notes/NoteEditor';
import SoapTemplate from '../../components/notes/SoapTemplate';
import UpgradeModal from '../../components/common/UpgradeModal';
import Loader from '../../components/common/Loader';
import useEntitlement from '../../hooks/useEntitlement';
import { PenTool, Lock, Share2, Sparkles, Save, Trash2, CheckCircle } from 'lucide-react';

const Notes = () => {
  const { user } = useContext(AuthContext);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [notes, setNotes] = useState([]);
  const [noteType, setNoteType] = useState('private');
  const [noteFormat, setNoteFormat] = useState('freeform');
  const [title, setTitle] = useState('');
  const [freeformContent, setFreeformContent] = useState('');
  const [soapData, setSoapData] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    canAccess,
    gateAction,
    modalOpen,
    setModalOpen,
    blockedFeature,
    setBlockedFeature,
    upgradeTier,
    refreshEntitlements
  } = useEntitlement();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axiosInstance.get('/clients');
        setClients(res.data);
        if (res.data.length > 0) setSelectedClientId(res.data[0]._id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      const fetchNotes = async () => {
        try {
          const res = await axiosInstance.get(`/notes/client/${selectedClientId}`);
          setNotes(res.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchNotes();
    }
  }, [selectedClientId]);

  const handleTypeChange = (newType) => {
    if (newType === 'shared') {
      gateAction('can_use_shared_notes', () => {
        setNoteType('shared');
      });
    } else {
      setNoteType('private');
    }
  };

  const handleFormatChange = (newFormat) => {
    if (newFormat === 'soap') {
      gateAction('can_use_soap_templates', () => {
        setNoteFormat('soap');
      });
    } else {
      setNoteFormat('freeform');
    }
  };

  const handleSaveNote = async () => {
    if (!selectedClientId) return alert('Select a client first');
    setSaving(true);
    try {
      const content = noteFormat === 'soap' 
        ? `<p><strong>Subjective:</strong> ${soapData.subjective}</p><p><strong>Objective:</strong> ${soapData.objective}</p><p><strong>Assessment:</strong> ${soapData.assessment}</p><p><strong>Plan:</strong> ${soapData.plan}</p>`
        : freeformContent || '<p>Clinical consultation notes.</p>';

      const res = await axiosInstance.post('/notes', {
        client_id: selectedClientId,
        title: title || (noteFormat === 'soap' ? 'SOAP Progress Note' : 'Session Note'),
        content,
        type: noteType,
        format: noteFormat,
        soap_data: soapData
      });

      setNotes([res.data, ...notes]);
      setTitle('');
      setSoapData({ subjective: '', objective: '', assessment: '', plan: '' });
      alert('Clinical note successfully recorded and saved to client record.');
    } catch (err) {
      if (err.response?.data?.code === 'ENTITLEMENT_LOCKED') {
        setBlockedFeature(err.response.data.feature);
        setModalOpen(true);
      } else {
        alert(err.response?.data?.message || 'Failed to save note.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this clinical note?')) return;
    try {
      await axiosInstance.delete(`/notes/${noteId}`);
      setNotes(notes.filter((n) => n._id !== noteId));
    } catch (err) {
      alert('Failed to delete note');
    }
  };

  if (loading) return <Loader text="Loading clinical records & client notes..." />;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
          Module 5: Clinical Documentation & Role Isolation
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
          Clinical Documentation Studio
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Maintain private clinical reflections (therapist-only) or shared take-home psychoeducation materials. Gated by tier.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PenTool className="text-indigo-600" size={20} />
              <h2 className="text-lg font-bold text-slate-900">New Clinical Entry</h2>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Client
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Note Title / Topic
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Session 3: Cognitive Reframing"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Privacy & Format Toggles */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Privacy Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Privacy / Audience
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleTypeChange('private')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    noteType === 'private'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Lock size={13} />
                  <span>Private (Only You)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('shared')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    noteType === 'shared'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Share2 size={13} />
                  <span>Shared with Client</span>
                </button>
              </div>
            </div>

            {/* Template Format Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Clinical Format
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleFormatChange('freeform')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    noteFormat === 'freeform'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Rich Freeform
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatChange('soap')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    noteFormat === 'soap'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>SOAP Protocol</span>
                </button>
              </div>
            </div>
          </div>

          {/* Editor Body */}
          {noteFormat === 'soap' ? (
            <SoapTemplate data={soapData} onChange={setSoapData} />
          ) : (
            <NoteEditor
              content={freeformContent}
              onChange={setFreeformContent}
              placeholder="Document therapeutic interventions, affective observations, and homework tasks..."
            />
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveNote}
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save & Attach to Record'}</span>
            </button>
          </div>
        </div>

        {/* Existing Notes History */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4 max-h-[820px] overflow-y-auto">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Recorded Notes History</h2>
            <p className="text-xs text-slate-400">Chronological client documentation</p>
          </div>

          <div className="space-y-3">
            {notes.map((n) => (
              <div
                key={n._id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                    <span className="text-[11px] text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        n.type === 'private'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {n.type === 'private' ? '🔒 Private' : '🌐 Shared'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(n._id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {n.format === 'soap' && n.soap_data && (
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100 space-y-1 font-mono text-[11px]">
                    <div className="text-indigo-700 font-bold">SOAP Entry Recorded</div>
                    <div className="text-slate-600 truncate">S: {n.soap_data.subjective}</div>
                    <div className="text-slate-600 truncate">O: {n.soap_data.objective}</div>
                  </div>
                )}

                <div
                  className="prose prose-xs text-slate-600 max-h-24 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: n.content }}
                />
              </div>
            ))}

            {notes.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                No clinical notes recorded for this client yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Modal for gated features */}
      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        featureKey={blockedFeature}
        onUpgradeSuccess={async (newTier) => {
          await upgradeTier(newTier);
          refreshEntitlements();
        }}
      />
    </div>
  );
};

export default Notes;
