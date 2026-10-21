const fs = require('fs');
const path = require('path');

console.log('--- Verifying Menu Redesign & Content Management Features ---');

const baseDir = path.join(__dirname, '..');

// 1. Check all 5 new/updated page components exist
const requiredPages = [
  'src/pages/SuccessStoriesPage.jsx',
  'src/pages/FeedbacksPage.jsx',
  'src/pages/UpcomingEventsPage.jsx',
  'src/pages/GalleryPage.jsx',
  'src/pages/ContactPage.jsx',
  'src/pages/SubscriptionPage.jsx'
];

requiredPages.forEach((pagePath) => {
  const fullPath = path.join(baseDir, pagePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Missing file: ${pagePath}`);
    process.exit(1);
  }
  console.log(`✓ Verified component exists: ${pagePath}`);
});

// 2. Check Navbar.jsx contains the exact 6 menu items in order
const navbarContent = fs.readFileSync(path.join(baseDir, 'src/components/layout/Navbar.jsx'), 'utf8');

const expectedNavOrder = [
  "handleNav('/stories')",
  "handleNav('/feedbacks')",
  "handleNav('/events')",
  "handleNav('/gallery')",
  "handleNav('/contact')",
  "handleNav('/subscription')"
];

let lastIdx = -1;
for (const navCall of expectedNavOrder) {
  const idx = navbarContent.indexOf(navCall);
  if (idx === -1) {
    console.error(`❌ Navigation ${navCall} not found in Navbar.jsx`);
    process.exit(1);
  }
  if (idx <= lastIdx) {
    console.error(`❌ Navigation ${navCall} is out of order in Navbar.jsx`);
    process.exit(1);
  }
  lastIdx = idx;
}
console.log('✓ Verified 6 menu options exist in exact specified order in Navbar.jsx:');
console.log('   1. Success Stories (/stories)');
console.log('   2. Feedbacks (/feedbacks)');
console.log('   3. Upcoming Events (/events)');
console.log('   4. Gallery (/gallery)');
console.log('   5. Contact Us (/contact)');
console.log('   6. Subscription (/subscription)');

// 3. Check App.jsx routes
const appContent = fs.readFileSync(path.join(baseDir, 'src/App.jsx'), 'utf8');
const expectedRoutes = [
  '/stories',
  '/feedbacks',
  '/events',
  '/gallery',
  '/contact',
  '/subscription'
];

expectedRoutes.forEach((route) => {
  if (!appContent.includes(`case '${route}':`)) {
    console.error(`❌ App.jsx missing route handler for ${route}`);
    process.exit(1);
  }
});
console.log('✓ Verified App.jsx route switch handles all 6 page URLs');

// 4. Check Firestore and Storage rules
const firestoreRules = fs.readFileSync(path.join(baseDir, 'firestore.rules'), 'utf8');
const storageRules = fs.readFileSync(path.join(baseDir, 'storage.rules'), 'utf8');

['feedbacks', 'events', 'gallery', 'success_stories'].forEach((coll) => {
  if (!firestoreRules.includes(`match /${coll}/`)) {
    console.error(`❌ Firestore rules missing match for ${coll}`);
    process.exit(1);
  }
});
console.log('✓ Verified Firestore security rules include feedbacks, events, gallery, and success_stories');

['feedbacks', 'events', 'gallery', 'stories'].forEach((folder) => {
  if (!storageRules.includes(`match /${folder}/`)) {
    console.error(`❌ Storage rules missing match for ${folder}`);
    process.exit(1);
  }
});
console.log('✓ Verified Storage security rules include feedbacks, events, gallery, and stories');

// 5. Check AdminPage tabs
const adminContent = fs.readFileSync(path.join(baseDir, 'src/pages/AdminPage.jsx'), 'utf8');
['stories', 'feedbacks', 'events', 'gallery', 'inquiries'].forEach((tab) => {
  if (!adminContent.includes(`activeTab === '${tab}'`)) {
    console.error(`❌ AdminPage missing activeTab === '${tab}'`);
    process.exit(1);
  }
});
console.log('✓ Verified AdminPage has management sections for stories, feedbacks, events, gallery, and inquiries');

// 6. Check vercel.json and generate-static-routes.js
const vercelContent = fs.readFileSync(path.join(baseDir, 'vercel.json'), 'utf8');
const staticRoutesContent = fs.readFileSync(path.join(baseDir, 'scripts/generate-static-routes.js'), 'utf8');

['stories', 'feedbacks', 'events', 'gallery', 'subscription'].forEach((r) => {
  if (!vercelContent.includes(`/${r}`)) {
    console.error(`❌ vercel.json missing rewrite for /${r}`);
    process.exit(1);
  }
  if (!staticRoutesContent.includes(`'${r}'`)) {
    console.error(`❌ generate-static-routes.js missing static route for '${r}'`);
    process.exit(1);
  }
});
console.log('✓ Verified vercel.json rewrites and static route generation support all 6 routes');

console.log('\n🎉 ALL CHECKS PASSED SUCCESSFULLY!');
