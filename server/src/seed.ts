import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User';
import Transaction from './models/Transaction';
import Budget from './models/Budget';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/finflow";

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        // Clear existing data
        await User.deleteMany({});
        await Transaction.deleteMany({});
        await Budget.deleteMany({});
        console.log("Cleared existing data");

        // Create test user
        const hashedPassword = await bcrypt.hash("password123", 10);
        const user = new User({
            name: "Test User",
            email: "test@example.com",
            password: hashedPassword,
            currency: "INR"
        });
        await user.save();
        const userId = user._id;

        // Create Budgets
        const budgets = [
            { userId, category: "food", limit: 15000, spent: 0 },
            { userId, category: "transport", limit: 5000, spent: 0 },
            { userId, category: "entertainment", limit: 4000, spent: 0 }
        ];
        await Budget.insertMany(budgets);

        // Create Transactions manually or randomize
        const transactions = [];
        const today = new Date();

        // Income
        for (let i = 0; i < 4; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            transactions.push({
                userId, type: "income", category: "salary", amount: 80000,
                description: "Monthly Salary", date, source: "manual"
            });
        }

        // Expenses
        const expenseCategories = ["food", "transport", "entertainment", "health", "shopping", "utilities"];

        for (let i = 0; i < 60; i++) {
            const pastDate = new Date();
            pastDate.setDate(today.getDate() - Math.floor(Math.random() * 90)); // last 90 days

            const randomCat = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
            const amount = Math.floor(Math.random() * 2000) + 100;

            transactions.push({
                userId, type: "expense", category: randomCat, amount,
                description: `Sample ${randomCat} expense`, date: pastDate, source: "manual"
            });
        }

        await Transaction.insertMany(transactions);
        console.log("Seeded user: test@example.com / password123");
        console.log(`Inserted ${transactions.length} transactions and ${budgets.length} budgets.`);

        mongoose.connection.close();
    } catch (err) {
        console.error("Seed error", err);
        process.exit(1);
    }
};

seedDatabase();
