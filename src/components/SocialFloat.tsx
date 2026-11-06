import React from 'react';
import { LinkedInIcon, InstagramIcon } from './BrandIcons';

export const SocialFloat: React.FC = () => {
  return (
    <div className="fixed bottom-6 left-6 flex flex-col gap-3 z-40">
      <a
        href="https://www.linkedin.com/in/ieee-cis-vvce-b103363b0"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="IEEE CIS VVCE LinkedIn"
        className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-cyan-500/20 backdrop-blur-md border border-white/20 hover:border-cyan-400 text-white hover:text-cyan-300 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-cyan-500/25"
      >
        <LinkedInIcon className="w-5 h-5" />
      </a>
      <a
        href="https://www.instagram.com/ieee.cis.vvce"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="IEEE CIS VVCE Instagram"
        className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-pink-500/20 backdrop-blur-md border border-white/20 hover:border-pink-400 text-white hover:text-pink-300 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-pink-500/25"
      >
        <InstagramIcon className="w-5 h-5" />
      </a>
    </div>
  );
};
