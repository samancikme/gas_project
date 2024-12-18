const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./gas_monitoring.db', (err) => {
  if (err) {
    console.error('Ma’lumotlar bazasiga ulanishda xatolik:', err.message);
  } else {
    console.log('Ma’lumotlar bazasiga ulanish muvaffaqiyatli.');
  }
});

module.exports = db;
