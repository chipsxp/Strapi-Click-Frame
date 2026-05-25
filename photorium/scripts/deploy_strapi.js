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
  console.log('STDOUT:', output);
  
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
});

child.stderr.on('data', (data) => {
  // Log any errors or secondary output from the CLI
  console.error('STDERR:', data.toString());
});

child.on('close', (code) => {
  console.log(`Child process exited with code ${code}`);
});