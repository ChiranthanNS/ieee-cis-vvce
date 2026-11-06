import React, { useState, useRef } from 'react';
import { Mail, MapPin, Send, MessageSquare, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  validateEmail,
  validateName,
  isHumanSubmissionSpeed,
  checkClientRateLimit,
} from '../lib/security';
import { useToast } from '../context/ToastContext';
import { Honeypot } from '../components/Honeypot';

export const ContactPage: React.FC = () => {
  const toast = useToast();
  const formLoadTimeRef = useRef<number>(Date.now());

  const [honeypotVal, setHoneypotVal] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [affiliation, setAffiliation] = useState('VVCE Student');
  const [inquiryType, setInquiryType] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Honeypot check (Bot trap)
    if (honeypotVal.trim() !== '') {
      toast.success('Your message has been received! We will get back to you shortly.');
      setSent(true);
      return;
    }

    // 2. Anti-bot speed check
    if (!isHumanSubmissionSpeed(formLoadTimeRef.current, 1200)) {
      toast.error('Suspicious submission detected. Please take a moment to review your message.');
      return;
    }

    // 3. Client rate limit
    if (!checkClientRateLimit('contact_form', 3, 60000)) {
      toast.error('You have sent several messages. Please wait a minute before submitting again.');
      return;
    }

    // 4. Field validation
    if (!validateName(name)) {
      toast.error('Please enter a valid full name (2–100 characters).');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    const trimmedMsg = message.trim();
    if (trimmedMsg.length < 10 || trimmedMsg.length > 2000) {
      toast.error('Message must be between 10 and 2000 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('contact_messages').insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          affiliation,
          inquiry_type: inquiryType,
          message: trimmedMsg,
        },
      ]);

      if (error) {
        toast.error('Failed to deliver message: ' + (error.message || 'Please try again.'));
      } else {
        toast.success('Message sent! Our team will respond within 24–48 hours.');
        setSent(true);
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
          <span>Connect with the Team</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Contact IEEE CIS VVCE
        </h1>
        <p className="text-slate-300 text-sm">
          Have queries about membership, collaborations, hackathons, or workshops? Reach out to our leadership team.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl p-8 backdrop-blur-xl bg-white/5 border border-white/15 shadow-xl space-y-6">
            <h3 className="text-xl font-bold text-white">Chapter Headquarters</h3>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Campus Location</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    IEEE CIS Student Chapter Room, Department of Computer Science &amp; Engineering, Vidyavardhaka College of Engineering, Gokulam 3rd Stage, Mysuru - 570002, Karnataka, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Official Correspondence</h4>
                  <a
                    href="mailto:ieee-cis@vvce.ac.in"
                    className="text-xs text-cyan-400 hover:underline mt-1 block"
                  >
                    ieee-cis@vvce.ac.in
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Operating Hours</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Monday – Saturday: 9:00 AM – 5:00 PM IST
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
              ⚡ Student members receive prioritized query handling during ongoing competition registration periods.
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl p-8 sm:p-10 backdrop-blur-2xl bg-white/5 border border-white/15 shadow-2xl space-y-6">
            <h3 className="text-2xl font-bold text-white">Send Us a Direct Message</h3>

            {sent ? (
              <div className="p-8 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-xl font-bold text-white">Message Delivered</h4>
                <p className="text-slate-300 text-xs leading-relaxed max-w-sm mx-auto">
                  Thank you, <span className="text-white font-semibold">{name}</span>! Your inquiry has been routed to the chapter executive secretary. We will respond via email.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setMessage('');
                  }}
                  className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot Bot Trap */}
                <Honeypot value={honeypotVal} onChange={setHoneypotVal} fieldName="hp_contact_check" />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Your Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Rao"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={100}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={100}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Affiliation</label>
                    <select
                      value={affiliation}
                      onChange={(e) => setAffiliation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 transition"
                    >
                      <option value="VVCE Student">VVCE Student</option>
                      <option value="External Student">External Student</option>
                      <option value="VVCE Faculty">VVCE Faculty</option>
                      <option value="Industry Professional">Industry Professional</option>
                      <option value="Alumni">VVCE Alumni</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Inquiry Type</label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 transition"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Event Registration">Event Registration Query</option>
                      <option value="Project Collaboration">Project Collaboration</option>
                      <option value="IEEE CIS Membership">IEEE CIS Membership</option>
                      <option value="Workshop / Talk Request">Workshop / Talk Request</option>
                      <option value="Sponsorship">Sponsorship &amp; Partnerships</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Message <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500">{message.length}/2000</span>
                  </div>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe your inquiry, question, or proposal in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={2000}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Protected against spam and stored with Row-Level Security</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
