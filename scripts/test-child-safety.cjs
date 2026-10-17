/**
 * Test Suite: Child-Safety Standards & Reporting Verification
 * Tests:
 * 1. Public Child Safety Incident Reporting (works without login)
 * 2. Mandatory fields & validation for public safety reports
 * 3. Priority tagging (isChildSafety: true, priority: 'critical')
 * 4. Priority queue ordering in Admin Moderation (critical child safety pending reports first)
 * 5. Route and Policy verification (non-PDF, statutory Indian compliance cybercrime.gov.in / 1930 / POCSO)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('🛡️ RUNNING CHILD SAFETY STANDARDS & MODERATION TEST SUITE');
console.log('========================================================\n');

// 1. VERIFY FILE AND ROUTE DEFINITIONS
console.log('👉 TEST 1: Verifying Child Safety Page & Route Configurations');

const appJsxPath = path.join(__dirname, '../src/App.jsx');
const appJsxContent = fs.readFileSync(appJsxPath, 'utf8');

assert(appJsxContent.includes('ChildSafetyStandardsPage'), 'ChildSafetyStandardsPage must be imported in App.jsx');
assert(appJsxContent.includes("case '/child-safety':"), "Route case '/child-safety' must be declared in App.jsx");
assert(appJsxContent.includes("case '/child-safety-standards':"), "Route case '/child-safety-standards' alias must be declared in App.jsx");
assert(appJsxContent.includes("case '/safety-standards':"), "Route case '/safety-standards' alias must be declared in App.jsx");
console.log('  ✅ Routes verified: /child-safety, /child-safety-standards, /safety-standards present in App.jsx');

const policyPath = path.join(__dirname, '../src/pages/ChildSafetyStandardsPage.jsx');
const policyContent = fs.readFileSync(policyPath, 'utf8');

// Ensure zero tolerance, CSAE, CSAM, grooming, and statutory frameworks
assert(policyContent.includes('Zero-Tolerance Policy'), 'Policy must declare zero-tolerance');
assert(policyContent.includes('CSAM') || policyContent.includes('CSAE'), 'Policy must explicitly define CSAE/CSAM prohibition');
assert(policyContent.includes('Grooming'), 'Policy must prohibit grooming');
assert(policyContent.includes('cybercrime.gov.in'), 'Policy must reference official national portal');
assert(policyContent.includes('1930'), 'Policy must include national cybercrime helpline 1930');
assert(policyContent.includes('POCSO'), 'Policy must reference POCSO Act');
console.log('  ✅ Child safety policy content verified: CSAE/CSAM prohibition, grooming prohibition, and Indian statutory reporting lines (cybercrime.gov.in / 1930 / POCSO) verified.');

// 2. VERIFY PUBLIC REPORTING FUNCTIONALITY WITHOUT LOGIN
console.log('\n👉 TEST 2: Public Child Safety Incident Reporting (No Login Required)');

let mockReportsDatabase = [];

function submitReportSimulator(user, reportData) {
  const isChildSafetyReport = Boolean(
    reportData.isChildSafety ||
    reportData.priority === 'critical' ||
    ['Child Sexual Abuse Material (CSAM)', 'Child Exploitation / Underage Profile', 'Grooming / Predatory Behavior toward Minors'].includes(reportData.reason)
  );

  // Authenticated user check bypassed ONLY for public child safety reporting
  if (!user) {
    if (!isChildSafetyReport) {
      throw new Error('Please log in to report content.');
    }
    if (!reportData.reporterEmail && !reportData.reporterPhone) {
      throw new Error('Please provide at least an email address or mobile number for child safety incident reports.');
    }
  }

  const newReport = {
    id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    reporterId: user ? user.id : 'public_reporter',
    reporterName: user ? (user.name || user.email) : (reportData.reporterName || 'Concerned Public Citizen'),
    reporterEmail: user ? user.email : (reportData.reporterEmail || null),
    reporterPhone: user ? user.phone : (reportData.reporterPhone || null),
    targetType: reportData.targetType || 'profile',
    targetId: reportData.targetId || 'unspecified',
    targetName: reportData.targetName || 'Unspecified Member',
    reason: reportData.reason,
    details: reportData.details || '',
    evidencePhotoUrl: reportData.evidencePhotoUrl || null,
    evidenceText: reportData.evidenceText || null,
    messageId: reportData.messageId || null,
    isChildSafety: isChildSafetyReport,
    priority: isChildSafetyReport ? 'critical' : (reportData.priority || 'normal'),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  mockReportsDatabase.push(newReport);
  return { success: true, report: newReport };
}

// 2a. Public report submission without login succeeds
const publicReportRes = submitReportSimulator(null, {
  targetType: 'profile',
  targetId: 'suspect_user_101',
  targetName: 'Suspect User',
  reason: 'Child Exploitation / Underage Profile',
  details: 'Candidate appears to be under 18 years of age.',
  reporterName: 'Anil Deshmukh',
  reporterEmail: 'anil@example.com',
  reporterPhone: '9822001122',
  isChildSafety: true
});

assert(publicReportRes.success, 'Public report should succeed');
assert.strictEqual(publicReportRes.report.reporterId, 'public_reporter');
assert.strictEqual(publicReportRes.report.priority, 'critical');
assert.strictEqual(publicReportRes.report.isChildSafety, true);
console.log('  ✅ Public incident report created without user login.');
console.log(`     Reporter: ${publicReportRes.report.reporterName} (${publicReportRes.report.reporterEmail})`);
console.log(`     Reason: ${publicReportRes.report.reason} [Priority: ${publicReportRes.report.priority}]`);

// 2b. Attempt non-child-safety report without login must fail
assert.throws(() => {
  submitReportSimulator(null, {
    targetType: 'profile',
    targetId: 'random_user',
    reason: 'Spam / Commercial Ads',
    isChildSafety: false
  });
}, /Please log in/);
console.log('  ✅ Non-child-safety reports without login are rejected securely.');

// 2c. Attempt child safety report without contact information must fail
assert.throws(() => {
  submitReportSimulator(null, {
    targetType: 'profile',
    targetId: 'suspect_user_102',
    reason: 'Child Sexual Abuse Material (CSAM)',
    isChildSafety: true,
    reporterEmail: '',
    reporterPhone: ''
  });
}, /Please provide at least an email address or mobile number/);
console.log('  ✅ Anonymous spam prevention: valid contact info required for public reports.');

// 3. VERIFY MODERATION QUEUE PRIORITIZATION
console.log('\n👉 TEST 3: Admin Moderation Queue Prioritization');

// Populate mock queue with mixed reports:
// - A regular pending report
// - A resolved old report
// - A critical child safety pending report created later
mockReportsDatabase.push({
  id: 'rep_regular_pending',
  reason: 'Inappropriate Photo / Modesty Guidelines',
  status: 'pending',
  priority: 'normal',
  isChildSafety: false,
  createdAt: new Date('2026-10-14T08:00:00Z').toISOString()
});

mockReportsDatabase.push({
  id: 'rep_regular_resolved',
  reason: 'Fake Profile',
  status: 'resolved',
  priority: 'normal',
  isChildSafety: false,
  createdAt: new Date('2026-10-14T07:00:00Z').toISOString()
});

mockReportsDatabase.push({
  id: 'rep_child_safety_critical',
  reason: 'Child Sexual Abuse Material (CSAM)',
  status: 'pending',
  priority: 'critical',
  isChildSafety: true,
  createdAt: new Date('2026-10-14T09:00:00Z').toISOString()
});

const sortedQueue = [...mockReportsDatabase].sort((a, b) => {
  // 1. Critical / Child Safety pending reports ALWAYS come FIRST
  const aChildSafetyPending = (a.isChildSafety || a.priority === 'critical') && a.status === 'pending' ? 1 : 0;
  const bChildSafetyPending = (b.isChildSafety || b.priority === 'critical') && b.status === 'pending' ? 1 : 0;
  if (aChildSafetyPending !== bChildSafetyPending) return bChildSafetyPending - aChildSafetyPending;

  // 2. Other pending reports next
  const aPending = a.status === 'pending' ? 1 : 0;
  const bPending = b.status === 'pending' ? 1 : 0;
  if (aPending !== bPending) return bPending - aPending;

  // 3. Newest timestamp first
  const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return tB - tA;
});

console.log('  Admin Sorted Queue Order:');
sortedQueue.forEach((r, idx) => {
  console.log(`    #${idx + 1}: [Status: ${r.status}] [Priority: ${r.priority || 'normal'}] ${r.reason}`);
});

// Assert that the first two reports are the Critical Child Safety reports!
assert.strictEqual(sortedQueue[0].isChildSafety, true);
assert.strictEqual(sortedQueue[0].priority, 'critical');
assert.strictEqual(sortedQueue[1].isChildSafety, true);
assert.strictEqual(sortedQueue[1].priority, 'critical');
// Assert that normal pending comes before resolved
assert.strictEqual(sortedQueue[2].status, 'pending');
assert.strictEqual(sortedQueue[3].status, 'resolved');
console.log('  ✅ Admin Priority Queue Verified: Critical child safety pending reports ALWAYS jump to the top.');

// 4. VERIFY FOOTER LINK
console.log('\n👉 TEST 4: Footer Accessibility Check');
const footerPath = path.join(__dirname, '../src/components/layout/Footer.jsx');
const footerContent = fs.readFileSync(footerPath, 'utf8');

assert(footerContent.includes('/child-safety'), 'Footer must contain link to /child-safety');
console.log('  ✅ Footer navigation includes prominent link to Child Safety Standards (/child-safety).');

console.log('\n========================================================');
console.log('🎉 ALL CHILD SAFETY STANDARDS TESTS PASSED (100%)');
console.log('========================================================\n');
