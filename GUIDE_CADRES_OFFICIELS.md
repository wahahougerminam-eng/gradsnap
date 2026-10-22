# Guide d'Intégration des Cadres Officiels de Graduation — GraduArt

Ce guide explique comment intégrer facilement les cadres officiels d'une université, d'une grande école ou d'un comité d'organisation sans réécrire le code de l'application.

---

## 1. Spécifications graphiques recommandées

- **Format de fichier :** PNG avec transparence (fond transparent au niveau de l'emplacement de la photo).
- **Dimensions cibles :** 1080 × 1350 pixels (ratio portrait standard 4:5, optimal pour les smartphones, Instagram, WhatsApp, LinkedIn et l'impression photo haute résolution).
- **Résolution :** 72 à 300 DPI.
- **Organisation des calques du cadre :**
  - **Zone transparente :** Découpe nette au centre/haut pour accueillir le visage de l'étudiant.
  - **Éléments au premier plan :** Toge universitaire, écharpe / ruban de promo, mortier, diplôme, logos officiels, sceau doré, bordures et millésime. Ces éléments sont protégés contre toute modification accidentelle car la photo de l'étudiant est dessinée **strictement en arrière-plan** dans la zone de découpe.

---

## 2. Déposer le fichier image officiel

1. Déposez votre fichier PNG dans le dossier public de l'application :
   ```
   /public/cadres/cadre_officiel_universite_2026.png
   ```

---

## 3. Déclarer le modèle dans `src/config/templates.ts`

Ajoutez ou modifiez une entrée dans la liste `GRADUATION_TEMPLATES` du fichier `src/config/templates.ts` :

```typescript
{
  id: 'universite-paris-2026',
  name: 'Université Officielle - Promo 2026',
  subtitle: 'Cadre officiel de la cérémonie de remise des diplômes',
  description: 'Cadre officiel approuvé avec sceau d’honneur et toge académique.',
  category: 'institutional',
  width: 1080,
  height: 1350,
  // Coordonnées précises (en pixels) de la zone transparente où apparaît la photo :
  cutout: {
    x: 140,              // Position horizontale du coin supérieur gauche
    y: 200,              // Position verticale du coin supérieur gauche
    width: 800,          // Largeur de la zone photo
    height: 780,         // Hauteur de la zone photo
    shape: 'rounded',    // 'rounded' | 'oval' | 'arch' | 'rect'
    borderRadius: 32,    // Rayon des coins si 'rounded'
  },
  officialFramePngUrl: '/cadres/cadre_officiel_universite_2026.png',
  isOfficial: true,
  badgeText: 'Cadre Officiel',
  colors: {
    primary: '#0B192C',
    secondary: '#1E3E62',
    accent: '#D4AF37',
    textGold: '#E5C158',
    textWhite: '#F8FAFC',
    frameBg: '#091322',
  },
  typography: {
    titleFont: 'Cinzel, serif',
    bodyFont: 'Plus Jakarta Sans, sans-serif',
  }
}
```

---

## 4. Test en direct dans l'interface

Vous pouvez également tester votre fichier PNG officiel directement dans l'application sans toucher au code :
1. Cliquez sur le bouton **« Cadres Officiels »** dans la barre de navigation.
2. Cliquez sur **« Sélectionner un fichier PNG transparent »**.
3. Le cadre sera immédiatement superposé en direct dans le studio photo pour vérifier le rendu et l'alignement avec les portraits.

---

## 5. Confidentialité & Conformité RGPD

- L'application effectue l'intégralité du traitement d'image (recadrage, superposition, rendu PNG) **directement dans le navigateur de l'utilisateur** via l'API Canvas HTML5.
- Aucune photo d'étudiant n'est téléversée sur un serveur distant ou dans le cloud.
- Aucune base de données, aucun compte requis.
