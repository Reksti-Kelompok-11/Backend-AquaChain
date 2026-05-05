const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const telemetryRoutes  = require('./routes/telemetry');
const feederRoutes     = require('./routes/feeder');
const pondsRoutes      = require('./routes/ponds');
const blockchainRoutes = require('./routes/blockchain');
const errorHandler     = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/telemetry',  telemetryRoutes);
app.use('/api/feeder',     feederRoutes);
app.use('/api/ponds',      pondsRoutes);
app.use('/api/blockchain', blockchainRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'AquaChain API' });
});

app.use(errorHandler);

module.exports = app;
