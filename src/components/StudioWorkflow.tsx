/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  TransformState,
  OFFICIAL_FRAME,
} from '../types';
import { PhotoEditorCanvas } from './PhotoEditorCanvas';
import {
  loadImageElement,
  validatePhotoFile,
  downloadOfficialVisualPng,
  shareOfficialVisualPng,
  renderOfficialFrameVisual,
} from '../utils/imageUtils';
import { fireGraduationConfetti } from '../utils/confetti';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Download,
  Share2,
  Check,
  Sparkles,
  Camera,
  Loader2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Eye,
  X,
  FileImage,
} from 'lucide-react';

interface StudioWorkflowProps {
  onBackToHome: () => void;
}

export const StudioWorkflow: React.FC<StudioWorkflowProps> = ({ onBackToHome }) => {
  // Current active step (1, 2, or 3)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Download format option ('png' | 'jpeg')
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpeg'>('png');

  // Full-screen preview modal for long-press saving on mobile
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  // File input ref for 100% reliable programmatic trigger
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loaded frame image
  const [frameImg, setFrameImg] = useState<HTMLImageElement | null>(null);

  // User's photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoImage, setPhotoImage] = useState<HTMLImageElement | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Transform state (position & zoom inside circle)
  const [transform, setTransform] = useState<TransformState>({
    x: 0,
    y: 0,
    scale: 1.0,
    rotation: 0,
    flipH: false,
  });

  // Step 3: Text fields
  const [topText, setTopText] = useState<string>("English department\nGraduation day 🎓");
  const [customText, setCustomText] = useState<string>("J'y serai");

  // Export states
  const [exportState, setExportState] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');

  // Load official frame asset on mount
  useEffect(() => {
    loadImageElement(OFFICIAL_FRAME.imageUrl)
      .then((img) => setFrameImg(img))
      .catch((err) => console.error('Erreur chargement cadre:', err));
  }, []);

  // Programmatically trigger native file picker
  const handleOpenPhotoPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Process selected file
  const processSelectedFile = async (file: File) => {
    setErrorMessage(null);
    setIsLoadingPhoto(true);

    const validation = await validatePhotoFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Fichier invalide');
      setIsLoadingPhoto(false);
      return;
    }

    try {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
      const newUrl = URL.createObjectURL(file);
      const img = await loadImageElement(newUrl);

      setPhotoFile(file);
      setPhotoUrl(newUrl);
      setPhotoImage(img);

      // Auto center photo with optimal portrait framing
      setTransform({
        x: 0,
        y: -15,
        scale: 1.1,
        rotation: 0,
        flipH: false,
      });

      // Move directly to step 2 for immediate adjustment
      setCurrentStep(2);
    } catch {
      setErrorMessage('Impossible de lire cette photo. Essayez un autre fichier.');
    } finally {
      setIsLoadingPhoto(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Helper to generate the canvas composite
  const createRenderedCanvas = (): HTMLCanvasElement => {
    const offscreen = document.createElement('canvas');
    offscreen.width = OFFICIAL_FRAME.width;
    offscreen.height = OFFICIAL_FRAME.height;

    renderOfficialFrameVisual(
      offscreen,
      frameImg,
      photoImage,
      transform,
      customText,
      topText
    );
    return offscreen;
  };

  // High-res download handler (PNG or JPEG)
  const handleDownload = async () => {
    setExportState('exporting');
    setErrorMessage(null);

    try {
      await new Promise((r) => setTimeout(r, 60));
      const offscreen = createRenderedCanvas();
      const ext = downloadFormat === 'jpeg' ? 'jpg' : 'png';
      const filename = `visuel-graduation-${Date.now()}.${ext}`;

      const res = await downloadOfficialVisualPng(offscreen, filename, downloadFormat);
      if (res.success) {
        setExportState('success');
        fireGraduationConfetti();
        setTimeout(() => setExportState('idle'), 3500);
      } else {
        setExportState('error');
        setErrorMessage(res.error || 'Erreur lors du téléchargement.');
      }
    } catch (err: any) {
      setExportState('error');
      setErrorMessage(err.message || 'Erreur inattendue.');
    }
  };

  // Open full-resolution image modal for long-press direct saving on phone
  const handleOpenPreviewModal = () => {
    const offscreen = createRenderedCanvas();
    const dataUrl = offscreen.toDataURL(downloadFormat === 'jpeg' ? 'image/jpeg' : 'image/png', 0.95);
    setPreviewModalUrl(dataUrl);
  };

  // Mobile native share handler
  const handleShare = async () => {
    setExportState('exporting');
    try {
      const offscreen = createRenderedCanvas();
      const res = await shareOfficialVisualPng(offscreen);
      if (res.shared) {
        setExportState('success');
        fireGraduationConfetti();
        setTimeout(() => setExportState('idle'), 3500);
      } else if (!res.supported) {
        handleDownload();
      } else {
        setExportState('idle');
      }
    } catch (err: any) {
      setExportState('error');
      setErrorMessage(err.message || 'Erreur lors du partage.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 space-y-6">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l’accueil</span>
        </button>

        {/* 3 Steps Segmented Control */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => setCurrentStep(1)}
            className={`min-h-[38px] px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentStep === 1
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-bold">
              1
            </span>
            <span className="hidden sm:inline">Le Cadre</span>
            <span className="sm:hidden">Cadre</span>
          </button>

          <button
            onClick={() => setCurrentStep(2)}
            className={`min-h-[38px] px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentStep === 2
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-bold">
              2
            </span>
            <span className="hidden sm:inline">Importer</span>
            <span className="sm:hidden">Photo</span>
          </button>

          <button
            onClick={() => setCurrentStep(3)}
            className={`min-h-[38px] px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentStep === 3
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-bold">
              3
            </span>
            <span>J’y serai</span>
          </button>
        </div>
      </div>

      {/* Accessible native file input */}
      <input
        ref={fileInputRef}
        type="file"
        id="camera-photo-input"
        accept="image/*"
        onChange={handlePhotoUpload}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Visual Canvas Display (Left Column) */}
        <div className="md:col-span-6 flex flex-col items-center">
          <PhotoEditorCanvas
            frameImage={frameImg}
            photoImage={photoImage}
            transform={transform}
            onTransformChange={setTransform}
            customText={customText}
            topText={topText}
            onOpenPhotoPicker={handleOpenPhotoPicker}
          />

          {/* PERMANENT DOWNLOAD CARD (Accessible anytime on all steps) */}
          <div className="w-full max-w-[380px] sm:max-w-[420px] bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mt-3 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Télécharger mon visuel</span>
              </span>

              {/* Format selection */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setDownloadFormat('png')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                    downloadFormat === 'png'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  PNG
                </button>
                <button
                  type="button"
                  onClick={() => setDownloadFormat('jpeg')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                    downloadFormat === 'jpeg'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  JPG
                </button>
              </div>
            </div>

            {/* Direct Download Button */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={exportState === 'exporting'}
                className={`flex-1 min-h-[48px] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  exportState === 'success'
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-600/25 active:scale-[0.98]'
                }`}
              >
                {exportState === 'exporting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Téléchargement...</span>
                  </>
                ) : exportState === 'success' ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Image téléchargée !</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Télécharger l’image</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenPreviewModal}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                title="Aperçu pour enregistrer directement par appui long sur smartphone"
              >
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Aperçu</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Format : {downloadFormat.toUpperCase()} Haute Définition</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Gratuit & Local
              </span>
            </div>
          </div>
        </div>

        {/* Step-Specific Controls Panel (Right Column) */}
        <div className="md:col-span-6 space-y-5">
          {/* ÉTAPE 1 : LE CADRE */}
          {currentStep === 1 && (
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  <span>Étape 1 sur 3</span>
                </div>
                <h3 className="text-xl font-bold text-white">Le Cadre Officiel</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Voici le cadre officiel prêt à accueillir votre photo. Il est composé d’un cercle central épuré, des mentions « English department / Graduation day 🎓 » et d’une vague bleue marine.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 space-y-2">
                <p className="font-semibold text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Cadre officiel sélectionné</span>
                </p>
                <p className="text-slate-400">
                  Importez dès maintenant votre photo pour la placer directement dans le cercle.
                </p>
              </div>

              {/* Direct Import Button right from Step 1 */}
              <button
                type="button"
                onClick={handleOpenPhotoPicker}
                className="w-full min-h-[50px] px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                <span>Importer ma photo maintenant</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-slate-400 hover:text-white underline transition-colors"
                >
                  Continuer vers l’étape 2 →
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : BOUTON IMPORTER DEPUIS LE TÉLÉPHONE */}
          {currentStep === 2 && (
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  <span>Étape 2 sur 3</span>
                </div>
                <h3 className="text-xl font-bold text-white">Importer votre Photo</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Appuyez sur le bouton bleu ci-dessous pour choisir une photo depuis les fichiers ou la galerie de votre téléphone.
                </p>
              </div>

              {/* Big Import Button with direct button click handler */}
              <div>
                <button
                  type="button"
                  onClick={handleOpenPhotoPicker}
                  disabled={isLoadingPhoto}
                  className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl font-bold text-base bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-xl shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  {isLoadingPhoto ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Chargement de la photo...</span>
                    </>
                  ) : photoImage ? (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      <span>Changer / Remplacer ma photo</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      <span>Choisir une photo dans mon téléphone</span>
                    </>
                  )}
                </button>
              </div>

              {/* Touch Adjustment Instruction */}
              {photoImage ? (
                <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200 space-y-1.5">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>Photo bien importée !</span>
                  </p>
                  <p className="text-slate-300">
                    Vous pouvez maintenant glisser votre doigt sur le cercle pour centrer votre visage, ou utiliser les boutons de zoom ci-contre.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-center text-xs text-slate-400">
                  <span>Astuce : Vous pouvez aussi toucher directement le cercle sur l’image pour choisir votre photo.</span>
                </div>
              )}

              {/* Error notice */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Quick direct download right in Step 2 */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                <span className="text-xs font-semibold text-emerald-300 block">
                  Envie de télécharger directement votre visuel ?
                </span>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={exportState === 'exporting'}
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger maintenant ({downloadFormat.toUpperCase()})</span>
                </button>
              </div>

              {/* Navigation CTA */}
              <div className="pt-1 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 transition-colors"
                >
                  Retour
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="min-h-[46px] px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:brightness-105 active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <span>Étape suivante : Écrire « J’y serai »</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : CHAMP TEXTE "J'Y SERAI" & TÉLÉCHARGEMENT */}
          {currentStep === 3 && (
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  <span>Étape 3 sur 3</span>
                </div>
                <h3 className="text-xl font-bold text-white">Texte & Téléchargement</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Personnalisez vos mentions puis téléchargez ou partagez votre image finale.
                </p>
              </div>

              {/* Top Title: "English department \n Graduation day" */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Titre en haut du visuel (2 lignes possibles) :
                </label>
                <textarea
                  rows={2}
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="English department&#10;Graduation day 🎓"
                  maxLength={60}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all tracking-wide resize-none"
                />

                {/* Quick 1-click Preset Buttons for Top Title */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="text-[11px] text-slate-500">Presets :</span>
                  <button
                    type="button"
                    onClick={() => setTopText("English department\nGraduation day 🎓")}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-blue-300 transition-colors"
                  >
                    English department / Graduation day 🎓
                  </button>
                  <button
                    type="button"
                    onClick={() => setTopText("ENGLISH DEPARTMENT\nGRADUATION DAY 🎓")}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-blue-300 transition-colors"
                  >
                    MAJUSCULES
                  </button>
                </div>
              </div>

              {/* The Dedicated Text Input Field for "J'y serai" */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Message en bas (zone bleue) :
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="J'y serai"
                  maxLength={35}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-base font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all tracking-wide"
                />

                {/* Quick 1-click Preset Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500">Suggestions :</span>
                  <button
                    type="button"
                    onClick={() => setCustomText("J'y serai")}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-blue-300 transition-colors"
                  >
                    J’y serai
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomText("J'y serai !")}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-blue-300 transition-colors"
                  >
                    J’y serai !
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomText("J'y serai 🎓")}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-blue-300 transition-colors"
                  >
                    J’y serai 🎓
                  </button>
                </div>
              </div>

              {/* Format selection */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-300 font-semibold">Format de téléchargement :</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDownloadFormat('png')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      downloadFormat === 'png'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    PNG (Haute Qualité)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDownloadFormat('jpeg')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      downloadFormat === 'jpeg'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    JPG (Léger)
                  </button>
                </div>
              </div>

              {/* Download & Share Actions */}
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={exportState === 'exporting'}
                  className={`w-full min-h-[52px] px-6 py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-xl transition-all ${
                    exportState === 'success'
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-600/30 hover:brightness-105 active:scale-[0.98]'
                  }`}
                >
                  {exportState === 'exporting' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Téléchargement en cours...</span>
                    </>
                  ) : exportState === 'success' ? (
                    <>
                      <Check className="w-5 h-5 stroke-[2.5]" />
                      <span>Téléchargé avec succès !</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Télécharger mon visuel ({downloadFormat.toUpperCase()})</span>
                    </>
                  )}
                </button>

                {/* Direct buttons for WhatsApp/Share and Full Preview */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleShare}
                    disabled={exportState === 'exporting'}
                    className="min-h-[44px] px-3 py-2 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                  >
                    <Share2 className="w-4 h-4 text-blue-400" />
                    <span>Partager</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenPreviewModal}
                    className="min-h-[44px] px-3 py-2 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                  >
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>Aperçu plein écran</span>
                  </button>
                </div>
              </div>

              {/* Navigation Back */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  ← Ajuster la photo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FULL-SCREEN PREVIEW MODAL (Long-press to save on smartphone) */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col items-center space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal header */}
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <FileImage className="w-4 h-4 text-blue-400" />
                <span>Votre visuel final</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Generated image display */}
            <div className="relative w-full aspect-[736/981] rounded-2xl overflow-hidden border border-slate-700 shadow-xl bg-white">
              <img
                src={previewModalUrl}
                alt="Visuel final"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-center text-xs text-amber-300 font-medium bg-amber-400/10 border border-amber-400/20 rounded-xl p-2.5 w-full">
              💡 <strong>Astuce sur smartphone :</strong> Maintenez votre doigt appuyé sur l’image pour choisir « Enregistrer dans Photos ».
            </p>

            {/* Action buttons inside modal */}
            <div className="w-full flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  handleDownload();
                  setPreviewModalUrl(null);
                }}
                className="flex-1 min-h-[46px] rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le fichier</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
