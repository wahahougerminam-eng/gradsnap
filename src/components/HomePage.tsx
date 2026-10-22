/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Smartphone,
  Download,
  Lock,
} from 'lucide-react';
import { OFFICIAL_FRAME } from '../types';

interface HomePageProps {
  onStartCreation: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStartCreation }) => {
  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-10 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[340px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 tracking-wider uppercase">
            <span>Visuel Officiel</span>
            <span aria-hidden="true">·</span>
            <span>Édition 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-serif-academic leading-[1.15] text-balance">
            English department <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
              Graduation day 🎓
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            Personnalisez votre cadre officiel « English department / Graduation day 🎓 » en 3 étapes simples : visualisez le cadre, importez votre photo et ajoutez la mention « J’y serai ».
          </p>

          {/* Primary CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartCreation}
              className="w-full sm:w-auto min-h-[52px] px-8 py-3.5 rounded-2xl font-bold text-base bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-600/25 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
            >
              <Sparkles className="w-5 h-5 text-white" />
              <span>Créer mon visuel</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Privacy line */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              100% Confidentiel sur votre téléphone
            </span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Sans inscription</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Téléchargement gratuit</span>
          </div>
        </div>
      </section>

      {/* 2. LE CADRE EN VEDETTE & LES 3 ÉTAPES */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-10">
          {/* Cadre Preview Card */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[736/981] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-white group cursor-pointer" onClick={onStartCreation}>
              <img
                src={OFFICIAL_FRAME.imageUrl}
                alt="Cadre officiel"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-lg">
                  Utiliser ce cadre
                </span>
              </div>
            </div>
            <div className="mt-3 flex flex-col items-center gap-2 w-full max-w-[280px] sm:max-w-[320px]">
              <button
                type="button"
                onClick={onStartCreation}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Créer & Télécharger mon visuel</span>
              </button>

              <a
                href="/cadre-officiel.jpg"
                download="cadre-officiel-graduation.jpg"
                className="w-full min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                title="Télécharger le modèle de cadre vierge"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Télécharger le cadre vierge (JPG)</span>
              </a>
            </div>
          </div>

          {/* 3 Simple Steps */}
          <div className="md:col-span-7 space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Simple & Rapide en 3 Étapes
              </h2>
              <p className="text-xs text-slate-400">
                Aucune compétence en graphisme requise.
              </p>
            </div>

            <div className="space-y-4">
              {/* Étape 1 */}
              <div className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Le Cadre</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Le cadre officiel avec le cercle central et les vagues bleues est prêt.
                  </p>
                </div>
              </div>

              {/* Étape 2 */}
              <div className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Importer votre Photo</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Un bouton simple pour choisir votre photo depuis votre téléphone et l’ajuster dans le cercle.
                  </p>
                </div>
              </div>

              {/* Étape 3 */}
              <div className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Inscrire « J’y serai »</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Le texte apparaît sur le cadre bleu, puis vous téléchargez votre visuel final.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onStartCreation}
              className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Commencer maintenant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
