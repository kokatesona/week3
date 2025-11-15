// GA trigger Test 

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./src/routes/auth');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS for cookies
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// ---- DB connect helper (used by start() and optionally by tests) ----
async function connectDB() {
  const uri =
    process.env.MONGODB_URL ||
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/labdb';

  try {
    await mongoose.connect(uri);
    console.log('Database connected');
  } catch (err) {
    console.error('DB connection error:', err);
    if (process.env.NODE_ENV !== 'test') process.exit(1);
    else throw err;
  }
}

// Routes
app.use('/api/auth', authRoutes);

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Server error' });
});

// ---- Controlled startup (don’t listen during tests) ----
const PORT = process.env.PORT || 8000;
let server = null;

async function start() {
  if (!mongoose.connection.readyState) {
    await connectDB();
  }
  server = app.listen(PORT, () => console.log(`Server running on :${PORT}`));
  return server;
}

// Auto-start only when run directly (node server.js) AND not in tests
if (require.main === module && process.env.NODE_ENV !== 'test') {
  start();
}

module.exports = { app, start };
