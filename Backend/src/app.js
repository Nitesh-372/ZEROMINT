require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const auditorRoutes = require('./routes/auditorRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('src/uploads')); // serve uploaded files
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/audit', auditorRoutes);
app.use('/api/market', marketplaceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server running on ${PORT}`));
