require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const blockchainService = require('./services/blockchainService');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const auditorRoutes = require('./routes/auditorRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');

const app = express();
app.use(cors({ origin: true, credentials: true })); // Allow all origins for hackathon
app.use(express.json());
app.use('/uploads', express.static('src/uploads'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, mongo: Boolean(process.env.MONGODB_URI), blockchain: blockchainService.isConfigured() });
});

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/audit', auditorRoutes);
app.use('/api/market', marketplaceRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ msg: 'Unhandled server error', err: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

