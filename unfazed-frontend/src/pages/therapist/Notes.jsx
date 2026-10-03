import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import axiosInstance from '../../api/axiosInstance';
import { PenTool, History, User } from 'lucide-react';

const Notes = () => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [notes, setNotes] = useState([]);
  const [noteType, setNoteType] = useState('private');

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Start typing your clinical note here...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px]',
      },
    },
  });

  useEffect(() => {
    const fetchClients = async () => {
      const res = await axiosInstance.get('/clients');
      setClients(res.data);
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      const fetchNotes = async () => {
        const res = await axiosInstance.get(`/notes/client/${selectedClientId}`);
        setNotes(res.data);
      };
      fetchNotes();
    }
  }, [selectedClientId]);

  const handleSaveNote = async () => {
    if (!selectedClientId) return alert('Select a client first');
    const content = editor.getHTML();
    
    try {
      const res = await axiosInstance.post('/notes', {
        client_id: selectedClientId,
        content,
        type: noteType
      });
      setNotes([res.data, ...notes]);
      editor.commands.setContent('');
      alert('Note saved!');
    } catch (err) {
      alert('Failed to save note');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clinical Documentation</h1>
        <p className="text-gray-500 mt-1">Manage private session notes and shared client resources.</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        {/* Editor Section */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[500px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <PenTool size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">New Entry</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
              <select 
                value={selectedClientId} 
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
              >
                <option value="">-- Choose a Client --</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Note Privacy</label>
              <select 
                value={noteType} 
                onChange={(e) => setNoteType(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
              >
                <option value="private">Private (Only you)</option>
                <option value="shared">Shared (Visible to client)</option>
              </select>
            </div>
          </div>

          <div className="flex-1 border border-gray-200 rounded-xl p-4 mb-6 bg-gray-50/30 overflow-y-auto">
            <EditorContent editor={editor} />
          </div>

          <button onClick={handleSaveNote} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 w-full sm:w-auto self-end">
            Save Note
          </button>
        </div>

        {/* History Section */}
        <div className="w-full lg:w-96 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
              <History size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Note History</h2>
          </div>
          
          {!selectedClientId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
              <User size={48} className="mb-4 opacity-20" />
              <p>Select a client to view their history</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {notes.length === 0 && <p className="text-center text-gray-400 mt-10">No notes found for this client.</p>}
              {notes.map(note => (
                <div key={note._id} className="bg-gray-50 p-5 rounded-xl border border-gray-100 relative group">
                  <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-xl ${note.type === 'private' ? 'bg-red-400' : 'bg-green-400'}`}></div>
                  <div className="flex justify-between items-start mb-3 pl-2">
                    <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
                      {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${note.type === 'private' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {note.type}
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700 pl-2 line-clamp-4 group-hover:line-clamp-none transition-all" dangerouslySetInnerHTML={{ __html: note.content }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
