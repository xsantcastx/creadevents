/**
 * Theme Profiles Seed Script
 * 
 * SIMPLE METHOD: Just go to your Settings admin page and click "Save All Settings"
 * The theme profiles are already configured in the default settings.
 * 
 * Alternatively, you can run this in the browser console while logged in as admin:
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║        Theme Profiles - Seed Instructions                      ║
╚════════════════════════════════════════════════════════════════╝

✅ EASIEST METHOD - Use Admin Settings Page:
─────────────────────────────────────────────────────────────────

1. Make sure your dev server is running:
   npm start

2. Go to http://localhost:4200/admin/settings

3. Click "Save All Settings" button

   The following theme profiles will be saved automatically:
   • Spring Bloom - Pink/rose theme
   • Summer Sunshine - Warm orange/gold  
   • Autumn Harvest - Rich browns
   • Winter Frost - Cool blues
   • Sage Garden - Default green theme

─────────────────────────────────────────────────────────────────
📋 ALTERNATIVE - Browser Console Method:
─────────────────────────────────────────────────────────────────

1. Go to http://localhost:4200 (logged in as admin)

2. Open browser console (F12)

3. Run this code:

firebase.firestore().collection('settings').doc('general').update({
  activeThemeProfile: 'custom',
  themeProfile1Name: 'Spring Bloom',
  themeProfile1Data: JSON.stringify({
    themeAccentColor: '#ff69b4',
    themeAccentSoft: '#ffb3d9',
    themeAccentDark: '#d5578f',
    themeInkColor: '#2d1b2e',
    themeInkSoft: '#5a4a5e',
    themeBgColor: '#fff5f8',
    themePaperColor: '#ffffff',
    themeLineColor: '#ffe0ec'
  }),
  themeProfile2Name: 'Summer Sunshine',
  themeProfile2Data: JSON.stringify({
    themeAccentColor: '#ffa500',
    themeAccentSoft: '#ffc04d',
    themeAccentDark: '#e69500',
    themeInkColor: '#2c1810',
    themeInkSoft: '#6b4423',
    themeBgColor: '#fffbf0',
    themePaperColor: '#ffffff',
    themeLineColor: '#ffe8c5'
  }),
  themeProfile3Name: 'Autumn Harvest',
  themeProfile3Data: JSON.stringify({
    themeAccentColor: '#d2691e',
    themeAccentSoft: '#e89b5e',
    themeAccentDark: '#a0501a',
    themeInkColor: '#3d2817',
    themeInkSoft: '#6b4a2f',
    themeBgColor: '#fdf8f3',
    themePaperColor: '#ffffff',
    themeLineColor: '#f0dcc8'
  }),
  themeProfile4Name: 'Winter Frost',
  themeProfile4Data: JSON.stringify({
    themeAccentColor: '#4a90e2',
    themeAccentSoft: '#7eb2f5',
    themeAccentDark: '#3a75c4',
    themeInkColor: '#1a2f4a',
    themeInkSoft: '#3d5a7a',
    themeBgColor: '#f5f9ff',
    themePaperColor: '#ffffff',
    themeLineColor: '#d6e8ff'
  }),
  themeProfile5Name: 'Sage Garden (Default)',
  themeProfile5Data: JSON.stringify({
    themeAccentColor: '#a8c5a4',
    themeAccentSoft: '#c1d5be',
    themeAccentDark: '#8aab85',
    themeInkColor: '#1d2a39',
    themeInkSoft: '#3f5f47',
    themeBgColor: '#f8f9fa',
    themePaperColor: '#ffffff',
    themeLineColor: '#e5e7eb'
  })
}).then(() => console.log('✅ Theme profiles seeded!'));

─────────────────────────────────────────────────────────────────
✅ DONE! Your seasonal theme profiles are ready to use.
─────────────────────────────────────────────────────────────────
`);
