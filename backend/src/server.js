import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

dotenv.config({
    path: "./.env"
});

const PORT = process.env.PORT || 5000;

const start = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});