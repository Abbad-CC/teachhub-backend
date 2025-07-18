import app from './app';
import { sequelize } from './models';

const PORT = process.env.PORT || 5000;

console.log('🔍 Starting server.ts...');
console.log('🔍 PORT:', PORT);
// console.log('🔍 NODE_ENV:', process.env.NODE_ENV);

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('🛠 Database synced');
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log('🔍 Server is actually listening and ready for requests');
    });

    // Add error handling for the server
    server.on('error', (err) => {
      console.error('❌ Server error:', err);
    });

    // Log when server closes
    server.on('close', () => {
      console.log('⚠️ Server closed');
    });

  })
  .catch((err) => {
    console.error('❌ Failed to sync DB or start server:', err);
  });