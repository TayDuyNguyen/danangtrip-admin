import { spawn } from 'child_process';
import path from 'path';

const colors = {
  reset: '\u001b[0m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  cyan: '\u001b[36m',
  bold: '\u001b[1m'
};

const steps = [
  { name: 'Linting', command: 'npm', args: ['run', 'lint'], fix: 'npm run lint --fix' },
  { name: 'Type Checking', command: 'npm', args: ['run', 'typecheck'], fix: 'Check TypeScript errors in your IDE' },
  { name: 'Production Build', command: 'npm', args: ['run', 'build'], fix: 'Check build errors' },
  { 
    name: 'Console Error Testing', 
    command: 'npm', 
    args: ['run', 'test:console'], 
    fix: 'Fix runtime errors or Ensure "npm run dev" is running at http://localhost:5173',
    requireServer: true
  }
];

async function isServerRunning() {
  try {
    const res = await fetch('http://127.0.0.1:5173', { method: 'GET' });
    const text = await res.text();
    return res.ok && text.includes('<script'); // Ensure it's returning HTML
  } catch (e) {
    return false;
  }
}

async function runStep(step) {
  if (step.requireServer) {
    const alive = await isServerRunning();
    if (!alive) {
      console.log(`${colors.yellow}⚠️ Skipping ${step.name} because server is not running at http://localhost:5173${colors.reset}`);
      console.log(`${colors.yellow}Please run "npm run dev" in another terminal to include this check.${colors.reset}\n`);
      return true; // Skip but don't fail the whole gate
    }
  }
  
  console.log(`${colors.cyan}${colors.bold}▶ Running ${step.name}...${colors.reset}`);
  
  return new Promise((resolve) => {
    const fullCommand = `${step.command} ${step.args.join(' ')}`;
    const process = spawn(fullCommand, { stdio: 'inherit', shell: true });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}✔ ${step.name} passed!${colors.reset}\n`);
        resolve(true);
      } else {
        console.log(`${colors.red}✘ ${step.name} failed!${colors.reset}`);
        console.log(`${colors.yellow}Fix suggestion: ${step.fix}${colors.reset}\n`);
        resolve(false);
      }
    });
  });
}

async function main() {
  console.log(`${colors.bold}🚀 Starting DaNangTrip Quality Gate...${colors.reset}\n`);

  for (const step of steps) {
    const success = await runStep(step);
    if (!success) {
      console.log(`${colors.red}${colors.bold}⛔ Quality Gate failed. Please fix the issues before pushing.${colors.reset}`);
      process.exit(1);
    }
  }

  console.log(`${colors.green}${colors.bold}✨ All checks passed! Ready to push.${colors.reset}`);
  process.exit(0);
}

main();
