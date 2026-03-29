import app, { initDB } from '../server/app.js';

// Initialize DB connection (cached across warm invocations)
await initDB();

export default app;
