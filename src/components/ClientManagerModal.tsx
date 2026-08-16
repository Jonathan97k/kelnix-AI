import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Building, 
  Sparkles, 
  MessageSquare, 
  Hash, 
  Share2, 
  ExternalLink,
  Bot,
  Layers,
  Facebook,
  ShieldCheck,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { ClientProfile } from '../types';

interface ClientManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientProfile[];
  activeClientId: string;
  onSelectActiveClient: (client: ClientProfile) => void;
  onSaveClient: (client: ClientProfile) => void;
  onDeleteClient: (clientId: string) => void;
}

export const ClientManagerModal: React.FC<ClientManagerModalProps> = ({
  isOpen,
  onClose,
  clients,
  activeClientId,
  onSelectActiveClient,
  onSaveClient,
  onDeleteClient,
}) => {
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    const newClient: ClientProfile = {
      id: `client-${Date.now()}`,
      name: '',
      industry: 'Fashion & Retail',
      brandVoice: 'Chic, Modern, Relatable & Engaging',
      targetAudience: 'Modern consumers looking for premium quality and personalized service',
      keySellingPoints: 'Exclusive collections, top customer ratings, fast shipping',
      callToAction: 'Click link in bio to shop or DM us for VIP orders!',
      defaultHashtags: '#brand #trending #viral #aesthetic #reels',
      brandColor: '#E11D48',
      facebookPageName: '',
      facebookPageId: '',
      instagramHandle: '',
      notes: '',
      createdAt: new Date().toISOString(),
    };
    setEditingClient(newClient);
    setIsCreating(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editingClient.name.trim()) return;

    onSaveClient(editingClient);
    if (isCreating) {
      onSelectActiveClient(editingClient);
    }
    setEditingClient(null);
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-blue-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Client & Brand Profile Hub
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Multi-Account Agency Mode
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Register separate clients so Gemini crafts distinct reels, brand voice & Facebook posts per client without mixing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-slate-700">
          {/* If Editing/Creating a Client */}
          {editingClient ? (
            <form onSubmit={handleSaveForm} className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-400" />
                  {isCreating ? 'Register New Client' : `Edit Client: ${editingClient.name}`}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setEditingClient(null);
                    setIsCreating(false);
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {/* Grid 1: Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                    Client / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                    placeholder="e.g. Bella Flora Florist or Apex Gym"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                    Industry / Niche
                  </label>
                  <input
                    type="text"
                    value={editingClient.industry}
                    onChange={(e) => setEditingClient({ ...editingClient, industry: e.target.value })}
                    placeholder="e.g. Fitness, Fashion, Real Estate, Dental..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Brand Voice */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                  Brand Voice & Tone (Trained into Gemini)
                </label>
                <input
                  type="text"
                  value={editingClient.brandVoice}
                  onChange={(e) => setEditingClient({ ...editingClient, brandVoice: e.target.value })}
                  placeholder="e.g. High-Energy & Bold, or Elegant & Poetic, or Relatable & Witty"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-hidden"
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                  Target Customer Demographic & Persona
                </label>
                <textarea
                  rows={2}
                  value={editingClient.targetAudience}
                  onChange={(e) => setEditingClient({ ...editingClient, targetAudience: e.target.value })}
                  placeholder="Describe who buys from this client (e.g. Men aged 25-40 wanting strength workouts, or Moms looking for weekend family brunches)..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-hidden"
                />
              </div>

              {/* Selling Points & CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                    Key Value Props / Offers
                  </label>
                  <input
                    type="text"
                    value={editingClient.keySellingPoints}
                    onChange={(e) => setEditingClient({ ...editingClient, keySellingPoints: e.target.value })}
                    placeholder="e.g. Free delivery, 100% organic, 24/7 support"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                    Default Call-to-Action (CTA)
                  </label>
                  <input
                    type="text"
                    value={editingClient.callToAction}
                    onChange={(e) => setEditingClient({ ...editingClient, callToAction: e.target.value })}
                    placeholder="e.g. Link in bio to shop! or DM 'START' for discount"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Social Handles & Connected Facebook Page */}
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <Facebook className="w-4 h-4 fill-current" />
                  <span>Facebook Page & Social Channel Mapping</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Facebook Page Name</label>
                    <input
                      type="text"
                      value={editingClient.facebookPageName || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, facebookPageName: e.target.value })}
                      placeholder="e.g. Aura Luxe Boutique Official"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Facebook Page ID / Username</label>
                    <input
                      type="text"
                      value={editingClient.facebookPageId || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, facebookPageId: e.target.value })}
                      placeholder="e.g. 102938475619283 or page_username"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Client Hashtags Bundle</label>
                  <input
                    type="text"
                    value={editingClient.defaultHashtags}
                    onChange={(e) => setEditingClient({ ...editingClient, defaultHashtags: e.target.value })}
                    placeholder="#brand #industry #reels #local"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-purple-300 font-mono focus:border-purple-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Save Client Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingClient(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Client Profile</span>
                </button>
              </div>
            </form>
          ) : (
            /* Client List Overview */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Registered Clients ({clients.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Switch active client to tailor Gemini AI reel director and Facebook publishing
                  </p>
                </div>

                <button
                  onClick={handleStartCreate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Client</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {clients.map((client) => {
                  const isActive = client.id === activeClientId;
                  return (
                    <div
                      key={client.id}
                      onClick={() => onSelectActiveClient(client)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isActive
                          ? 'bg-purple-950/30 border-purple-500 ring-2 ring-purple-500/30 shadow-lg'
                          : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {/* Left: Info */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white flex-shrink-0 text-sm shadow-md"
                          style={{ backgroundColor: client.brandColor || '#8B5CF6' }}
                        >
                          {client.name.substring(0, 2).toUpperCase() || 'CL'}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate">{client.name}</h4>
                            {isActive && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 flex-shrink-0">
                                <UserCheck className="w-3 h-3" /> Active Client
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-purple-300 font-medium truncate mt-0.5">
                            {client.industry} • <span className="text-slate-300">{client.brandVoice}</span>
                          </div>

                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                            🎯 Audience: {client.targetAudience}
                          </div>

                          {client.facebookPageName && (
                            <div className="flex items-center gap-1 text-[11px] text-blue-400 font-semibold mt-1">
                              <Facebook className="w-3 h-3 fill-current" />
                              <span>{client.facebookPageName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingClient(client);
                            setIsCreating(false);
                          }}
                          className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                          title="Edit Client Information"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {clients.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete client "${client.name}"?`)) {
                                onDeleteClient(client.id);
                              }
                            }}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                            title="Delete Client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            onSelectActiveClient(client);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isActive
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                          }`}
                        >
                          <span>{isActive ? 'Current' : 'Select'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Client data persisted in dedicated secure storage</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
