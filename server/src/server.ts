import app from './app.js';
import { ENV } from './config/env.js';

const PORT = parseInt(ENV.PORT, 10) || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Project & Team Management Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${ENV.NODE_ENV}`);
  console.log(`🔗 Database: ${ENV.DATABASE_URL}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
