const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/scores', require('./routes/scores'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
