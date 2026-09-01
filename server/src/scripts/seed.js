import 'dotenv/config';
import mongoose from 'mongoose';
import { validateConfig } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Lead } from '../models/Lead.js';
import { Customer } from '../models/Customer.js';
import { Activity } from '../models/Activity.js';

validateConfig();

const seedUser = async ({ name, email, password, role }) => {
  let user = await User.findOne({ email }).select('+password');
  if (!user) user = new User({ email });
  Object.assign(user, { name, password, role, isActive: true });
  await user.save();
  return user;
};

const run = async () => {
  await connectDB();

  const admin = await seedUser({
    name: 'Demo Admin',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@crm.local',
    password: process.env.SEED_ADMIN_PASSWORD || 'AdminDemo123!',
    role: 'admin'
  });
  const sales = await seedUser({
    name: 'Demo Sales',
    email: process.env.SEED_SALES_EMAIL || 'sales@crm.local',
    password: process.env.SEED_SALES_PASSWORD || 'SalesDemo123!',
    role: 'sales'
  });

  const lead = await Lead.findOneAndUpdate(
    { email: 'jordan.lee@example.com' },
    {
      name: 'Jordan Lee',
      email: 'jordan.lee@example.com',
      company: 'Northstar Labs',
      phone: '+1 555 010 2000',
      status: 'qualified',
      value: 24000,
      source: 'referral',
      notes: 'Interested in consolidating the sales workflow.',
      assignedTo: sales._id
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  await Lead.findOneAndUpdate(
    { email: 'priya.shah@example.com' },
    {
      name: 'Priya Shah',
      email: 'priya.shah@example.com',
      company: 'Acme Services',
      status: 'new',
      value: 9000,
      source: 'website',
      assignedTo: sales._id
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  await Customer.findOneAndUpdate(
    { email: 'alex.morgan@example.com' },
    {
      firstName: 'Alex',
      lastName: 'Morgan',
      email: 'alex.morgan@example.com',
      phone: '+1 555 010 1000',
      company: 'Summit Retail',
      status: 'active',
      lifetimeValue: 42000,
      assignedTo: sales._id
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  await Activity.findOneAndUpdate(
    { lead: lead._id, subject: 'Discovery call completed' },
    {
      lead: lead._id,
      user: sales._id,
      type: 'call',
      subject: 'Discovery call completed',
      description: 'Confirmed budget, stakeholders, and target launch date.',
      duration: 30,
      outcome: 'Schedule solution demo'
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  console.log('✅ Seed data ready');
  console.log(`   Admin: ${admin.email}`);
  console.log(`   Sales: ${sales.email}`);
};

run()
  .catch(error => {
    console.error(`❌ Seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
