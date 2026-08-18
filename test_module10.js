import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.join(__dirname, 'backend');

try {
  console.log('Executing Module 10 Test Suite from backend directory...');
  execSync('node test_module10.js', { cwd: backendDir, stdio: 'inherit' });
} catch (err) {
  process.exit(1);
}
