import mongoose, { Schema } from 'mongoose';
import { MONGODB_URI } from './config.js';

export const connectDB = async () => {
    // Connect during server bootstrap so startup fails fast if DB is unreachable.
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
};

// Create a Schema for Users
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
});

const accountSchema = new mongoose.Schema({
    balance : {type : Number, required : true},
    // Enforce one account per user to avoid duplicate wallet records.
    userId : {type : Schema.Types.ObjectId, ref : "User", required : true, unique: true, index: true}
});


export const User = mongoose.model('User', userSchema);
export const Account = mongoose.model('Account',accountSchema);