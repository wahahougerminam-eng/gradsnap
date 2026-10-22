/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { StudioWorkflow } from './components/StudioWorkflow';
import { Image as ImageIcon, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'studio'>('home');

  const handleStartCreation = () => {
    setCurrentView('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content */}
      <main className="flex-1">
        {currentView === 'home' ? (
          <HomePage onStartCreation={handleStartCreation} />
        ) : (
          <div className="py-6 sm:py-8">
            <StudioWorkflow
              onBackToHome={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <ImageIcon className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-300">
              Cadre Photo — « J’y serai »
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-blue-400 transition-colors"
            >
              Accueil
            </button>
            <button
              onClick={() => {
                setCurrentView('studio');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-blue-400 transition-colors"
            >
              Créer mon visuel
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Traitement 100% sécurisé et local</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
