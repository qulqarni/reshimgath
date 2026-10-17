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
  'signup'
];

const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

routes.forEach((route) => {
  const targetDir = path.join(distDir, route);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const targetFile = path.join(targetDir, 'index.html');
  fs.writeFileSync(targetFile, indexContent, 'utf8');
  console.log(`✓ Created static fallback: dist/${route}/index.html`);
});

console.log('✅ All direct static route fallbacks created successfully.');
