import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Staff from '../models/Staff.js';

dotenv.config();

const seed = async () => {
  await connectDB();

  await User.deleteMany({});
  await Customer.deleteMany({});
  await Staff.deleteMany({});

  const admin = await User.create({
    name: 'Admin Owner',
    email: 'admin@tailor.com',
    password: 'admin123',
    role: 'admin',
    phone: '03001234567',
  });

  await User.create({
    name: 'Shop Manager',
    email: 'manager@tailor.com',
    password: 'manager123',
    role: 'manager',
    phone: '03001234568',
  });

  const tailor = await User.create({
    name: 'Master Tailor',
    email: 'tailor@tailor.com',
    password: 'tailor123',
    role: 'tailor',
    phone: '03001234569',
  });

  await User.create({
    name: 'Reception Desk',
    email: 'reception@tailor.com',
    password: 'reception123',
    role: 'receptionist',
    phone: '03001234570',
  });

  await Staff.create({
    userId: tailor._id,
    name: 'Master Tailor',
    phone: '03001234569',
    role: 'tailor',
    salary: 45000,
    joiningDate: new Date('2024-01-15'),
  });

  await Customer.create({
    customerCode: 'CUST-00001',
    name: 'Ahmed Khan',
    phone: '03009876543',
    email: 'ahmed@example.com',
    address: '123 Main Street, Lahore',
    gender: 'male',
    notes: 'Regular customer',
  });

  console.log('Seed completed!');
  console.log('Login credentials:');
  console.log('  Admin: admin@tailor.com / admin123');
  console.log('  Manager: manager@tailor.com / manager123');
  console.log('  Tailor: tailor@tailor.com / tailor123');
  console.log('  Receptionist: reception@tailor.com / reception123');

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
