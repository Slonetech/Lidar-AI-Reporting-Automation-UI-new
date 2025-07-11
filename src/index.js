require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const reportRoutes = require('./routes/reportRoutes');
const memberRoutes = require('./routes/memberRoutes');


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/reports', reportRoutes);
app.use('/api/members', memberRoutes);

app.get('/', (req, res) => res.send('Backend Running '));

const PORT = process.env.PORT || 5000;
sequelize.authenticate()
  .then(() => {
    console.log('MySQL connected successfully');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });
