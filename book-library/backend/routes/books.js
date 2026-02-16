const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { auth, adminAuth } = require('../middleware/auth');

// GET /api/books - List all books with pagination & search
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search, sort = 'title' } = req.query;
        const query = {};

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { isbn: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {};
        if (sort === 'title') sortOptions.title = 1;
        else if (sort === 'author') sortOptions.author = 1;
        else if (sort === 'year') sortOptions.publishedYear = -1;
        else sortOptions.title = 1;

        let books;
        try {
            books = await Book.find(query)
                .sort(sortOptions)
                .limit(parseInt(limit))
                .skip((parseInt(page) - 1) * parseInt(limit))
                .exec();
        } catch (sortErr) {
            // Fallback: Cosmos DB may not support sorting without indexes
            books = await Book.find(query)
                .limit(parseInt(limit))
                .skip((parseInt(page) - 1) * parseInt(limit))
                .exec();
        }

        const total = await Book.countDocuments(query);

        res.json({
            data: books,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/books/categories - Get distinct categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Book.distinct('category');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/books/:id - Get book by ID
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/books - Create new book (admin only)
router.post('/', adminAuth, async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/books/:id - Update book (admin only)
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/books/:id - Delete book (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
