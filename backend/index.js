import express from "express";
import cors from 'cors';
import { connectDB } from './db.js';
import { PORT } from './config.js';
import router from "./routes/indes.js";


const app = express();


app.use(cors());
app.use(express.json());

app.use('/api/v1',router);

// Centralized error handler keeps unexpected failures consistent across routes.
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    console.error('Unhandled API error:', err);
    return res.status(500).json({ message: 'Internal server error' });
});

const startServer = async () => {
    try {
        // Start listening only after DB connection is ready.
        await connectDB();
        app.listen(PORT, () => {
            console.log(`App is listening to PORT ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();