const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const dir = process.cwd();

async function run() {
  console.log('Initializing git repository...');
  await git.init({ fs, dir });

  console.log('Adding files...');
  // Read all files recursively, excluding node_modules and .git
  const walk = (dirPath) => {
    let results = [];
    const list = fs.readdirSync(dirPath);
    list.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      const relativePath = path.relative(dir, fullPath).replace(/\\/g, '/');
      if (relativePath.startsWith('node_modules') || relativePath.startsWith('.git') || relativePath.startsWith('android/app/build')) return;
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(fullPath));
      } else {
        results.push(relativePath);
      }
    });
    return results;
  };

  const files = walk(dir);
  for (const file of files) {
    try {
      await git.add({ fs, dir, filepath: file });
    } catch (e) {
      console.error('Skipped', file);
    }
  }

  console.log('Committing...');
  await git.commit({
    fs,
    dir,
    author: {
      name: 'Sunrise Shift',
      email: 'bot@sunriseshift.com',
    },
    message: 'chore: release v1.0 - Sunrise Shift\n\n- Perfected baseline UI\n- Fixed keyboard layout issues\n- Migrated to Capacitor Preferences\n- Debounced preference saves\n- Implemented mock cloud sync flow\n- Locked background dimensions for immersion',
  });

  console.log('Done!');
}

run().catch(console.error);
