import { spawn } from 'child_process';
import { rm } from 'fs/promises';
import path from 'path';

const colors = {
  reset: '\u001b[0m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  cyan: '\u001b[36m',
  bold: '\u001b[1m'
};

const tempBuildDir = path.resolve(process.cwd(), 'dist-prepush');

const steps = [
  { name: 'Linting', command: 'npm', args: ['run', 'lint'], fix: 'npm run lint --fix' },
  { name: 'Type Checking', command: 'npm', args: ['run', 'typecheck'], fix: 'Check TypeScript errors in your IDE' },
  { name: 'Production Build', command: 'npm', args: ['run', 'build:check'], fix: 'Check build errors' },
];

async function isServerRunning() {
  try {
    const res = await fetch('http://localhost:5173', { method: 'GET' });
    const text = await res.text();
    return res.ok && text.includes('<script');
  } catch {
    return false;
  }
}

async function runStep(step) {
  if (step.requireServer) {
    const alive = await isServerRunning();
    if (!alive) {
      console.log(`${colors.yellow}Skipping ${step.name} because server is not running at http://localhost:5173${colors.reset}`);
      console.log(`${colors.yellow}Run "npm run dev" in another terminal to include this check.${colors.reset}\n`);
      return true;
    }
  }

  console.log(`${colors.cyan}${colors.bold}Running ${step.name}...${colors.reset}`);

  return new Promise((resolve) => {
    const fullCommand = `${step.command} ${step.args.join(' ')}`;
    const process = spawn(fullCommand, { stdio: 'inherit', shell: true });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}${step.name} passed!${colors.reset}\n`);
        resolve(true);
      } else {
        console.log(`${colors.red}${step.name} failed!${colors.reset}`);
        console.log(`${colors.yellow}Fix suggestion: ${step.fix}${colors.reset}\n`);
        resolve(false);
      }
    });
  });
}

async function main() {
  console.log(`${colors.bold}Starting DaNangTrip Quality Gate...${colors.reset}\n`);

  try {
    for (const step of steps) {
      const success = await runStep(step);
      if (!success) {
        console.log(`${colors.red}${colors.bold}Quality Gate failed. Please fix the issues before pushing.${colors.reset}`);
        process.exit(1);
      }
    }

    console.log(`${colors.green}${colors.bold}All checks passed! Ready to push.${colors.reset}`);
    process.exit(0);
  } finally {
    await rm(tempBuildDir, { recursive: true, force: true });
  }
}

main();
