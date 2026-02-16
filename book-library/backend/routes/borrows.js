const express = require('express');
const router = express.Router();
const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const { auth, adminAuth } = require('../middleware/auth');

const MAX_BORROWS = 5;
const LOAN_DAYS = 14;
const FINE_PER_DAY = 0.50;

// POST /api/borrows - Borrow a book
router.post('/', auth, async (req, res) => {
    try {
        const { bookId } = req.body;

        if (!bookId) {
            return res.status(400).json({ error: 'bookId is required' });
        }

        // Check book exists and is available
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        if (book.availableQuantity <= 0) {
            return res.status(400).json({ error: 'Book is not available' });
        }

        // Check user borrow limit
        const activeBorrows = await BorrowRecord.countDocuments({
            userId: req.user._id,
            status: 'borrowed'
        });
        if (activeBorrows >= MAX_BORROWS) {
            return res.status(400).json({ error: 'Maximum borrow limit reached' });
        }

        // Check if user already borrowed this book
        const existingBorrow = await BorrowRecord.findOne({
            userId: req.user._id,
            bookId,
            status: 'borrowed'
        });
        if (existingBorrow) {
            return res.status(400).json({ error: 'You already borrowed this book' });
        }

        // Create borrow record
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + LOAN_DAYS);

        const borrowRecord = new BorrowRecord({
            userId: req.user._id,
            bookId,
            dueDate,
            status: 'borrowed'
        });
        await borrowRecord.save();

        // Decrease available quantity
        book.availableQuantity -= 1;
        await book.save();

        // Populate book info for response
        await borrowRecord.populate('bookId');

        res.status(201).json({
            borrowId: borrowRecord._id,
            book: { title: borrowRecord.bookId.title, author: borrowRecord.bookId.author },
            borrowDate: borrowRecord.borrowDate,
            dueDate: borrowRecord.dueDate,
            status: borrowRecord.status
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/borrows - Get current user's borrows
router.get('/', auth, async (req, res) => {
    try {
        const { status } = req.query;
        const query = { userId: req.user._id };
        if (status) {
            query.status = status;
        }

        const borrows = await BorrowRecord.find(query)
            .populate('bookId', 'title author coverImage category')
            .sort({ borrowDate: -1 });

        // Update overdue status
        const now = new Date();
        for (const borrow of borrows) {
            if (borrow.status === 'borrowed' && now > borrow.dueDate) {
                borrow.status = 'overdue';
                borrow.fine = borrow.calculateFine();
                await borrow.save();
            }
        }

        res.json(borrows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/borrows/all - Admin: get all borrows
router.get('/all', adminAuth, async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status) query.status = status;

        const borrows = await BorrowRecord.find(query)
            .populate('userId', 'username email')
            .populate('bookId', 'title author')
            .sort({ borrowDate: -1 });

        res.json(borrows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/borrows/:id/return - Return a book
router.put('/:id/return', auth, async (req, res) => {
    try {
        const borrow = await BorrowRecord.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('bookId');

        if (!borrow) {
            return res.status(404).json({ error: 'Borrow record not found' });
        }

        if (borrow.status === 'returned') {
            return res.status(400).json({ error: 'Book already returned' });
        }

        // Calculate fine if overdue
        borrow.returnDate = new Date();
        borrow.fine = borrow.calculateFine();
        borrow.status = 'returned';
        await borrow.save();

        // Increase available quantity
        const book = await Book.findById(borrow.bookId._id);
        book.availableQuantity += 1;
        await book.save();

        res.json({
            message: 'Book returned successfully',
            fine: borrow.fine,
            returnDate: borrow.returnDate
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/borrows/history - Get borrowing history
router.get('/history', auth, async (req, res) => {
    try {
        const borrows = await BorrowRecord.find({ userId: req.user._id })
            .populate('bookId', 'title author coverImage')
            .sort({ borrowDate: -1 });

        res.json(borrows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
