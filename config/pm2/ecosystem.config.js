module.exports = {
  apps: [
    {
      name: 'acp-backend-dev',
      cwd: '../../backend',
      script: 'node',
      args: 'dist/main.js',
      watch: ['dist'],
      env: {
        NODE_ENV: 'development',
        BACKEND_PORT: 3001,
      },
    },
  ],
};
