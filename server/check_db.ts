import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from './src/models/User';

async function check() {
    await mongoose.connect(process.env.MONGO_URI!);
    const users = await User.find({});
    console.log(JSON.stringify(users.map(u => ({ email: u.email, goals: u.goals })), null, 2));
    process.exit(0);
}

check();
