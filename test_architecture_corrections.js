import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.join(__dirname, 'backend');

try {
  console.log('Executing Master Architecture Verification Test Suite from backend directory...');
  execSync('node test_architecture_corrections.js', { cwd: backendDir, stdio: 'inherit' });
} catch (err) {
  process.exit(1);
}
