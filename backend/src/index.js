require('dotenv').config();
const app = require('./app');
const { initDB } = require('./config/prisma');

const PORT = process.env.PORT || 5000;

// Initialize DB and start server
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
