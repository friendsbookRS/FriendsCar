const { Low, JSONFile } = require('lowdb');
const path = require('path');
const fs = require('fs');

const dbFile = path.join(__dirname, '..', 'db', 'db.json');
async function getDb() {
  const adapter = new JSONFile(dbFile);
  const db = new Low(adapter);
  await db.read();
  db.data = db.data || { rides: [], drivers: [] };
  await db.write();
  return db;
}

module.exports = { getDb };
