require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Usage = require('./models/Usage');

const TOOLS = ['summarize', 'paraphrase', 'generate'];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seed = async () => {
  await connectDB();

  await Promise.all([User.deleteMany({}), Usage.deleteMany({})]);

  const user = await User.create({
    name: 'Demo User',
    email: 'demo@nexus.ai',
    password: 'demo1234',
  });

  // Spread some usage across the last 14 days so the dashboard charts populate.
  const docs = [];
  for (let d = 0; d < 14; d += 1) {
    const day = new Date();
    day.setHours(rand(8, 20), rand(0, 59), 0, 0);
    day.setDate(day.getDate() - d);
    const count = rand(0, 6);
    for (let i = 0; i < count; i += 1) {
      docs.push({
        user: user._id,
        tool: TOOLS[rand(0, TOOLS.length - 1)],
        model: 'seed',
        inputChars: rand(200, 1200),
        outputChars: rand(120, 600),
        ms: rand(400, 3000),
        createdAt: new Date(day),
      });
    }
  }
  if (docs.length) await Usage.insertMany(docs);

  // eslint-disable-next-line no-console
  console.log('Seeded demo account → demo@nexus.ai / demo1234');
  // eslint-disable-next-line no-console
  console.log(`Inserted ${docs.length} usage rows.`);

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
