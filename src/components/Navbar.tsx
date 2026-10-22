/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'studio';
  onNavigate: (view: 'home' | 'studio') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-16">
        {/* Zone 1: Brand title wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ImageIcon className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-wide">
            Cadre<span className="text-blue-400">Photo</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('home')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'home' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Accueil
          </button>
          <button
            onClick={() => onNavigate('studio')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'studio' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Créer mon visuel
          </button>
        </nav>

        {/* Zone 3: Primary Action CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('studio')}
            className="min-h-[44px] px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl active:scale-[0.98] transition-all shadow-md shadow-blue-600/20 whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Créer mon visuel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
