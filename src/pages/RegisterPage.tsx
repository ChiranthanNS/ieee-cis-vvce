import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ShieldCheck, ArrowLeft, Users, CreditCard, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  validateEmail,
  validatePhone,
  validateUSN,
  validateName,
  validateUTR,
  isHumanSubmissionSpeed,
  checkClientRateLimit,
  safeUrl,
} from '../lib/security';
import { useToast } from '../context/ToastContext';
import { Honeypot } from '../components/Honeypot';
import { ImageModal } from '../components/ImageModal';
import type { EventItem } from '../types/database';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('event');
  const toast = useToast();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null);

  // Anti-bot form load timestamp
  const formLoadTimeRef = useRef<number>(Date.now());
  const [honeypotVal, setHoneypotVal] = useState('');

  // Form Fields
  const [leaderName, setLeaderName] = useState('');
  const [leaderUsn, setLeaderUsn] = useState('');
  const [leaderBranch, setLeaderBranch] = useState('Computer Science & Engg');
  const [leaderYear, setLeaderYear] = useState('3rd Year');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [utrNumber, setUtrNumber] = useState('');

  // Team Members (dynamic array)
  const [teamMembers, setTeamMembers] = useState<{ name: string; usn: string }[]>([]);

  useEffect(() => {
    formLoadTimeRef.current = Date.now();

    if (!eventId || !/^\d+$/.test(eventId)) {
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (!error && data) {
        const evt = data as EventItem;
        setEvent(evt);

        // Prepopulate team members if team mode
        if (evt.event_mode === 'team') {
          const count = Math.max(1, (evt.team_size || 2) - 1);
          setTeamMembers(Array.from({ length: count }, () => ({ name: '', usn: '' })));
        }
      }
      setLoading(false);
    };

    fetchEvent();
  }, [eventId]);

  const handleMemberChange = (idx: number, field: 'name' | 'usn', val: string) => {
    setTeamMembers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Honeypot check (Silent bot trap)
    if (honeypotVal.trim() !== '') {
      toast.success('Registration submitted successfully! 🎉');
      setSubmitted(true);
      return;
    }

    // 2. Submission speed check (Human validation)
    if (!isHumanSubmissionSpeed(formLoadTimeRef.current, 1200)) {
      toast.error('Suspicious submission detected. Please take a moment to review your details.');
      return;
    }

    // 3. Client rate limit check
    if (!checkClientRateLimit('event_registration', 4, 60000)) {
      toast.error('Too many requests. Please wait a minute before submitting again.');
      return;
    }

    // 4. Strict Field Validation
    if (!validateName(leaderName)) {
      toast.error('Please enter a valid full name (2–100 characters).');
      return;
    }

    if (!validateUSN(leaderUsn)) {
      toast.error('Please enter a valid University Seat Number (USN).');
      return;
    }

    if (!validateEmail(leaderEmail)) {
      toast.error('Please provide a valid email address for communications.');
      return;
    }

    if (!validatePhone(leaderPhone)) {
      toast.error('Please enter a valid phone number (7–15 digits).');
      return;
    }

    const isPaid = !!(event?.registration_fee && event.registration_fee > 0);
    if (isPaid && !validateUTR(utrNumber)) {
      toast.error('Please enter a valid Transaction / UTR reference number.');
      return;
    }

    // Validate Team Members if applicable
    if (event?.event_mode === 'team') {
      for (let i = 0; i < teamMembers.length; i++) {
        const m = teamMembers[i];
        if (!validateName(m.name)) {
          toast.error(`Please enter a valid name for Team Member ${i + 2}.`);
          return;
        }
        if (!validateUSN(m.usn)) {
          toast.error(`Please enter a valid USN for Team Member ${i + 2}.`);
          return;
        }
      }
    }

    if (!event) {
      toast.error('Invalid event specified.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        event_id: event.id,
        leader_name: leaderName.trim(),
        leader_usn: leaderUsn.trim().toUpperCase(),
        leader_branch: leaderBranch,
        leader_year: leaderYear,
        leader_email: leaderEmail.trim().toLowerCase(),
        leader_phone: leaderPhone.trim(),
        team_member_names: teamMembers.map((m) => m.name.trim()),
        team_member_usns: teamMembers.map((m) => m.usn.trim().toUpperCase()),
        is_paid_event: isPaid,
        amount: event.registration_fee || null,
        utr_number: isPaid ? utrNumber.trim() : null,
        payment_status: isPaid ? 'pending' : 'confirmed',
      };

      const { error } = await supabase.from('registrations').insert([payload]);

      if (error) {
        if (error.code === '23505') {
          toast.error('You or this USN is already registered for this event.');
        } else {
          toast.error('Registration failed: ' + (error.message || 'Please verify your details.'));
        }
      } else {
        toast.success('Registration successful! Check your email for confirmation.');
        setSubmitted(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="h-96 rounded-3xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Event Not Found</h2>
        <p className="text-slate-400 text-sm">
          Please select an active event from the events catalog to register.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-sm font-semibold hover:bg-cyan-500/30 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Events</span>
        </Link>
      </div>
    );
  }

  if (event.lifecycle_stage === 'stop' || event.lifecycle_stage === 'completed') {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center space-y-4">
        <div className="p-8 rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/15 shadow-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Registration Closed</h2>
          <p className="text-slate-300 text-sm">
            Registrations for <span className="text-cyan-300 font-semibold">{event.title}</span> are currently closed.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-sm font-semibold hover:bg-cyan-500/30 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore Other Events</span>
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20">
        <div className="rounded-3xl backdrop-blur-2xl bg-white/5 border border-emerald-500/30 p-10 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Registration Confirmed!</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Thank you, <span className="text-white font-semibold">{leaderName}</span>! You have been successfully registered for{' '}
            <span className="text-cyan-300 font-semibold">{event.title}</span>.
          </p>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
            A confirmation receipt will be emailed to <span className="text-slate-200">{leaderEmail}</span>. Keep your registration ID for check-in on event day.
          </div>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              to="/events"
              className="px-6 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-sm transition"
            >
              Browse More Events
            </Link>
            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = !!(event.registration_fee && event.registration_fee > 0);
  const paymentQr = safeUrl(event.payment_qr_url);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to={`/events/${event.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Event Details</span>
        </Link>
      </div>

      {/* Main Registration Box */}
      <div className="rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/15 p-8 sm:p-10 shadow-2xl space-y-8">
        <div className="border-b border-white/10 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Event Registration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Register for {event.title}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Mode: {event.event_mode === 'team' ? `Team (${event.team_size || 2} Members)` : 'Individual'} • Fee: {isPaid ? `₹${event.registration_fee}` : 'Free'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invisible Honeypot anti-bot field */}
          <Honeypot value={honeypotVal} onChange={setHoneypotVal} />

          {/* Leader Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{event.event_mode === 'team' ? 'Team Leader Details' : 'Participant Details'}</span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  USN / Roll Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4VV21CS001"
                  value={leaderUsn}
                  onChange={(e) => setLeaderUsn(e.target.value)}
                  maxLength={30}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition uppercase"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Department / Branch</label>
                <select
                  value={leaderBranch}
                  onChange={(e) => setLeaderBranch(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 transition"
                >
                  <option value="Computer Science & Engg">Computer Science &amp; Engg</option>
                  <option value="Information Science & Engg">Information Science &amp; Engg</option>
                  <option value="Artificial Intelligence & ML">Artificial Intelligence &amp; ML</option>
                  <option value="Electronics & Communication">Electronics &amp; Communication</option>
                  <option value="Electrical & Electronics">Electrical &amp; Electronics</option>
                  <option value="Mechanical Engg">Mechanical Engg</option>
                  <option value="Civil Engg">Civil Engg</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Year of Study</label>
                <select
                  value={leaderYear}
                  onChange={(e) => setLeaderYear(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 transition"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate / Faculty">Postgraduate / Faculty</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@vvce.ac.in"
                  value={leaderEmail}
                  onChange={(e) => setLeaderEmail(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Phone Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={leaderPhone}
                  onChange={(e) => setLeaderPhone(e.target.value)}
                  maxLength={18}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>
          </div>

          {/* Team Members Section */}
          {event.event_mode === 'team' && teamMembers.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Team Members ({teamMembers.length} additional)</span>
              </h3>

              {teamMembers.map((member, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <p className="text-xs font-semibold text-slate-300">Team Member {idx + 2}</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder={`Member ${idx + 2} Full Name`}
                      value={member.name}
                      onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                      maxLength={100}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition"
                    />
                    <input
                      type="text"
                      required
                      placeholder={`Member ${idx + 2} USN`}
                      value={member.usn}
                      onChange={(e) => handleMemberChange(idx, 'usn', e.target.value)}
                      maxLength={30}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition uppercase"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Payment Section (if paid) */}
          {isPaid && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Payment Verification (₹{event.registration_fee})</span>
              </h3>

              {paymentQr !== '#' && (
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
                  <p className="text-xs text-slate-300">Scan QR Code via Google Pay / PhonePe / Paytm / UPI</p>
                  <img
                    src={paymentQr}
                    alt="Payment QR"
                    className="w-48 h-48 mx-auto rounded-xl shadow-lg border border-white/20 cursor-zoom-in hover:scale-105 transition"
                    onClick={() => setModalImg(paymentQr)}
                  />
                  <p className="text-[11px] text-slate-500">Click to zoom QR</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  UTR / Transaction ID / UPI Ref <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter 12-digit UPI reference or bank transaction ID"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  maxLength={50}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>
          )}

          {/* Security Banner */}
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Submissions are encrypted and protected by Supabase Row-Level Security.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-sm"
          >
            {submitting ? 'Submitting Registration...' : 'Complete Registration →'}
          </button>
        </form>
      </div>

      <ImageModal src={modalImg} onClose={() => setModalImg(null)} />
    </div>
  );
};
