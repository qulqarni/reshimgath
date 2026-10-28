import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '../dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('dist/index.html not found! Run vite build first.');
  process.exit(1);
}

const routes = [
  'admin',
  'dashboard',
  'my-profile',
  'edit-profile',
  'profile-setup',
  'interests',
  'messages',
  'notifications',
  'settings',
  'blocked-users',
  'child-safety-standards',
  'child-safety',
  'safety-standards',
  'delete-account',
  'data-deletion',
  'account-deletion',
  'privacy-policy',
  'privacy',
  'terms-of-service',
  'terms',
  'about',
  'contact',
  'login',
  'signup',
  'forgot-password',
  'reset-password',
  'stories',
  'success-stories',
  'feedbacks',
  'feedback',
  'testimonials',
  'events',
  'upcoming-events',
  'melawa',
  'gallery',
  'photos',
  'videos',
  'subscription',
  'plans',
  'pricing',
  'memberships'
];

const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

routes.forEach((route) => {
  const targetDir = path.join(distDir, route);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const targetIndex = path.join(targetDir, 'index.html');
  fs.writeFileSync(targetIndex, indexContent, 'utf8');

  // Also write route.html for static servers that look for clean URLs without folder index
  const targetFile = path.join(distDir, `${route}.html`);
  fs.writeFileSync(targetFile, indexContent, 'utf8');

  console.log(`✓ Created static fallback: dist/${route}/index.html & dist/${route}.html`);
});

console.log('✅ All direct static route fallbacks created successfully.');
