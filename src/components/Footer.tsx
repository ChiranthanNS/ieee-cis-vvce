import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-28 border-t border-white/10 bg-slate-950/80 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        {/* Col 1: About */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-base flex items-center gap-2">
            <span className="text-cyan-400">IEEE CIS</span> VVCE
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            IEEE Computational Intelligence Society Student Chapter at Vidyavardhaka College of Engineering. Advancing AI, Machine Learning, Fuzzy Systems &amp; Neural Computing for technical excellence.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted &amp; Hardened Architecture</span>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 className="font-semibold text-cyan-300 text-sm mb-3">Quick Links</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><Link to="/events" className="hover:text-cyan-300 transition">Upcoming Events</Link></li>
            <li><Link to="/projects" className="hover:text-cyan-300 transition">Student Projects</Link></li>
            <li><Link to="/research" className="hover:text-cyan-300 transition">Research &amp; Papers</Link></li>
            <li><Link to="/resources" className="hover:text-cyan-300 transition">Learning Resources</Link></li>
            <li><Link to="/gallery" className="hover:text-cyan-300 transition">Photo Gallery</Link></li>
            <li><Link to="/committee" className="hover:text-cyan-300 transition">Executive Committee</Link></li>
          </ul>
        </div>

        {/* Col 3: Affiliations */}
        <div>
          <h4 className="font-semibold text-cyan-300 text-sm mb-3">Affiliation</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>Vidyavardhaka College of Engineering, Mysuru</li>
            <li>Autonomous Institute, Affiliated to VTU Belagavi</li>
            <li>IEEE Student Branch (STB64581)</li>
            <li>IEEE Bangalore Section</li>
            <li>IEEE Computational Intelligence Society</li>
          </ul>
        </div>

        {/* Col 4: Contact */}
        <div>
          <h4 className="font-semibold text-cyan-300 text-sm mb-3">Get in Touch</h4>
          <div className="space-y-2.5 text-xs text-slate-400">
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <a href="mailto:ieee-cis@vvce.ac.in" className="hover:text-white transition">
                ieee-cis@vvce.ac.in
              </a>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>P.B. No. 206, Gokulam 3rd Stage, Mysuru - 570002, Karnataka, India</span>
            </div>
            <div className="pt-2">
              <a
                href="https://vvce.ac.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-xs font-medium"
              >
                <span>Official VVCE Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} IEEE CIS VVCE Student Chapter. All rights reserved.</span>
          <span className="text-slate-600">Built with React, Supabase Realtime &amp; Strict Security Hardening</span>
        </div>
      </div>
    </footer>
  );
};
