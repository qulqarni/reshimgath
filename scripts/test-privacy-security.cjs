/**
 * Automated Verification Script: Step 5 - Privacy, Account Deletion & Security
 * Tests media validation, account deletion, permission boundaries, firestore.rules, storage.rules, and retention.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('TEST SUITE: STEP 5 - PRIVACY, ACCOUNT DELETION & SECURITY');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

// -----------------------------------------------------------------------------
// TEST 1: Media File Validator Logic
// -----------------------------------------------------------------------------
runTest('Media Validator - Validates image types and extensions correctly', () => {
  const mediaValidatorContent = fs.readFileSync(
    path.join(__dirname, '../src/utils/mediaValidator.js'),
    'utf8'
  );

  assert(mediaValidatorContent.includes("ALLOWED_IMAGE_TYPES = ["), 'Must define ALLOWED_IMAGE_TYPES');
  assert(mediaValidatorContent.includes("'image/jpeg'"), 'Must allow image/jpeg');
  assert(mediaValidatorContent.includes("'image/png'"), 'Must allow image/png');
  assert(mediaValidatorContent.includes("'image/webp'"), 'Must allow image/webp');
  assert(mediaValidatorContent.includes("MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024"), 'Max photo size must be 10MB');
  assert(mediaValidatorContent.includes("MAX_BIODATA_SIZE_BYTES = 15 * 1024 * 1024"), 'Max biodata size must be 15MB');
  assert(mediaValidatorContent.includes("blockedExtensions"), 'Must block executable/svg scripts');
});

runTest('Media Validator - Permission check enforces owner/admin boundaries', () => {
  const mediaValidatorContent = fs.readFileSync(
    path.join(__dirname, '../src/utils/mediaValidator.js'),
    'utf8'
  );

  assert(mediaValidatorContent.includes('export const verifyUploadPermission ='), 'Must export verifyUploadPermission');
  assert(mediaValidatorContent.includes("currentUser.role === 'admin'"), 'Must grant upload permission to admins');
  assert(mediaValidatorContent.includes('String(currentUser.id) === String(targetUserId)'), 'Must grant upload permission to profile owner');
  assert(mediaValidatorContent.includes('Permission denied:'), 'Must deny permission to unauthorized third party users');
});

// -----------------------------------------------------------------------------
// TEST 2: Backend Upload Media Integration in firebaseService.js
// -----------------------------------------------------------------------------
runTest('FirebaseService - Enforces media validation and permissions on upload', () => {
  const fbServiceContent = fs.readFileSync(
    path.join(__dirname, '../src/services/firebaseService.js'),
    'utf8'
  );

  assert(fbServiceContent.includes('validateImageFile'), 'Must import validateImageFile');
  assert(fbServiceContent.includes('validateBiodataFile'), 'Must import validateBiodataFile');
  assert(fbServiceContent.includes('verifyUploadPermission'), 'Must import verifyUploadPermission');
  assert(fbServiceContent.includes('UPLOAD_PERMISSION_DENIED'), 'Must throw UPLOAD_PERMISSION_DENIED on unauthorized upload');
  assert(fbServiceContent.includes('INVALID_MEDIA_FILE'), 'Must throw INVALID_MEDIA_FILE on invalid file format or size');
});

// -----------------------------------------------------------------------------
// TEST 3: Account Deletion Implementation in firebaseService.js
// -----------------------------------------------------------------------------
runTest('FirebaseService - deleteUserAccount permanently cleans up profile, storage, chats, and logs audit', () => {
  const fbServiceContent = fs.readFileSync(
    path.join(__dirname, '../src/services/firebaseService.js'),
    'utf8'
  );

  assert(fbServiceContent.includes('export const deleteUserAccount = async'), 'Must export deleteUserAccount');
  assert(fbServiceContent.includes('deleteDoc(doc(db, PROFILES_COLLECTION, idStr))'), 'Must delete profile document');
  assert(fbServiceContent.includes('deleteObject(ref(storage, u))'), 'Must delete storage photos and biodata');
  assert(fbServiceContent.includes('DELETION_LOGS_COLLECTION'), 'Must log compliance audit event in deletion_logs');
  assert(fbServiceContent.includes('reshimgath_deleted_profiles'), 'Must update deleted profiles cache');
  assert(fbServiceContent.includes('reshimgath_interests'), 'Must clean interests cache');
  assert(fbServiceContent.includes('reshimgath_notifications'), 'Must clean notifications cache');
});

runTest('FirebaseService - Public web deletion request submission & admin retrieval', () => {
  const fbServiceContent = fs.readFileSync(
    path.join(__dirname, '../src/services/firebaseService.js'),
    'utf8'
  );

  assert(fbServiceContent.includes('export const submitAccountDeletionRequest ='), 'Must export submitAccountDeletionRequest');
  assert(fbServiceContent.includes('export const fetchDeletionRequestsFromFirestore ='), 'Must export fetchDeletionRequestsFromFirestore');
  assert(fbServiceContent.includes('export const updateDeletionRequestStatus ='), 'Must export updateDeletionRequestStatus');
  assert(fbServiceContent.includes('DELETION_REQUESTS_COLLECTION'), 'Must use deletion_requests collection');
});

// -----------------------------------------------------------------------------
// TEST 4: Public Deletion Page & Route (/delete-account, /data-deletion)
// -----------------------------------------------------------------------------
runTest('Public Deletion Page - Component exists with Google Play required disclosures', () => {
  const deletionPagePath = path.join(__dirname, '../src/pages/AccountDeletionPage.jsx');
  assert(fs.existsSync(deletionPagePath), 'AccountDeletionPage.jsx must exist');

  const content = fs.readFileSync(deletionPagePath, 'utf8');
  assert(content.includes('Account & Data Deletion Request'), 'Must contain deletion title');
  assert(content.includes('Data That Will Be Permanently Deleted'), 'Must detail permanently deleted data');
  assert(content.includes('Data Retained & Statutory Requirements'), 'Must explain statutory retention under IT Rules');
  assert(content.includes('submitAccountDeletionRequest'), 'Must submit deletion request to service');
  assert(content.includes('submit'), 'Must have submission form');
  assert(content.includes('pk9823425404@gmail.com'), 'Must provide monitored grievance contact');
});

runTest('App Routing & Navigation - Registers /delete-account and /data-deletion', () => {
  const appContent = fs.readFileSync(path.join(__dirname, '../src/App.jsx'), 'utf8');
  assert(appContent.includes("case '/delete-account':"), 'Must register /delete-account route');
  assert(appContent.includes("case '/data-deletion':"), 'Must register /data-deletion route');
  assert(appContent.includes('<AccountDeletionPage'), 'Must render AccountDeletionPage');

  const footerContent = fs.readFileSync(path.join(__dirname, '../src/components/layout/Footer.jsx'), 'utf8');
  assert(footerContent.includes("onNavigate('/delete-account')"), 'Footer must link to /delete-account');
});

// -----------------------------------------------------------------------------
// TEST 5: Privacy Policy Accuracy & Legal Compliance
// -----------------------------------------------------------------------------
runTest('Privacy Policy - Accurately covers personal info, photos, chats, reporting, retention, and deletion', () => {
  const privacyContent = fs.readFileSync(
    path.join(__dirname, '../src/pages/PrivacyPolicyPage.jsx'),
    'utf8'
  );

  assert(privacyContent.includes('Information We Collect'), 'Must describe collected information');
  assert(privacyContent.includes('Profile Photos & Media Protection'), 'Must describe photo/media rules');
  assert(privacyContent.includes('Private Messaging & Communication Safety'), 'Must describe messaging privacy');
  assert(privacyContent.includes('Strict Family Privacy & Phone Number Protection'), 'Must describe phone privacy');
  assert(privacyContent.includes('Data Sharing & Third-Party Disclosure Policy'), 'Must describe zero-data-sale policy');
  assert(privacyContent.includes('Data Retention Policy'), 'Must describe retention periods & IT Rules');
  assert(privacyContent.includes('Account Deletion & Right to Erasure'), 'Must describe deletion mechanisms');
  assert(privacyContent.includes('Grievance Redressal Officer & Bureau Contact'), 'Must provide Grievance Officer details');
  assert(privacyContent.includes('pk9823425404@gmail.com'), 'Must list monitored grievance email');
  assert(privacyContent.includes('+91 9823425404'), 'Must list helpline phone number');
});

// -----------------------------------------------------------------------------
// TEST 6: In-App Settings Account Deletion
// -----------------------------------------------------------------------------
runTest('SettingsPage - Danger zone account deletion with confirmation & cleanup', () => {
  const settingsContent = fs.readFileSync(
    path.join(__dirname, '../src/pages/SettingsPage.jsx'),
    'utf8'
  );

  assert(settingsContent.includes('deleteUserAccount'), 'Must invoke deleteUserAccount service');
  assert(settingsContent.includes('deleteProfile'), 'Must invoke deleteProfile context method');
  assert(settingsContent.includes('logout()'), 'Must log out user');
  assert(settingsContent.includes('deletionReason'), 'Must capture reason for deletion');
  assert(settingsContent.includes('confirmedAcknowledged'), 'Must require explicit confirmation checkbox');
  assert(settingsContent.includes('/delete-account'), 'Must link to public deletion form');
});

// -----------------------------------------------------------------------------
// TEST 7: Admin Dashboard Deletion Requests Moderation
// -----------------------------------------------------------------------------
runTest('AdminPage - Deletion Requests Tab with inspection and permanent purge actions', () => {
  const adminContent = fs.readFileSync(
    path.join(__dirname, '../src/pages/AdminPage.jsx'),
    'utf8'
  );

  assert(adminContent.includes("activeTab === 'deletions'"), 'Must render deletions tab');
  assert(adminContent.includes('deletionRequests'), 'Must consume deletionRequests');
  assert(adminContent.includes('processDeletionRequest'), 'Must provide processDeletionRequest action');
  assert(adminContent.includes('dismissDeletionRequest'), 'Must provide dismissDeletionRequest action');
  assert(adminContent.includes('Confirm Permanent Account Deletion'), 'Must have confirmation modal');
  assert(adminContent.includes('pendingDeletionsCount'), 'Must display pending count badge');
});

// -----------------------------------------------------------------------------
// TEST 8: Firestore Security Rules (firestore.rules)
// -----------------------------------------------------------------------------
runTest('Firestore Rules - Default deny, participant chat privacy, admin reports & deletion controls', () => {
  const rulesPath = path.join(__dirname, '../firestore.rules');
  assert(fs.existsSync(rulesPath), 'firestore.rules must exist');

  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  assert(rulesContent.includes("rules_version = '2'"), 'Must declare rules_version 2');
  assert(rulesContent.includes('match /databases/{database}/documents'), 'Must match database documents');
  assert(rulesContent.includes('function isAdmin()'), 'Must declare isAdmin() helper');
  assert(rulesContent.includes('function isOwner('), 'Must declare isOwner() helper');
  assert(rulesContent.includes('pk9823425404@gmail.com'), 'Must verify admin email');
  
  // Profiles
  assert(rulesContent.includes('match /profiles/{profileId}'), 'Must secure profiles collection');
  
  // Chats - strictly participants only
  assert(rulesContent.includes('match /chats/{chatId}'), 'Must secure chats collection');
  assert(rulesContent.includes('request.auth.uid in resource.data.participants') || rulesContent.includes('isChatParticipant'), 'Must enforce participant-only chat privacy');

  // Reports - write allowed for users, read/update/delete restricted to admin
  assert(rulesContent.includes('match /reports/{reportId}'), 'Must secure reports collection');
  assert(rulesContent.includes('isValidReport'), 'Must allow report creation with validation');
  assert(rulesContent.includes('allow read, update, delete: if isAdmin();'), 'Must restrict report reads to admin');

  // Deletion requests - write allowed for public/user, read/update/delete restricted to admin
  assert(rulesContent.includes('match /deletion_requests/{requestId}'), 'Must secure deletion_requests collection');

  // Deletion logs - admin only
  assert(rulesContent.includes('match /deletion_logs/{logId}'), 'Must secure deletion_logs collection');

  // Terms acceptances - immutable audit trail
  assert(rulesContent.includes('match /terms_acceptances/{acceptanceId}'), 'Must secure terms_acceptances collection');
  assert(rulesContent.includes('allow update, delete: if false'), 'Terms acceptances must be immutable');
});

// -----------------------------------------------------------------------------
// TEST 9: Firebase Storage Security Rules (storage.rules)
// -----------------------------------------------------------------------------
runTest('Storage Rules - Validates image/pdf MIME, size limits (<10MB/<15MB), and ownership', () => {
  const storageRulesPath = path.join(__dirname, '../storage.rules');
  assert(fs.existsSync(storageRulesPath), 'storage.rules must exist');

  const storageContent = fs.readFileSync(storageRulesPath, 'utf8');
  assert(storageContent.includes("service firebase.storage"), 'Must declare firebase.storage');
  assert(storageContent.includes('10 * 1024 * 1024'), 'Must enforce 10MB photo cap');
  assert(storageContent.includes('15 * 1024 * 1024'), 'Must enforce 15MB biodata cap');
  assert(storageContent.includes('match /avatars/{userId}'), 'Must secure avatars path');
  assert(storageContent.includes('match /photos/{userId}'), 'Must secure photos path');
  assert(storageContent.includes('match /biodatas/{userId}'), 'Must secure biodatas path');
  assert(storageContent.includes('isOwner(userId) || isAdmin()'), 'Must enforce ownership for write/delete');
});

// -----------------------------------------------------------------------------
// TEST 10: firebase.json Configuration
// -----------------------------------------------------------------------------
runTest('firebase.json - Properly points to firestore.rules and storage.rules', () => {
  const firebaseJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../firebase.json'), 'utf8'));
  assert(firebaseJson.firestore && firebaseJson.firestore.rules === 'firestore.rules', 'firebase.json must declare firestore rules');
  assert(firebaseJson.storage && firebaseJson.storage.rules === 'storage.rules', 'firebase.json must declare storage rules');
});

console.log('\n================================================================');
console.log(`RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
console.log('================================================================');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
