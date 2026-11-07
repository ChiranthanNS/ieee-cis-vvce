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
  Code2,
  BookOpen,
  Library,
  UserCheck,
  ExternalLink,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/hooks';
import { useToast } from '../components/Toast';
import { useRealtimeCollection } from '../lib/hooks';
import { useRealtimeStats } from '../lib/hooks';
import { safeUrl } from '../lib/security';
import type {
  EventItem,
  UpdateItem,
  RegistrationItem,
  ContactMessageItem,
  ProjectItem,
  PaperItem,
  ResourceItem,
  CommitteeMember,
} from '../lib/types';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, loading: authLoading, isAuthenticated, signOut } = useAuth();
  const { stats, refetch: refetchStats } = useRealtimeStats();

  const [activeTab, setActiveTab] = useState<
    'events' | 'registrations' | 'updates' | 'projects' | 'papers' | 'resources' | 'committee' | 'messages' | 'security'
  >('events');

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

  const { data: projects, refetch: refetchProjects } = useRealtimeCollection<ProjectItem>({
    table: 'projects',
    orderColumn: 'created_at',
    ascending: false,
  });

  const { data: papers, refetch: refetchPapers } = useRealtimeCollection<PaperItem>({
    table: 'papers',
    orderColumn: 'created_at',
    ascending: false,
  });

  const { data: resources, refetch: refetchResources } = useRealtimeCollection<ResourceItem>({
    table: 'resources',
    orderColumn: 'created_at',
    ascending: false,
  });

  const { data: committee, refetch: refetchCommittee } = useRealtimeCollection<CommitteeMember>({
    table: 'committee',
    orderColumn: 'display_order',
    ascending: true,
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

  // State for Add Project form
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projGithub, setProjGithub] = useState('');
  const [projDemo, setProjDemo] = useState('');
  const [savingProj, setSavingProj] = useState(false);

  // State for Add Paper form
  const [paperTitle, setPaperTitle] = useState('');
  const [paperAuthor, setPaperAuthor] = useState('');
  const [paperSummary, setPaperSummary] = useState('');
  const [paperLink, setPaperLink] = useState('');
  const [savingPaper, setSavingPaper] = useState(false);

  // State for Add Resource form
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState('Roadmap');
  const [resDesc, setResDesc] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [savingRes, setSavingRes] = useState(false);

  // State for Add Committee Member form
  const [memName, setMemName] = useState('');
  const [memRole, setMemRole] = useState('');
  const [memBio, setMemBio] = useState('');
  const [memImage, setMemImage] = useState('');
  const [memLinkedin, setMemLinkedin] = useState('');
  const [memOrder, setMemOrder] = useState<number>(1);
  const [savingMem, setSavingMem] = useState(false);

  // Filter for registrations
  const [regSearch, setRegSearch] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');

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

  // ==========================================
  // EVENT ACTIONS
  // ==========================================
  const updateEventStage = async (id: number, stage: 'upcoming' | 'stop' | 'completed') => {
    const { error } = await supabase
      .from('events')
      .update({ lifecycle_stage: stage, registration_open: stage === 'upcoming' })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update stage: ' + error.message);
    } else {
      toast.success(`Event status changed to "${stage.toUpperCase()}"`);
      refetchEvents();
    }
  };

  const deleteEvent = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete event "${title}"? This cannot be undone.`)) {
      return;
    }
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete event: ' + error.message);
    } else {
      toast.success(`Event "${title}" deleted.`);
      refetchEvents();
      refetchStats();
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate || !newVenue.trim()) {
      toast.error('Please fill in title, date, and venue.');
      return;
    }

    setSavingEvent(true);
    try {
      const payload = {
        title: newTitle.trim(),
        description: newDesc.trim(),
        event_date: newDate,
        venue: newVenue.trim(),
        lifecycle_stage: 'upcoming',
        registration_open: true,
        poster_url: newPosterUrl.trim() || null,
        event_mode: newEventMode,
        team_size: newEventMode === 'team' ? newTeamSize : 1,
        registration_fee: Number(newFee) || 0,
        payment_qr_url: newQrUrl.trim() || null,
      };

      const { error } = await supabase.from('events').insert([payload]);
      if (error) throw error;

      toast.success('Event published successfully!');
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
    } catch (err: any) {
      toast.error('Failed to create event: ' + err.message);
    } finally {
      setSavingEvent(false);
    }
  };

  // ==========================================
  // REGISTRATION ACTIONS
  // ==========================================
  const togglePaymentStatus = async (id: string | number, currentStatus: string | undefined) => {
    const nextStatus = currentStatus === 'confirmed' ? 'pending' : 'confirmed';
    const { error } = await supabase
      .from('registrations')
      .update({ payment_status: nextStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update payment status: ' + error.message);
    } else {
      toast.success(`Payment status updated to ${nextStatus}.`);
      refetchRegistrations();
    }
  };

  const deleteRegistration = async (id: string | number, name: string) => {
    if (!window.confirm(`Delete registration for "${name}"?`)) return;
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete registration: ' + error.message);
    } else {
      toast.success('Registration removed.');
      refetchRegistrations();
      refetchStats();
    }
  };

  const exportRegistrationsCSV = () => {
    if (!registrations || registrations.length === 0) {
      toast.error('No registrations available to export.');
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
      'Team Member Names',
      'Team Member USNs',
      'Is Paid',
      'Amount',
      'UTR Number',
      'Payment Status',
      'Registered At',
    ];

    const rows = registrations.map((r) => [
      `"${r.id}"`,
      r.event_id,
      `"${(r.leader_name || '').replace(/"/g, '""')}"`,
      `"${r.leader_usn || ''}"`,
      `"${r.leader_branch || ''}"`,
      `"${r.leader_year || ''}"`,
      `"${r.leader_email || ''}"`,
      `"${r.leader_phone || ''}"`,
      `"${(r.team_member_names || []).join(', ')}"`,
      `"${(r.team_member_usns || []).join(', ')}"`,
      r.is_paid_event ? 'YES' : 'NO',
      r.amount || 0,
      `"${r.utr_number || ''}"`,
      `"${r.payment_status || 'pending'}"`,
      `"${r.created_at || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IEEE_CIS_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported registrations to CSV!');
  };

  // ==========================================
  // UPDATES / ANNOUNCEMENTS ACTIONS
  // ==========================================
  const handlePublishUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim()) {
      toast.error('Please enter announcement title.');
      return;
    }

    setPublishingUpdate(true);
    try {
      const { error } = await supabase.from('updates').insert([
        {
          title: updateTitle.trim(),
          description: updateContent.trim() || null,
          content: updateContent.trim() || null,
        },
      ]);
      if (error) throw error;

      toast.success('Announcement broadcasted to homepage!');
      setUpdateTitle('');
      setUpdateContent('');
      refetchUpdates();
    } catch (err: any) {
      toast.error('Failed to post announcement: ' + err.message);
    } finally {
      setPublishingUpdate(false);
    }
  };

  const deleteUpdate = async (id: number) => {
    if (!window.confirm('Delete this announcement?')) return;
    const { error } = await supabase.from('updates').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete announcement: ' + error.message);
    } else {
      toast.success('Announcement deleted.');
      refetchUpdates();
    }
  };

  // ==========================================
  // PROJECTS ACTIONS
  // ==========================================
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projDesc.trim()) {
      toast.error('Please enter project title and description.');
      return;
    }
    setSavingProj(true);
    try {
      const { error } = await supabase.from('projects').insert([
        {
          title: projTitle.trim(),
          description: projDesc.trim(),
          github_url: projGithub.trim() || null,
          demo_url: projDemo.trim() || null,
        },
      ]);
      if (error) throw error;
      toast.success('Project added to showcase!');
      setProjTitle('');
      setProjDesc('');
      setProjGithub('');
      setProjDemo('');
      refetchProjects();
      refetchStats();
    } catch (err: any) {
      toast.error('Failed to add project: ' + err.message);
    } finally {
      setSavingProj(false);
    }
  };

  const deleteProject = async (id: number, title: string) => {
    if (!window.confirm(`Delete project "${title}"?`)) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete project: ' + error.message);
    } else {
      toast.success(`Project "${title}" deleted.`);
      refetchProjects();
      refetchStats();
    }
  };

  // ==========================================
  // RESEARCH PAPERS ACTIONS
  // ==========================================
  const handleCreatePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperTitle.trim() || !paperSummary.trim()) {
      toast.error('Please enter publication title and summary.');
      return;
    }
    setSavingPaper(true);
    try {
      const { error } = await supabase.from('papers').insert([
        {
          title: paperTitle.trim(),
          author: paperAuthor.trim() || 'IEEE CIS Student Member',
          summary: paperSummary.trim(),
          link: paperLink.trim() || null,
        },
      ]);
      if (error) throw error;
      toast.success('Research paper added!');
      setPaperTitle('');
      setPaperAuthor('');
      setPaperSummary('');
      setPaperLink('');
      refetchPapers();
    } catch (err: any) {
      toast.error('Failed to add paper: ' + err.message);
    } finally {
      setSavingPaper(false);
    }
  };

  const deletePaper = async (title: string) => {
    if (!window.confirm(`Delete publication "${title}"?`)) return;
    const { error } = await supabase.from('papers').delete().eq('title', title);
    if (error) {
      toast.error('Failed to delete paper: ' + error.message);
    } else {
      toast.success(`Publication "${title}" deleted.`);
      refetchPapers();
    }
  };

  // ==========================================
  // RESOURCES ACTIONS
  // ==========================================
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) {
      toast.error('Please enter resource title.');
      return;
    }
    setSavingRes(true);
    try {
      const { error } = await supabase.from('resources').insert([
        {
          title: resTitle.trim(),
          type: resType,
          description: resDesc.trim() || null,
          url: resUrl.trim() || null,
        },
      ]);
      if (error) throw error;
      toast.success('Resource added!');
      setResTitle('');
      setResDesc('');
      setResUrl('');
      refetchResources();
      refetchStats();
    } catch (err: any) {
      toast.error('Failed to add resource: ' + err.message);
    } finally {
      setSavingRes(false);
    }
  };

  const deleteResource = async (id: number, title: string) => {
    if (!window.confirm(`Delete resource "${title}"?`)) return;
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete resource: ' + error.message);
    } else {
      toast.success(`Resource "${title}" deleted.`);
      refetchResources();
      refetchStats();
    }
  };

  // ==========================================
  // COMMITTEE ACTIONS
  // ==========================================
  const handleCreateCommitteeMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memName.trim() || !memRole.trim()) {
      toast.error('Please enter member name and role.');
      return;
    }
    setSavingMem(true);
    try {
      const { error } = await supabase.from('committee').insert([
        {
          name: memName.trim(),
          role: memRole.trim(),
          bio: memBio.trim() || null,
          image_url: memImage.trim() || null,
          linkedin: memLinkedin.trim() || null,
          display_order: Number(memOrder) || 1,
        },
      ]);
      if (error) throw error;
      toast.success('Committee member added!');
      setMemName('');
      setMemRole('');
      setMemBio('');
      setMemImage('');
      setMemLinkedin('');
      setMemOrder(1);
      refetchCommittee();
    } catch (err: any) {
      toast.error('Failed to add member: ' + err.message);
    } finally {
      setSavingMem(false);
    }
  };

  const deleteCommitteeMember = async (id: number, name: string) => {
    if (!window.confirm(`Delete committee profile for "${name}"?`)) return;
    const { error } = await supabase.from('committee').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete member: ' + error.message);
    } else {
      toast.success(`Profile for "${name}" deleted.`);
      refetchCommittee();
    }
  };

  // ==========================================
  // MESSAGES ACTIONS
  // ==========================================
  const deleteMessage = async (id: number) => {
    if (!window.confirm('Delete this contact message?')) return;
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete message: ' + error.message);
    } else {
      toast.success('Message deleted.');
      refetchMessages();
    }
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter((r) => {
    if (selectedEventId !== 'all' && String(r.event_id) !== selectedEventId) {
      return false;
    }
    if (!regSearch.trim()) return true;
    const q = regSearch.toLowerCase();
    return (
      (r.leader_name && r.leader_name.toLowerCase().includes(q)) ||
      (r.leader_usn && r.leader_usn.toLowerCase().includes(q)) ||
      (r.leader_email && r.leader_email.toLowerCase().includes(q)) ||
      (r.utr_number && r.utr_number.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/15 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Executive Control Center</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                FULL ACCESS ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Logged in as <span className="text-cyan-300 font-semibold">{user?.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEventModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Total Events</span>
          <p className="text-2xl font-black text-white">{events.length}</p>
        </div>
        <div className="p-4 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Registrations</span>
          <p className="text-2xl font-black text-cyan-400">{registrations.length}</p>
        </div>
        <div className="p-4 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Projects &amp; Papers</span>
          <p className="text-2xl font-black text-indigo-400">{projects.length + papers.length}</p>
        </div>
        <div className="p-4 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Committee Members</span>
          <p className="text-2xl font-black text-emerald-400">{committee.length}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 overflow-x-auto">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'events'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Events ({events.length})</span>
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
          <span>Announcements ({updates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'projects'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('papers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'papers'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Research ({papers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'resources'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Library className="w-4 h-4" />
          <span>Resources ({resources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('committee')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'committee'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Committee ({committee.length})</span>
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
          <span>Security Audit</span>
        </button>
      </div>

      {/* ===================================================== */}
      {/* 1. EVENTS TAB                                         */}
      {/* ===================================================== */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Chapter Events &amp; Workshops</h3>
            <button
              onClick={() => setShowEventModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Event</span>
            </button>
          </div>

          <div className="grid gap-4">
            {events.map((evt) => {
              const stage = evt.lifecycle_stage || 'upcoming';

              return (
                <div
                  key={evt.id}
                  className="p-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base">{evt.title}</h4>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          stage === 'upcoming'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : stage === 'stop'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                        }`}
                      >
                        {stage === 'stop' ? 'Closed' : stage}
                      </span>
                      {evt.registration_fee && evt.registration_fee > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-semibold border border-cyan-500/20">
                          ₹{evt.registration_fee}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-semibold border border-emerald-500/20">
                          Free
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Date: <span className="text-slate-300">{evt.event_date}</span> | Venue:{' '}
                      <span className="text-slate-300">{evt.venue}</span> | Mode:{' '}
                      <span className="text-slate-300 capitalize">{evt.event_mode}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400 mr-1">Stage:</span>
                    <button
                      onClick={() => updateEventStage(evt.id, 'upcoming')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        stage === 'upcoming'
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => updateEventStage(evt.id, 'stop')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        stage === 'stop'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Close
                    </button>
                    <button
                      onClick={() => updateEventStage(evt.id, 'completed')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        stage === 'completed'
                          ? 'bg-slate-600 text-white font-bold'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Done
                    </button>
                    <button
                      onClick={() => deleteEvent(evt.id, evt.title)}
                      className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition ml-2"
                      title="Delete event"
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

      {/* ===================================================== */}
      {/* 2. REGISTRATIONS TAB                                  */}
      {/* ===================================================== */}
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
              <span>Export CSV</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, USN, email, UTR..."
                value={regSearch}
                onChange={(e) => setRegSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Events ({registrations.length})</option>
              {events.map((e) => (
                <option key={e.id} value={String(e.id)}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/10 text-white uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">USN</th>
                  <th className="p-3">Branch &amp; Year</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Team Members</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No registrations found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-white/5 transition">
                      <td className="p-3 font-semibold text-white">{reg.leader_name}</td>
                      <td className="p-3 font-mono text-cyan-300">{reg.leader_usn}</td>
                      <td className="p-3">
                        {reg.leader_branch} ({reg.leader_year})
                      </td>
                      <td className="p-3 space-y-0.5">
                        <div className="text-slate-300">{reg.leader_email}</div>
                        <div className="text-[11px] text-slate-400">{reg.leader_phone}</div>
                      </td>
                      <td className="p-3">
                        {reg.team_member_names && reg.team_member_names.length > 0 ? (
                          <div className="space-y-0.5">
                            {reg.team_member_names.map((name, i) => (
                              <div key={i} className="text-[11px] text-slate-300">
                                {name} ({reg.team_member_usns?.[i] || ''})
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500">Solo</span>
                        )}
                      </td>
                      <td className="p-3">
                        {reg.is_paid_event ? (
                          <div className="space-y-1">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                reg.payment_status === 'confirmed'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {reg.payment_status || 'pending'} (₹{reg.amount})
                            </span>
                            {reg.utr_number && (
                              <div className="font-mono text-[10px] text-slate-400">
                                UTR: {reg.utr_number}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-emerald-400 font-semibold">Free</span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {reg.is_paid_event && (
                          <button
                            onClick={() => togglePaymentStatus(reg.id, reg.payment_status)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                              reg.payment_status === 'confirmed'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {reg.payment_status === 'confirmed' ? 'Verified' : 'Verify'}
                          </button>
                        )}
                        <button
                          onClick={() => deleteRegistration(reg.id, reg.leader_name)}
                          className="p-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 transition"
                          title="Delete registration"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* 3. ANNOUNCEMENTS TAB                                  */}
      {/* ===================================================== */}
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
                  placeholder="e.g. AI Hackathon Phase 1 Results Announced!"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Content / Description</label>
                <textarea
                  rows={4}
                  placeholder="Details of the announcement..."
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={publishingUpdate}
                className="w-full py-2.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs shadow-lg shadow-cyan-500/25 transition disabled:opacity-50"
              >
                {publishingUpdate ? 'Publishing...' : 'Broadcast to Homepage'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-white">Active Announcements ({updates.length})</h3>
            <div className="grid gap-3">
              {updates.map((up) => (
                <div
                  key={up.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold text-white text-sm">{up.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{up.description || up.content}</p>
                    <span className="text-[10px] text-slate-500">
                      {new Date(up.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteUpdate(up.id)}
                    className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition shrink-0"
                    title="Delete update"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* 4. PROJECTS TAB                                       */}
      {/* ===================================================== */}
      {activeTab === 'projects' && (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/15 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Add Student AI/ML Project</span>
            </h3>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. Autonomous Drone Navigation"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={4}
                  placeholder="Summary of tech stack, neural network models used, problem solved..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">GitHub Repository Link</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={projGithub}
                  onChange={(e) => setProjGithub(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Live Demo / Paper URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={projDemo}
                  onChange={(e) => setProjDemo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={savingProj}
                className="w-full py-2.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs shadow-lg shadow-cyan-500/25 transition disabled:opacity-50"
              >
                {savingProj ? 'Saving Project...' : 'Add Project to Showcase'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-white">Showcased Projects ({projects.length})</h3>
            <div className="grid gap-3">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold text-white text-sm">{p.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{p.description}</p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-cyan-300">
                      {p.github_url && (
                        <a href={safeUrl(p.github_url)} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          GitHub ↗
                        </a>
                      )}
                      {p.demo_url && (
                        <a href={safeUrl(p.demo_url)} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Live Demo ↗
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteProject(p.id, p.title)}
                    className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition shrink-0"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* 5. RESEARCH PAPERS TAB                                */}
      {/* ===================================================== */}
      {activeTab === 'papers' && (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/15 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Add Research Publication</span>
            </h3>

            <form onSubmit={handleCreatePaper} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Paper Title</label>
                <input
                  type="text"
                  placeholder="e.g. Deep Reinforcement Learning for Grid Optimization"
                  value={paperTitle}
                  onChange={(e) => setPaperTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Author(s)</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma, Dr. Ramesh (VVCE)"
                  value={paperAuthor}
                  onChange={(e) => setPaperAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Summary / Abstract</label>
                <textarea
                  rows={4}
                  placeholder="Key methodologies, benchmarks, and research conclusions..."
                  value={paperSummary}
                  onChange={(e) => setPaperSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Publication Link (DOI / IEEE Xplore)</label>
                <input
                  type="url"
                  placeholder="https://ieeexplore.ieee.org/..."
                  value={paperLink}
                  onChange={(e) => setPaperLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={savingPaper}
                className="w-full py-2.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs shadow-lg shadow-cyan-500/25 transition disabled:opacity-50"
              >
                {savingPaper ? 'Adding Publication...' : 'Publish Paper'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-white">Research Papers ({papers.length})</h3>
            <div className="grid gap-3">
              {papers.map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold text-white text-sm">{p.title}</h4>
                    <span className="text-[11px] text-cyan-300 font-medium">By {p.author}</span>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{p.summary}</p>
                    {p.link && (
                      <a
                        href={safeUrl(p.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline pt-1"
                      >
                        <span>View Publication</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => deletePaper(p.title)}
                    className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition shrink-0"
                    title="Delete paper"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* 6. RESOURCES TAB                                      */}
      {/* ===================================================== */}
      {activeTab === 'resources' && (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/15 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Library className="w-4 h-4 text-cyan-400" />
              <span>Add Learning Resource</span>
            </h3>

            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Resource Title</label>
                <input
                  type="text"
                  placeholder="e.g. PyTorch Deep Learning Cheat Sheet"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category / Type</label>
                <select
                  value={resType}
                  onChange={(e) => setResType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="Roadmap">Roadmap</option>
                  <option value="Cheat Sheet">Cheat Sheet</option>
                  <option value="Course">Video Course</option>
                  <option value="Documentation">Documentation / Tool</option>
                  <option value="Dataset">Dataset / Model Weights</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Short description of what students will learn..."
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Resource URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={savingRes}
                className="w-full py-2.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs shadow-lg shadow-cyan-500/25 transition disabled:opacity-50"
              >
                {savingRes ? 'Saving Resource...' : 'Add Resource'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-white">Learning Resources ({resources.length})</h3>
            <div className="grid gap-3">
              {resources.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-sm">{r.title}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-500/30">
                        {r.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{r.description}</p>
                    {r.url && (
                      <a
                        href={safeUrl(r.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline pt-1"
                      >
                        <span>Access Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => deleteResource(r.id, r.title)}
                    className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition shrink-0"
                    title="Delete resource"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* 7. COMMITTEE TEAM TAB                                 */}
      {/* ===================================================== */}
      {activeTab === 'committee' && (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/15 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Add Committee Member</span>
            </h3>

            <form onSubmit={handleCreateCommitteeMember} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. H. S. Arvind"
                  value={memName}
                  onChange={(e) => setMemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter Advisor / Chair / Tech Lead"
                  value={memRole}
                  onChange={(e) => setMemRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Bio / Responsibilities</label>
                <textarea
                  rows={3}
                  placeholder="Short bio, department, and chapter responsibilities..."
                  value={memBio}
                  onChange={(e) => setMemBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={memImage}
                    onChange={(e) => setMemImage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Display Order (1-10)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={memOrder}
                    onChange={(e) => setMemOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">LinkedIn Profile Link</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={memLinkedin}
                  onChange={(e) => setMemLinkedin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={savingMem}
                className="w-full py-2.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs shadow-lg shadow-cyan-500/25 transition disabled:opacity-50"
              >
                {savingMem ? 'Adding Member...' : 'Add to Committee'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-white">Executive Committee Members ({committee.length})</h3>
            <div className="grid gap-3">
              {committee.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {m.image_url ? (
                      <img
                        src={safeUrl(m.image_url)}
                        alt={m.name}
                        className="w-12 h-12 rounded-xl object-cover border border-cyan-500/30"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                        {m.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-white text-sm">{m.name}</h4>
                      <p className="text-xs text-cyan-300">{m.role}</p>
                      {m.linkedin && (
                        <a
                          href={safeUrl(m.linkedin)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-slate-400 hover:text-white transition"
                        >
                          LinkedIn Profile ↗
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCommitteeMember(m.id, m.name)}
                    className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition shrink-0"
                    title="Delete member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* 8. CONTACT INBOX TAB                                  */}
      {/* ===================================================== */}
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
                  className="p-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{m.name}</h4>
                      <span className="text-xs text-cyan-400 font-mono">&lt;{m.email}&gt;</span>
                      {m.inquiry_type && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-semibold">
                          {m.inquiry_type}
                        </span>
                      )}
                    </div>
                    {m.affiliation && (
                      <p className="text-[11px] text-slate-400">Affiliation: {m.affiliation}</p>
                    )}
                    <p className="text-xs text-slate-200 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                      {m.message}
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      Received:{' '}
                      {m.created_at ? new Date(m.created_at).toLocaleString() : 'Recently'}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteMessage(m.id)}
                    className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition shrink-0"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================== */}
      {/* 9. SECURITY AUDIT TAB                                 */}
      {/* ===================================================== */}
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

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Row-Level Security (RLS) Active</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                All 8 PostgreSQL tables have strict RLS policies. Anonymous users cannot read participant records, USNs,
                emails, phone numbers, or payment UTR codes.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Anti-Bot Honeypot Protection</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Registration and contact forms include invisible honeypot trap inputs and a 1.2-second human timing
                threshold to block automated scraper bots.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>XSS &amp; URL Sanitization</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                React JSX escapes dynamic data by default. Strict safeUrl protocol validation blocks javascript: and
                data: URI exploit injections.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Rate Limiting &amp; Anti-Clickjacking</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Client rate limits throttle spam floods. X-Frame-Options: DENY and strict CSP prevent framing or iframe
                clickjacking attacks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl backdrop-blur-2xl bg-slate-900/95 border border-white/20 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xl font-bold text-white">Create New Event</h3>
              </div>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-slate-400 hover:text-white transition text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Event Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Algorithmic Trading with Reinforcement Learning"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Details about speaker, prerequisites, curriculum..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Venue *</label>
                  <input
                    type="text"
                    placeholder="e.g. CSE Seminar Hall 3, VVCE"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Event Mode</label>
                  <select
                    value={newEventMode}
                    onChange={(e) => setNewEventMode(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="individual">Individual</option>
                    <option value="team">Team Event</option>
                  </select>
                </div>

                {newEventMode === 'team' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Team Size (Max)</label>
                    <input
                      type="number"
                      min={2}
                      max={6}
                      value={newTeamSize}
                      onChange={(e) => setNewTeamSize(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Registration Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={newFee}
                    onChange={(e) => setNewFee(Number(e.target.value))}
                    placeholder="0 for free"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Poster Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newPosterUrl}
                  onChange={(e) => setNewPosterUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              {Number(newFee) > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment UPI QR Code Image URL</label>
                  <input
                    type="url"
                    placeholder="https://.../upi-qr.png"
                    value={newQrUrl}
                    onChange={(e) => setNewQrUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEvent}
                  className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs shadow-lg shadow-cyan-500/30 transition disabled:opacity-50"
                >
                  {savingEvent ? 'Publishing Event...' : 'Publish Event Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
