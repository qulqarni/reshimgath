/**
 * Test Suite: Reporting, Blocking, and Moderation Verification
 * Validates:
 * 1. Member profile, photo, and private message reporting.
 * 2. Admin moderation actions (Inspection, Warn, Remove Content, Suspend Account, Resolve, Dismiss).
 * 3. User block / unblock workflow and enforcement across messaging, profile visits, interests, and notifications.
 */

const assert = require('assert');

console.log('====================================================');
console.log('🧪 RUNNING MODERATION & BLOCKING SYSTEM TEST SUITE');
console.log('====================================================\n');

// Mock Data
let mockProfiles = [
  {
    id: 'user_a',
    name: 'Rohan Patil',
    email: 'rohan@example.com',
    phone: '9876543210',
    verified: true,
    blocked: false,
    blockedUsers: [],
    avatar: 'https://example.com/rohan_avatar.jpg',
    photos: ['https://example.com/rohan_avatar.jpg', 'https://example.com/rohan_gallery.jpg']
  },
  {
    id: 'user_b',
    name: 'Pooja Kulkarni',
    email: 'pooja@example.com',
    phone: '9876543211',
    verified: true,
    blocked: false,
    blockedUsers: [],
    avatar: 'https://example.com/pooja_avatar.jpg',
    photos: ['https://example.com/pooja_avatar.jpg', 'https://example.com/pooja_violating_photo.jpg']
  }
];

let mockChats = {
  'user_a_user_b': [
    {
      id: 1710001,
      senderId: 'user_b',
      text: 'Hello Rohan, let us connect.',
      createdAt: new Date().toISOString(),
      status: 'delivered'
    },
    {
      id: 1710002,
      senderId: 'user_b',
      text: 'Offensive or spam message content here.',
      createdAt: new Date().toISOString(),
      status: 'delivered'
    }
  ]
};

let mockReports = [];
let mockNotifications = [];

// 1. REPORT CREATION FLOW
console.log('👉 TEST 1: User Reporting (Profiles, Photos, Messages)');

function submitReport(reporter, reportData) {
  assert(reporter && reporter.id, 'Reporter must be logged in');
  assert(reportData.targetId, 'Target ID is required');
  assert(reportData.reason, 'Reason is required');
  assert(['profile', 'photo', 'message'].includes(reportData.targetType), 'Valid target type required');

  const report = {
    id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    reporterId: reporter.id,
    reporterName: reporter.name,
    reporterEmail: reporter.email,
    reporterPhone: reporter.phone,
    targetType: reportData.targetType,
    targetId: reportData.targetId,
    targetName: reportData.targetName,
    reason: reportData.reason,
    details: reportData.details || '',
    evidencePhotoUrl: reportData.evidencePhotoUrl || null,
    evidenceText: reportData.evidenceText || null,
    messageId: reportData.messageId || null,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  mockReports.push(report);
  return { success: true, report };
}

// 1a. User A reports User B's profile
const profileReportRes = submitReport(mockProfiles[0], {
  targetType: 'profile',
  targetId: 'user_b',
  targetName: 'Pooja Kulkarni',
  reason: 'Fake Profile / Impersonation',
  details: 'Information provided does not appear genuine.'
});
assert(profileReportRes.success);
console.log('  ✅ Profile report submitted successfully.');

// 1b. User A reports User B's photo
const photoReportRes = submitReport(mockProfiles[0], {
  targetType: 'photo',
  targetId: 'user_b',
  targetName: 'Pooja Kulkarni',
  reason: 'Inappropriate Photo / Nudity',
  details: 'Photo violates community modesty guidelines.',
  evidencePhotoUrl: 'https://example.com/pooja_violating_photo.jpg'
});
assert(photoReportRes.success);
console.log('  ✅ Photo report with evidence attached submitted successfully.');

// 1c. User A reports User B's message
const msgReportRes = submitReport(mockProfiles[0], {
  targetType: 'message',
  targetId: 'user_b',
  targetName: 'Pooja Kulkarni',
  reason: 'Harassment / Abusive Language',
  details: 'Used abusive language in direct chat.',
  evidenceText: 'Offensive or spam message content here.',
  messageId: '1710002'
});
assert(msgReportRes.success);
console.log('  ✅ Message report with quoted text evidence submitted successfully.');
assert.strictEqual(mockReports.length, 3);
console.log(`  Total reports created: ${mockReports.length}\n`);

// 2. ADMIN MODERATION & RESOLUTION
console.log('👉 TEST 2: Admin Reports Inspection & Resolution');

// 2a. Check pending sort order
mockReports.push({
  id: 'report_old_resolved',
  targetId: 'user_x',
  reason: 'Test',
  status: 'resolved',
  createdAt: new Date(Date.now() - 100000).toISOString()
});

const sortedReports = [...mockReports].sort((a, b) => {
  const aPending = a.status === 'pending' ? 1 : 0;
  const bPending = b.status === 'pending' ? 1 : 0;
  if (aPending !== bPending) return bPending - aPending;
  return new Date(b.createdAt) - new Date(a.createdAt);
});

assert.strictEqual(sortedReports[0].status, 'pending');
assert.strictEqual(sortedReports[1].status, 'pending');
assert.strictEqual(sortedReports[2].status, 'pending');
assert.strictEqual(sortedReports[3].status, 'resolved');
console.log('  ✅ Admin sorting: Pending reports strictly appear first before resolved reports.');

// 2b. Admin issues formal warning to User B
function warnUser(targetUserId, warningMessage, reportId) {
  const warnNotif = {
    id: `warn_${Date.now()}`,
    type: 'admin_warning',
    title: 'Official Bureau Warning / ताकीद ⚠️',
    text: warningMessage,
    targetUserId,
    createdAt: new Date().toISOString(),
    unread: true
  };
  mockNotifications.push(warnNotif);

  // Update report
  const rep = mockReports.find(r => r.id === reportId);
  if (rep) {
    rep.status = 'resolved';
    rep.actionTaken = 'warned';
    rep.adminNotes = `Issued formal warning: "${warningMessage}"`;
    rep.resolvedAt = new Date().toISOString();
    rep.resolvedBy = 'admin@sambodhisarang.com';
  }
}

warnUser('user_b', 'Official warning regarding violation of guidelines.', profileReportRes.report.id);
assert.strictEqual(mockNotifications.length, 1);
assert.strictEqual(mockNotifications[0].targetUserId, 'user_b');
assert.strictEqual(profileReportRes.report.status, 'resolved');
assert.strictEqual(profileReportRes.report.actionTaken, 'warned');
console.log('  ✅ Admin "Warn Member": Official bureau warning notification sent, report marked resolved.');

// 2c. Admin removes violating photo
function removeViolatingPhoto(targetUserId, photoUrl, reportId) {
  const target = mockProfiles.find(p => p.id === targetUserId);
  assert(target);
  target.photos = target.photos.filter(p => p !== photoUrl);
  if (target.avatar === photoUrl) {
    target.avatar = target.photos[0] || null;
  }
  const rep = mockReports.find(r => r.id === reportId);
  if (rep) {
    rep.status = 'resolved';
    rep.actionTaken = 'content_removed';
    rep.adminNotes = 'Violating photo removed from profile.';
    rep.resolvedAt = new Date().toISOString();
    rep.resolvedBy = 'admin@sambodhisarang.com';
  }
}

removeViolatingPhoto('user_b', 'https://example.com/pooja_violating_photo.jpg', photoReportRes.report.id);
const pooja = mockProfiles.find(p => p.id === 'user_b');
assert(!pooja.photos.includes('https://example.com/pooja_violating_photo.jpg'));
assert.strictEqual(photoReportRes.report.status, 'resolved');
assert.strictEqual(photoReportRes.report.actionTaken, 'content_removed');
console.log('  ✅ Admin "Remove Content (Photo)": Photo safely excised from candidate profile, report resolved.');

// 2d. Admin removes violating message
function removeViolatingMessage(chatId, messageId, reportId) {
  assert(mockChats[chatId]);
  mockChats[chatId] = mockChats[chatId].filter(m => String(m.id) !== String(messageId));
  const rep = mockReports.find(r => r.id === reportId);
  if (rep) {
    rep.status = 'resolved';
    rep.actionTaken = 'content_removed';
    rep.adminNotes = 'Offensive message deleted from conversation.';
    rep.resolvedAt = new Date().toISOString();
    rep.resolvedBy = 'admin@sambodhisarang.com';
  }
}

removeViolatingMessage('user_a_user_b', '1710002', msgReportRes.report.id);
assert.strictEqual(mockChats['user_a_user_b'].length, 1);
assert.strictEqual(mockChats['user_a_user_b'][0].id, 1710001);
assert.strictEqual(msgReportRes.report.status, 'resolved');
console.log('  ✅ Admin "Remove Content (Message)": Message excised from thread, report resolved.');

// 2e. Admin suspends account
function toggleBlockProfile(targetUserId) {
  const target = mockProfiles.find(p => p.id === targetUserId);
  target.blocked = !target.blocked;
  return target.blocked;
}

const isSuspended = toggleBlockProfile('user_b');
assert.strictEqual(isSuspended, true);
assert.strictEqual(mockProfiles.find(p => p.id === 'user_b').blocked, true);
console.log('  ✅ Admin "Suspend Account": Offending account marked suspended (blocked: true).');

// 2f. Admin dismisses unfounded report
const unfoundedReport = submitReport(mockProfiles[0], {
  targetType: 'profile',
  targetId: 'user_b',
  reason: 'Other',
  details: 'No real violation.'
}).report;

function dismissReport(reportId, notes) {
  const rep = mockReports.find(r => r.id === reportId);
  rep.status = 'dismissed';
  rep.actionTaken = 'dismissed';
  rep.adminNotes = notes;
  rep.resolvedAt = new Date().toISOString();
  rep.resolvedBy = 'admin@sambodhisarang.com';
}

dismissReport(unfoundedReport.id, 'Reviewed profile details; no violation found.');
assert.strictEqual(unfoundedReport.status, 'dismissed');
console.log('  ✅ Admin "Dismiss Report": Recorded dismissal and audit note.\n');

// 3. USER BLOCKING & UNBLOCKING ENFORCEMENT
console.log('👉 TEST 3: User Block / Unblock Workflow & Enforcement');

// Reset User B un-suspended for peer-to-peer block testing
mockProfiles.find(p => p.id === 'user_b').blocked = false;

function blockUser(blockerId, targetId) {
  const blocker = mockProfiles.find(p => p.id === blockerId);
  assert(blocker);
  if (!blocker.blockedUsers.includes(targetId)) {
    blocker.blockedUsers.push(targetId);
  }
}

function unblockUser(blockerId, targetId) {
  const blocker = mockProfiles.find(p => p.id === blockerId);
  assert(blocker);
  blocker.blockedUsers = blocker.blockedUsers.filter(id => id !== targetId);
}

function isCommunicationBlocked(userAId, userBId) {
  const userA = mockProfiles.find(p => p.id === userAId);
  const userB = mockProfiles.find(p => p.id === userBId);
  if (!userA || !userB) return false;
  if (userA.blocked || userB.blocked) return true;
  const aBlockedB = (userA.blockedUsers || []).includes(userBId);
  const bBlockedA = (userB.blockedUsers || []).includes(userAId);
  return aBlockedB || bBlockedA;
}

// User A blocks User B
blockUser('user_a', 'user_b');
assert(mockProfiles.find(p => p.id === 'user_a').blockedUsers.includes('user_b'));
assert(isCommunicationBlocked('user_a', 'user_b'));
assert(isCommunicationBlocked('user_b', 'user_a'));
console.log('  ✅ User A blocked User B successfully.');

// Test messaging enforcement
function canSendMessage(senderId, recipientId) {
  if (isCommunicationBlocked(senderId, recipientId)) {
    return { allowed: false, error: 'Communication blocked between users.' };
  }
  return { allowed: true };
}

assert.strictEqual(canSendMessage('user_a', 'user_b').allowed, false);
assert.strictEqual(canSendMessage('user_b', 'user_a').allowed, false);
console.log('  ✅ Messaging blocked bidirectionally when block is in effect.');

// Test profile visit notification enforcement
function recordProfileViewNotification(visitorId, targetOwnerId) {
  if (visitorId === targetOwnerId) return false;
  if (isCommunicationBlocked(visitorId, targetOwnerId)) {
    return false; // Skip creating visit notification
  }
  return true;
}

assert.strictEqual(recordProfileViewNotification('user_a', 'user_b'), false);
assert.strictEqual(recordProfileViewNotification('user_b', 'user_a'), false);
console.log('  ✅ Profile visit notifications suppressed between blocked users.');

// Test unblock functionality
unblockUser('user_a', 'user_b');
assert(!mockProfiles.find(p => p.id === 'user_a').blockedUsers.includes('user_b'));
assert(!isCommunicationBlocked('user_a', 'user_b'));
assert.strictEqual(canSendMessage('user_a', 'user_b').allowed, true);
console.log('  ✅ Unblock restored communication and messaging successfully.');

console.log('\n====================================================');
console.log('🎉 ALL MODERATION & BLOCKING TESTS PASSED (100%)');
console.log('====================================================\n');
