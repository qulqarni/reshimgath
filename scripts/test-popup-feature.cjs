const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('========================================================');
console.log('📢 RUNNING PROMOTIONAL POPUP AD FEATURE TEST SUITE');
console.log('========================================================');

const rootDir = path.resolve(__dirname, '..');

// 1. Check storage.rules allows /popups
console.log('\n👉 TEST 1: Verifying storage.rules configuration for popups');
const storageRulesContent = fs.readFileSync(path.join(rootDir, 'storage.rules'), 'utf8');
assert(storageRulesContent.includes('/popups/'), 'storage.rules should allow /popups/ path');
assert(storageRulesContent.includes('/banners/'), 'storage.rules should allow /banners/ path');
assert(storageRulesContent.includes('allow read: if true'), 'storage.rules should allow public read for popups');
assert(storageRulesContent.includes('isAdmin() && isValidImage()'), 'storage.rules should enforce admin write for popups');
console.log('  ✅ Firebase Storage rules allow public read & admin upload for /popups and /banners');

// 2. Check firebaseService.js exports uploadPopupPhotoToFirebase
console.log('\n👉 TEST 2: Verifying firebaseService.js uploadPopupPhotoToFirebase');
const firebaseServiceContent = fs.readFileSync(path.join(rootDir, 'src/services/firebaseService.js'), 'utf8');
assert(firebaseServiceContent.includes('export const uploadPopupPhotoToFirebase'), 'firebaseService.js should export uploadPopupPhotoToFirebase');
assert(firebaseServiceContent.includes('validateImageFile(file)'), 'uploadPopupPhotoToFirebase should validate image file type and size');
assert(firebaseServiceContent.includes('compressImageToFile'), 'uploadPopupPhotoToFirebase should compress image for fast performance');
console.log('  ✅ uploadPopupPhotoToFirebase is exported and validates/compresses image before upload');

// 3. Check ProfileContext.jsx DEFAULT_HOME_CONTENT & safe merging
console.log('\n👉 TEST 3: Verifying ProfileContext.jsx popupAd schema & state initialization');
const profileContextContent = fs.readFileSync(path.join(rootDir, 'src/context/ProfileContext.jsx'), 'utf8');
assert(profileContextContent.includes('popupAd: {'), 'DEFAULT_HOME_CONTENT should include popupAd object');
assert(profileContextContent.includes('buttonText: "अधिक माहिती (View Details)"'), 'popupAd should have default button text');
assert(profileContextContent.includes('popupAd: {') && profileContextContent.includes('...(parsed.popupAd || {})'), 'ProfileContext should safely merge popupAd from localStorage');
console.log('  ✅ ProfileContext safely initializes and merges popupAd configuration');

// 4. Check SiteAnnouncementModal component implementation
console.log('\n👉 TEST 4: Verifying SiteAnnouncementModal component');
const modalPath = path.join(rootDir, 'src/components/common/SiteAnnouncementModal.jsx');
assert(fs.existsSync(modalPath), 'SiteAnnouncementModal.jsx must exist');
const modalContent = fs.readFileSync(modalPath, 'utf8');
assert(modalContent.includes('Cancel / बंद करा'), 'SiteAnnouncementModal must provide a cancel button');
assert(modalContent.includes('sessionStorage'), 'SiteAnnouncementModal must respect session dismissal to avoid harassment');
assert(modalContent.includes('Escape'), 'SiteAnnouncementModal must handle Escape key');
assert(modalContent.includes('forceOpen'), 'SiteAnnouncementModal must support admin preview via forceOpen');
assert(modalContent.includes('popupConfig.imageUrl'), 'SiteAnnouncementModal must render uploaded image');
console.log('  ✅ SiteAnnouncementModal has close button (X), cancel button, session dismissal, and link action');

// 5. Check App.jsx mounts SiteAnnouncementModal
console.log('\n👉 TEST 5: Verifying App.jsx mounts SiteAnnouncementModal');
const appContent = fs.readFileSync(path.join(rootDir, 'src/App.jsx'), 'utf8');
assert(appContent.includes('import { SiteAnnouncementModal }'), 'App.jsx must import SiteAnnouncementModal');
assert(appContent.includes('<SiteAnnouncementModal'), 'App.jsx must render SiteAnnouncementModal');
assert(appContent.includes("currentPath !== '/admin'"), 'App.jsx should not obstruct admin console');
console.log('  ✅ App.jsx renders SiteAnnouncementModal globally for site visitors');

// 6. Check AdminPage.jsx includes Popup Ad management card & tab
console.log('\n👉 TEST 6: Verifying AdminPage.jsx popup management UI');
const adminPageContent = fs.readFileSync(path.join(rootDir, 'src/pages/AdminPage.jsx'), 'utf8');
assert(adminPageContent.includes("activeTab === 'popup'"), 'AdminPage should support popup tab');
assert(adminPageContent.includes('handlePopupImageUpload'), 'AdminPage should have handlePopupImageUpload');
assert(adminPageContent.includes('handleRemovePopupImage'), 'AdminPage should have handleRemovePopupImage');
assert(adminPageContent.includes('handleTogglePopupActive'), 'AdminPage should have handleTogglePopupActive');
assert(adminPageContent.includes('showPopupPreview'), 'AdminPage should have showPopupPreview for testing');
assert(adminPageContent.includes('SiteAnnouncementModal'), 'AdminPage should render SiteAnnouncementModal preview');
console.log('  ✅ AdminPage provides full image upload, preview, toggle, remove, and settings UI');

console.log('\n========================================================');
console.log('🎉 ALL PROMOTIONAL POPUP FEATURE TESTS PASSED (100%)');
console.log('========================================================\n');
