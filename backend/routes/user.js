import express from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Account, User } from "../db.js";
import { JWT_SECRET } from "../config.js";
import { authMiddleware } from "../auth/middleware.js";
import { asyncHandler } from '../utils/asyncHandler.js';

const userRouter = express.Router();
const userSchema = z.object({
    username: z.string().min(3).max(30),
    // Match DB rule to fail early with clear API validation errors.
    password: z.string().min(6),
    firstName: z.string().max(50),
    lastName: z.string().max(50)
});

const signinSchema = z.object({
    username: z.string().min(3).max(30),
    password: z.string().min(6)
});

const userUpdateSchema = z.object({
    password: z.string().min(6).optional(),
    firstName: z.string().max(50).optional(),
    lastName: z.string().max(50).optional()
}).refine((data) => data.password !== undefined || data.firstName !== undefined || data.lastName !== undefined, {
    message: "At least one field is required to update"
});

const MAX_BULK_RESULTS = 20;
const MAX_FILTER_LENGTH = 50;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

userRouter.post('/signup', asyncHandler(async (req, res) => {
    //Zod validation
    const result = userSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json(result.error.format());
    }

    const { username, firstName, lastName, password } = result.data;
    //Is the user already exist
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(409).json({
            message: 'User already exists'
        });
    }

    //password hashing
    const hashed = await bcrypt.hash(password, 10);

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Create user and account in one transaction to avoid orphan users.
        const [user] = await User.create([{
            username,
            firstName,
            lastName,
            password: hashed
        }], { session });

        // Keep existing behavior of assigning a random initial balance.
        const randomStartingBalance = Math.floor(1 + Math.random() * 1e4);
        await Account.create([{
            userId: user._id,
            balance: randomStartingBalance
        }], { session });

        await session.commitTransaction();

        //jwt assignment
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);

        return res.status(201).json({
            message: 'User created successfully',
            token
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        // Handle race condition where same username is created concurrently.
        if (error?.code === 11000) {
            return res.status(409).json({
                message: 'User already exists'
            });
        }

        throw error;
    } finally {
        session.endSession();
    }
}));

userRouter.post('/signin', asyncHandler(async (req, res) => {
    const result = signinSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json(result.error.format());
    }

    const { username, password } = result.data;

    const existingUser = await User.findOne({ username });
    if (!existingUser) {
        // Do not leak whether username exists.
        return res.status(401).json({
            message: 'Invalid username or password'
        });
    }

    const passwordMatched = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatched) {
        return res.status(401).json({
            message: 'Invalid username or password'
        });
    }

    const token = jwt.sign(
        { userId: existingUser._id },
        JWT_SECRET
    );

    return res.status(200).json({
        message: 'Signin successful',
        token
    });
}));

userRouter.put('/', authMiddleware, asyncHandler(async (req, res) => {
    const result = userUpdateSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json(result.error.format());
    }

    const { password, firstName, lastName } = result.data;
    const updateData = {};

    if (firstName !== undefined) {
        updateData.firstName = firstName;
    }

    if (lastName !== undefined) {
        updateData.lastName = lastName;
    }

    if (password !== undefined) {
        updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.userId,
        { $set: updateData },
        { new: true }
    );

    if (!updatedUser) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    return res.status(200).json({
        message: "User updated successfully"
    });
}));

userRouter.get('/bulk', authMiddleware, asyncHandler(async (req, res) => {
    const filter = typeof req.query.filter === 'string' ? req.query.filter.trim() : '';
    if (filter.length > MAX_FILTER_LENGTH) {
        return res.status(400).json({
            message: `Filter must be at most ${MAX_FILTER_LENGTH} characters`
        });
    }

    // Escape regex chars from user input to prevent regex injection/ReDoS patterns.
    const escapedFilter = escapeRegex(filter);
    const query = escapedFilter
        ? {
            $or: [
                { firstName: { $regex: escapedFilter, $options: 'i' } },
                { lastName: { $regex: escapedFilter, $options: 'i' } }
            ]
        }
        : {};

    // Cap results to keep search endpoint responsive under broad queries.
    const users = await User.find(query)
        .select('username firstName lastName')
        .limit(MAX_BULK_RESULTS);

    return res.json({
        user: users
            .filter((user) => user._id.toString() !== req.userId)
            .map((user) => ({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                _id: user._id
            }))
    });
}));



export default userRouter;