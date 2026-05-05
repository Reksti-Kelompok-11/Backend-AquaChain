require('dotenv').config();
const app = require('./src/app');

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`AquaChain API running on port ${PORT}`);
  });
}

module.exports = app;
