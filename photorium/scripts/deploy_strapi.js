const { spawn } = require('child_process');
const path = require('path');

// Run from the photorium root directory (one level up from this script)
const child = spawn('npx', ['strapi', 'deploy'], {
  cwd: path.join(__dirname, '..'), 
  shell: true,
  stdio: ['pipe', 'pipe', 'pipe']
});

child.stdout.on('data', (data) => {
  const output = data.toString();
  
  // Log the output so we can see what the CLI is asking
  process.stdout.write('STDOUT: ' + output);
  
  // 0. Handle Login prompt
  if (output.includes('Would you like to login?')) {
    child.stdin.write('y\n');
  }

  // 1. Handle the Project Name prompt
  if (output.includes('How would you like to name your project?')) {
    child.stdin.write('photorium\n');
  }
  
  // 2. Handle the Node.js version prompt (Press Enter to accept default)
  if (output.includes('Choose your NodeJS version')) {
    child.stdin.write('\n'); 
  }

  // 3. Handle the Region prompt (Press Enter to accept default)
  if (output.includes('Choose a region for your project')) {
    child.stdin.write('\n'); 
  }

  // 4. Handle the Data Loss/Overwrite warning confirmation
  if (output.includes('Do you want to proceed with deployment')) {
    child.stdin.write('y\n');
  }

  // 5. Handle generic "Press any key to continue" or similar
  if (output.includes('Press Enter to open the browser')) {
    child.stdin.write('\n');
  }
});

child.stderr.on('data', (data) => {
  const output = data.toString();
  process.stderr.write('STDERR: ' + output);
});

child.on('close', (code) => {
  console.log(`Child process exited with code ${code}`);
});