module.exports = {
  apps: [{
    name: 'teacherly-frontend',
    script: './build_and_start.sh',
    env: {
      PORT: 3001,
      NODE_ENV: 'production'
    },
    cwd: '/home/deployuser/projects/teacherly/teacherly-ai',
    error_file: '/home/deployuser/logs/teacherly/frontend-error.log',
    out_file: '/home/deployuser/logs/teacherly/frontend-out.log',
  }]
};
