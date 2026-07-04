require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const suppliersRouter = require('./routes/suppliers');
const materialsRouter = require('./routes/materials');
const bookingsRouter = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/suppliers', suppliersRouter);
app.use('/api/materials', materialsRouter);
app.use('/api/bookings', bookingsRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => console.log(`Supply Buddy API running on port ${PORT}`));
