const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Ma'lumotlar bazasi ulanishi
const db = new sqlite3.Database('./gas_monitoring.db', (err) => {
  if (err) {
    console.error('Bazaga ulanish xatosi:', err.message);
  } else {
    console.log('SQLite ma’lumotlar bazasiga ulanish muvaffaqiyatli.');
  }
});

// Jadval yaratish (agar mavjud bo'lmasa)
db.run(`
  CREATE TABLE IF NOT EXISTS gas_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gas_value INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// JSON va URL kodlangan ma'lumotlar uchun middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API ma'lumotlarini qabul qilish
app.post('/api/sensordata', (req, res) => {
  const { api_key, gas_value } = req.body;

  if (api_key !== process.env.API_KEY) {
    return res.status(403).send('Xato: Noto\'g\'ri API kaliti.');
  }

  const query = 'INSERT INTO gas_data (gas_value) VALUES (?)';
  db.run(query, [gas_value], (err) => {
    if (err) {
      return res.status(500).send('Bazaga yozish xatosi.');
    }
    res.status(200).send('Gaz ma\'lumotlari muvaffaqiyatli saqlandi.');
  });
});

// Gaz ma'lumotlarini ko'rish uchun API
app.get('/api/gasdata', (req, res) => {
  const query = 'SELECT * FROM gas_data ORDER BY timestamp DESC LIMIT 10';
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).send('Ma’lumotlarni olish xatosi.');
    }
    res.json(rows);
  });
});

// Web interfeys uchun statik HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Serverni ishga tushirish
app.listen(port, () => {
  console.log(`Server http://localhost:${port} da ishga tushdi`);
});
