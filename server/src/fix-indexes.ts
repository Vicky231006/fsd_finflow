import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function fix() {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log("Connected to DB");

        const db = mongoose.connection.db;
        const collections = await db?.listCollections().toArray();
        console.log("Collections:", collections?.map(c => c.name));

        const advColl = db?.collection('advisorconversations');
        if (advColl) {
            const indexes = await advColl.indexes();
            console.log("AdvisorConversation Indexes:", indexes);

            // If userId_1 is unique, drop it
            const userIdIndex = indexes.find(i => i.name === 'userId_1');
            if (userIdIndex && userIdIndex.unique) {
                console.log("Dropping unique userId_1 index...");
                await advColl.dropIndex('userId_1');
                console.log("Index dropped.");
            }
        }

        console.log("Done.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
