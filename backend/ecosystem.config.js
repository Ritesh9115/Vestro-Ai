module.exports = {
  apps: [
    {
      name: 'vestro-api',
      script: 'app.js',
      cwd: '/opt/vestro/backend',
      instances: 'max',       // One process per CPU core
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Zero-downtime restart
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000,
      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/vestro/error.log',
      out_file: '/var/log/vestro/out.log',
      merge_logs: true,
      // Auto-restart on OOM
      max_memory_restart: '512M',
      // Restart policy
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
