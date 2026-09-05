import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';

const startServer = async () => {
  try {
    // Initialize database connection
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      console.log(`========================================`);
      console.log(`🚀 Server running in ${env.NODE_ENV} mode`);
      console.log(`📡 Listening on http://localhost:${env.PORT}`);
      console.log(`🩺 Health check: http://localhost:${env.PORT}/api/v1/health`);
      console.log(`========================================`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Closing HTTP server and database connections...`);
      server.close(async () => {
        try {
          await disconnectDatabase();
          console.log('HTTP server and database connections closed gracefully.');
          process.exit(0);
        } catch (error) {
          console.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force exit after 10 seconds if still open
      setTimeout(() => {
        console.error('Forcefully terminating process due to shutdown timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
