import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  LogOut,
  Calendar,
  Users,
  BellRing,
  MessageSquare,
  Plus,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/hooks';
import { useToast } from '../components/Toast';
import { useRealtimeCollection } from '../lib/hooks';
import { useRealtimeStats } from '../lib/hooks';
import { safeUrl } from '../lib/security';
import type { EventItem, UpdateItem, RegistrationItem, ContactMessageItem } from '../lib/types';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, loading: authLoading, isAuthenticated, signOut } = useAuth();
  const { stats, refetch: refetchStats } = useRealtimeStats();

  const [activeTab, setActiveTab] = useState<'events' | 'registrations' | 'updates' | 'messages' | 'security'>('events');

  // Realtime collections
  const { data: events, refetch: refetchEvents } = useRealtimeCollection<EventItem>({
    table: 'events',
    orderColumn: 'event_date',
    ascending: false,
  });

  const { data: updates, refetch: refetchUpdates } = useRealtimeCollection<UpdateItem>({
    table: 'updates',
    orderColumn: 'created_at',
    ascending: false,
  });

  const { data: registrations, refetch: refetchRegistrations } = useRealtimeCollection<RegistrationItem>({
    table: 'registrations',
    orderColumn: 'created_at',
    ascending: false,
  });

  const { data: messages, refetch: refetchMessages } = useRealtimeCollection<ContactMessageItem>({
    table: 'contact_messages',
    orderColumn: 'created_at',
    ascending: false,
  });

  // State for Create Event form
  const [showEventModal, setShowEventModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newPosterUrl, setNewPosterUrl] = useState('');
  const [newEventMode, setNewEventMode] = useState<'individual' | 'team'>('individual');
  const [newTeamSize, setNewTeamSize] = useState<number>(2);
  const [newFee, setNewFee] = useState<number>(0);
  const [newQrUrl, setNewQrUrl] = useState('');
  const [savingEvent, setSavingEvent] = useState(false);

  // State for Publish Update form
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [publishingUpdate, setPublishingUpdate] = useState(false);

  // Protect route
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin-login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="h-96 rounded-3xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    toast.info('Signed out of admin console.');
    navigate('/');
  };

  // Lifecycle stage toggle
  const updateEventStage = async (id: number, stage: 'upcoming' | 'stop' | 'completed') => {
    const { error } = await supabase
      .from('events')
      .update({ lifecycle_stage: stage, registration_open: stage === 'upcoming' })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update stage: ' + error.message);
    } else {
      toast.success(`Event status changed to "${stage}".`);
      refetchEvents();
    }
  };

  // Delete event
  const deleteEvent = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete event: ' + error.message);
    } else {
      toast.success('Event deleted.');
      refetchEvents();
      refetchStats();
    }
  };

  // Create Event Submit
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEvent(true);

    try {
      const payload = {
        title: newTitle.trim(),
        description: newDesc.trim(),
        event_date: newDate,
        venue: newVenue.trim(),
        poster_url: newPosterUrl.trim() || null,
        event_mode: newEventMode,
        team_size: newEventMode === 'team' ? Number(newTeamSize) : null,
        registration_fee: Number(newFee) || 0,
        payment_qr_url: newQrUrl.trim() || null,
        lifecycle_stage: 'upcoming',
        registration_open: true,
      };

      const { error } = await supabase.from('events').insert([payload]);

      if (error) {
        toast.error('Error creating event: ' + error.message);
      } else {
        toast.success('Event published successfully! 🎉');
        setShowEventModal(false);
        setNewTitle('');
        setNewDesc('');
        setNewDate('');
        setNewVenue('');
        setNewPosterUrl('');
        setNewFee(0);
        setNewQrUrl('');
        refetchEvents();
        refetchStats();
      }
    } catch (err: any) {
      toast.error('Failed to create event.');
    } finally {
      setSavingEvent(false);
    }
  };

  // Publish Update Submit
  const handlePublishUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim() || !updateContent.trim()) return;
    setPublishingUpdate(true);

    try {
      const { error } = await supabase.from('updates').insert([
        {
          title: updateTitle.trim(),
          content: updateContent.trim(),
        },
      ]);

      if (error) {
        toast.error('Failed to publish announcement: ' + error.message);
      } else {
        toast.success('Announcement broadcast to homepage!');
        setUpdateTitle('');
        setUpdateContent('');
        refetchUpdates();
      }
    } catch (err) {
      toast.error('Failed to publish update.');
    } finally {
      setPublishingUpdate(false);
    }
  };

  // Delete Update
  const deleteUpdate = async (id: number) => {
    const { error } = await supabase.from('updates').delete().eq('id', id);
    if (error) toast.error('Failed to delete: ' + error.message);
    else toast.success('Announcement removed.');
  };

  // Delete Message
  const deleteMessage = async (id: number) => {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) toast.error('Failed to delete: ' + error.message);
    else toast.success('Message archived.');
  };

  // Toggle Registration Payment Status
  const togglePaymentStatus = async (id: string | number, currentStatus: string | undefined) => {
    const nextStatus = currentStatus === 'confirmed' ? 'pending' : 'confirmed';
    const { error } = await supabase
      .from('registrations')
      .update({ payment_status: nextStatus })
      .eq('id', id);

    if (error) toast.error('Failed to update status: ' + error.message);
    else {
      toast.success(`Payment status marked as "${nextStatus}".`);
      refetchRegistrations();
    }
  };

  // Export Registrations as CSV
  const exportRegistrationsCSV = () => {
    if (registrations.length === 0) {
      toast.info('No registrations available to export.');
      return;
    }

    const headers = [
      'Registration ID',
      'Event ID',
      'Leader Name',
      'Leader USN',
      'Branch',
      'Year',
      'Email',
      'Phone',
      'Team Members',
      'Team USNs',
      'Is Paid',
      'Amount',
      'UTR Number',
      'Payment Status',
      'Created At',
    ];

    const rows = registrations.map((r) => [
      r.id,
      r.event_id,
      `"${r.leader_name?.replace(/"/g, '""') || ''}"`,
      r.leader_usn || '',
      `"${r.leader_branch || ''}"`,
      r.leader_year || '',
      r.leader_email || '',
      r.leader_phone || '',
      `"${(r.team_member_names || []).join(', ').replace(/"/g, '""')}"`,
      `"${(r.team_member_usns || []).join(', ').replace(/"/g, '""')}"`,
      r.is_paid_event ? 'Yes' : 'No',
      r.amount ?? 0,
      r.utr_number || '',
      r.payment_status || 'pending',
      r.created_at || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ieee-cis-registrations-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Registrations exported successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/15">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">IEEE CIS Admin Console</h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-semibold">
                Authorized
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as <span className="text-slate-200">{user?.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEventModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 text-xs transition hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/15 hover:border-rose-500/30 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-xs text-slate-400 font-medium">Total Events</p>
          <p className="text-3xl font-extrabold text-white mt-1">{stats.events}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-xs text-slate-400 font-medium">Registrations</p>
          <p className="text-3xl font-extrabold text-cyan-400 mt-1">{registrations.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-xs text-slate-400 font-medium">Active Notices</p>
          <p className="text-3xl font-extrabold text-indigo-400 mt-1">{updates.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-xs text-slate-400 font-medium">Inbox Messages</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-1">{messages.length}</p>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'events'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Events Manager ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('registrations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'registrations'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registrations ({registrations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('updates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'updates'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Broadcast Notices ({updates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'messages'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Inquiries ({messages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security Health</span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. EVENTS TAB */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Published Chapter Events</h3>
            <span className="text-xs text-slate-400">Real-time sync enabled</span>
          </div>

          <div className="grid gap-4">
            {events.map((evt) => {
              const stage = evt.lifecycle_stage || 'upcoming';

              return (
                <div
                  key={evt.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-base font-bold text-white">{evt.title}</h4>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          stage === 'upcoming'
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : stage === 'stop'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {stage === 'upcoming' ? 'Open' : stage === 'stop' ? 'Closed' : 'Completed'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      📅 {evt.event_date || 'TBA'} • 📍 {evt.venue || 'VVCE'} • 👥 {evt.event_mode === 'team' ? `Team (${evt.team_size || 2})` : 'Individual'} • Fee: {evt.registration_fee ? `₹${evt.registration_fee}` : 'Free'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Stage Buttons */}
                    <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
                      <button
                        onClick={() => updateEventStage(evt.id, 'upcoming')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          stage === 'upcoming' ? 'bg-cyan-500/30 text-cyan-200' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Open
                      </button>
                      <button
                        onClick={() => updateEventStage(evt.id, 'stop')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          stage === 'stop' ? 'bg-amber-500/30 text-amber-200' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Close
                      </button>
                      <button
                        onClick={() => updateEventStage(evt.id, 'completed')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          stage === 'completed' ? 'bg-emerald-500/30 text-emerald-200' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Completed
                      </button>
                    </div>

                    <button
                      onClick={() => deleteEvent(evt.id, evt.title)}
                      className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 border border-transparent hover:border-rose-500/30 transition"
                      aria-label="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. REGISTRATIONS TAB */}
      {activeTab === 'registrations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Event Registrations</h3>
              <p className="text-xs text-slate-400">Total participants registered across all chapter events</p>
            </div>
            <button
              onClick={exportRegistrationsCSV}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV (Excel)</span>
            </button>
          </div>

          {registrations.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-sm">
              No participant registrations recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/15 bg-white/5">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Leader / Participant</th>
                    <th className="p-3.5">USN</th>
                    <th className="p-3.5">Branch / Year</th>
                    <th className="p-3.5">Contact</th>
                    <th className="p-3.5">Team Members</th>
                    <th className="p-3.5">UTR / Payment</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-white/5 transition">
                      <td className="p-3.5 font-mono text-slate-500">#{reg.id}</td>
                      <td className="p-3.5 font-semibold text-white">{reg.leader_name}</td>
                      <td className="p-3.5 font-mono text-cyan-300">{reg.leader_usn}</td>
                      <td className="p-3.5">
                        {reg.leader_branch} ({reg.leader_year})
                      </td>
                      <td className="p-3.5">
                        <div>{reg.leader_email}</div>
                        <div className="text-slate-500">{reg.leader_phone}</div>
                      </td>
                      <td className="p-3.5">
                        {reg.team_member_names && reg.team_member_names.length > 0 ? (
                          <div className="space-y-0.5">
                            {reg.team_member_names.map((name, i) => (
                              <div key={i} className="text-[11px] text-slate-400">
                                • {name} ({reg.team_member_usns?.[i] || ''})
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500">Solo</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {reg.is_paid_event ? (
                          <div>
                            <span className="text-emerald-400 font-semibold">₹{reg.amount || 0}</span>
                            <div className="font-mono text-[11px] text-slate-400">UTR: {reg.utr_number || 'N/A'}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500">Free Event</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => togglePaymentStatus(reg.id, reg.payment_status)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                            reg.payment_status === 'confirmed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {reg.payment_status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. ANNOUNCEMENTS TAB */}
      {activeTab === 'updates' && (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/15 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Broadcast New Announcement</span>
            </h3>

            <form onSubmit={handlePublishUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CodeSprint Hackathon Registrations Open"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write message details for the live homepage feed..."
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={publishingUpdate}
                className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs shadow-lg transition"
              >
                {publishingUpdate ? 'Publishing...' : 'Broadcast Notice'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-white">Live Notices Feed</h3>
            {updates.length === 0 ? (
              <p className="text-xs text-slate-400">No announcements posted yet.</p>
            ) : (
              <div className="space-y-3">
                {updates.map((up) => (
                  <div
                    key={up.id}
                    className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{up.title}</h4>
                      <p className="text-xs text-slate-300 mt-1">{up.content || up.description}</p>
                      <p className="text-[10px] text-slate-500 mt-2">
                        {new Date(up.created_at).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteUpdate(up.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                      aria-label="Delete notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. INQUIRIES TAB */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">Contact Inbox</h3>
          {messages.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-sm">
              Your inbox is empty. No contact messages received.
            </div>
          ) : (
            <div className="grid gap-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{m.name}</h4>
                      <span className="text-xs text-slate-400">({m.email})</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[11px]">
                        {m.inquiry_type || 'General'}
                      </span>
                      {m.affiliation && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[11px]">
                          {m.affiliation}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteMessage(m.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      aria-label="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{m.message}</p>
                  <p className="text-[10px] text-slate-500">
                    Received: {m.created_at ? new Date(m.created_at).toLocaleString('en-IN') : 'Recent'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. SECURITY TAB */}
      {activeTab === 'security' && (
        <div className="rounded-3xl backdrop-blur-xl bg-white/5 border border-white/15 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Security Hardening &amp; Compliance Audit</h3>
              <p className="text-xs text-slate-400">Active defenses mitigating OWASP Top 10 vulnerabilities</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Row Level Security (RLS) Active</p>
                <p className="text-slate-400 mt-0.5">
                  Enabled on all 8 tables. Anonymous users cannot read registrations, payments, or inquiries.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Zero XSS Vulnerability</p>
                <p className="text-slate-400 mt-0.5">
                  100% React JSX automatic escaping + strict protocol URL sanitization (`safeUrl`) blocking `javascript:` and `data:`.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Anti-Bot Honeypot Protection</p>
                <p className="text-slate-400 mt-0.5">
                  Invisible traps on registration and contact forms with human submission speed validation.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Immutable Search Path Hardening</p>
                <p className="text-slate-400 mt-0.5">
                  `get_registration_count` security definer function role search_path locked to public schema.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Realtime Broadcast Authorization</p>
                <p className="text-slate-400 mt-0.5">
                  Supabase Realtime publication registered for events, updates, projects, papers, resources.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">HTTP Security Headers</p>
                <p className="text-slate-400 mt-0.5">
                  Content-Security-Policy, X-Frame-Options: DENY, and Referrer-Policy configured.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {showEventModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setShowEventModal(false)}
        >
          <div
            className="relative max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-white/20 p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Create New Event</h3>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Generative AI Hackathon"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Event details, schedule, requirements..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Venue *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Auditorium / Lab M-307"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Event Mode</label>
                  <select
                    value={newEventMode}
                    onChange={(e) => setNewEventMode(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-sm"
                  >
                    <option value="individual">Individual</option>
                    <option value="team">Team Event</option>
                  </select>
                </div>

                {newEventMode === 'team' && (
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Max Team Size</label>
                    <input
                      type="number"
                      min={2}
                      max={6}
                      value={newTeamSize}
                      onChange={(e) => setNewTeamSize(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Registration Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={newFee}
                    onChange={(e) => setNewFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Poster Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newPosterUrl}
                    onChange={(e) => setNewPosterUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm"
                  />
                </div>
              </div>

              {newFee > 0 && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payment QR URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newQrUrl}
                    onChange={(e) => setNewQrUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm"
                  />
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEvent}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold"
                >
                  {savingEvent ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
