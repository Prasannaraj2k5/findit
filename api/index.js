import app, { initDB } from '../server/app.js';

// Initialize DB connection on cold start
const dbReady = initDB();

export default async function handler(req, res) {
  await dbReady;
  return app(req, res);
}
