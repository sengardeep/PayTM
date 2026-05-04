import express from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { authMiddleware } from '../auth/middleware.js';
import { Account, Ledger, User } from '../db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const accountRouter = express.Router();

accountRouter.get('/balance', authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.userId;
    const account = await Account.findOne({ userId: userId });

    // Return a controlled response instead of throwing when account is missing.
    if (!account) {
        return res.status(404).json({ message: 'Account not found' });
    }

    return res.status(200).json({
        balance: account.balance
    });
}));

accountRouter.post('/transfer', authMiddleware, asyncHandler(async (req, res) => {
    const { to, amount } = req.body;
    // Normalize to number once so all checks and updates use the same value.
    const transferAmount = Number(amount);

    // Validate receiver format and amount before touching the DB.
    if (!to || !mongoose.Types.ObjectId.isValid(to) || !Number.isFinite(transferAmount) || transferAmount <= 0) {
        return res.status(400).json({ message: 'Invalid transfer details' });
    }

    // Prevent users from sending money to their own account.
    if (String(to) === String(req.userId)) {
        return res.status(400).json({ message: 'Cannot transfer to self' });
    }

    // Validate that the target user exists before opening a transaction.
    const receiverUser = await User.findById(to);
    if (!receiverUser) {
        return res.status(404).json({ message: "Invalid receiver's details" });
    }

    // Use a session transaction so debit and credit happen atomically.
    const session = await Account.startSession();

    try {
        session.startTransaction();

        // Read sender inside the same transaction for consistency.
        const sender = await Account.findOne({ userId: req.userId }).session(session);
        if (!sender) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Sender account not found' });
        }

        // Ensure sender has enough funds before applying updates.
        if (sender.balance < transferAmount) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Ensure receiver has an account document to credit.
        const receiver = await Account.findOne({ userId: to }).session(session);
        if (!receiver) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Receiver account not found' });
        }

        // Debit sender.
        await Account.updateOne(
            { userId: req.userId },
            { $inc: { balance: -transferAmount } },
            { session }
        );

        // Credit receiver.
        await Account.updateOne(
            { userId: to },
            { $inc: { balance: transferAmount } },
            { session }
        );

        const previousEntry = await Ledger.findOne({}, { hash: 1 })
            .sort({ createdAt: -1 })
            .session(session);

        const prevHash = previousEntry?.hash || 'GENESIS';
        const ledgerTimestamp = new Date();
        const payload = `${prevHash}:${req.userId}:${to}:${transferAmount}:${ledgerTimestamp.toISOString()}`;
        const hash = crypto.createHash('sha256').update(payload).digest('hex');

        await Ledger.create([{
            fromUserId: req.userId,
            toUserId: to,
            amount: transferAmount,
            prevHash,
            hash,
            createdAt: ledgerTimestamp
        }], { session });

        // Persist both balance updates and ledger record as one atomic commit.
        await session.commitTransaction();
        return res.status(200).json({ message: 'Transfer successful' });
    } catch {
        // Roll back any partial changes if something fails.
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        return res.status(500).json({ message: 'Transfer failed' });
    } finally {
        // Always release the session resource.
        session.endSession();
    }
}));

export default accountRouter;