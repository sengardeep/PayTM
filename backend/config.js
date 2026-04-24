import 'dotenv/config';

// Read required env variables once at startup so config failures surface early.
const getRequiredEnv = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`${key} is not set. Add it to backend/.env before starting the server.`);
    }

    return value;
};

export const JWT_SECRET = getRequiredEnv('JWT_SECRET');
export const MONGODB_URI = getRequiredEnv('MONGODB_URI');
export const PORT = Number(process.env.PORT) || 3000;