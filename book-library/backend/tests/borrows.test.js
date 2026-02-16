const request = require('supertest');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const app = require('../app');
const Book = require('../models/Book');
const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');
const jwt = require('jsonwebtoken');

let memberToken, memberId;

beforeAll(async () => {
    await connect();
});

afterAll(async () => {
    await closeDatabase();
});

afterEach(async () => {
    await clearDatabase();
});

async function createMemberAndBook() {
    const member = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test1234!',
        role: 'member'
    });
    await member.save();
    const token = jwt.sign({ userId: member._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const book = await Book.create({
        title: 'JavaScript Guide',
        author: 'John Doe',
        totalQuantity: 3,
        availableQuantity: 3
    });

    return { member, token, book };
}

describe('Borrows API', () => {
    describe('POST /api/borrows', () => {
        it('should borrow an available book', async () => {
            const { token, book } = await createMemberAndBook();

            const res = await request(app)
                .post('/api/borrows')
                .set('Authorization', `Bearer ${token}`)
                .send({ bookId: book._id });

            expect(res.status).toBe(201);
            expect(res.body.book.title).toBe('JavaScript Guide');
            expect(res.body.status).toBe('borrowed');
            expect(res.body.dueDate).toBeDefined();

            // Check book quantity decreased
            const updatedBook = await Book.findById(book._id);
            expect(updatedBook.availableQuantity).toBe(2);
        });

        it('should reject when book not available', async () => {
            const { token, book } = await createMemberAndBook();
            book.availableQuantity = 0;
            await book.save();

            const res = await request(app)
                .post('/api/borrows')
                .set('Authorization', `Bearer ${token}`)
                .send({ bookId: book._id });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Book is not available');
        });

        it('should reject when user has 5 active borrows', async () => {
            const { member, token } = await createMemberAndBook();

            // Create 5 active borrows
            for (let i = 0; i < 5; i++) {
                const b = await Book.create({
                    title: `Book ${i}`,
                    author: 'Author',
                    totalQuantity: 1,
                    availableQuantity: 1
                });
                await BorrowRecord.create({
                    userId: member._id,
                    bookId: b._id,
                    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    status: 'borrowed'
                });
            }

            const newBook = await Book.create({
                title: 'Extra Book',
                author: 'Author',
                totalQuantity: 1,
                availableQuantity: 1
            });

            const res = await request(app)
                .post('/api/borrows')
                .set('Authorization', `Bearer ${token}`)
                .send({ bookId: newBook._id });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Maximum borrow limit reached');
        });

        it('should reject duplicate borrow', async () => {
            const { member, token, book } = await createMemberAndBook();

            // First borrow
            await request(app)
                .post('/api/borrows')
                .set('Authorization', `Bearer ${token}`)
                .send({ bookId: book._id });

            // Second borrow of same book
            const res = await request(app)
                .post('/api/borrows')
                .set('Authorization', `Bearer ${token}`)
                .send({ bookId: book._id });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('You already borrowed this book');
        });

        it('should reject unauthenticated borrow', async () => {
            const res = await request(app)
                .post('/api/borrows')
                .send({ bookId: '507f1f77bcf86cd799439011' });

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/borrows', () => {
        it('should return user borrows', async () => {
            const { member, token, book } = await createMemberAndBook();

            await BorrowRecord.create({
                userId: member._id,
                bookId: book._id,
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                status: 'borrowed'
            });

            const res = await request(app)
                .get('/api/borrows')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
        });
    });

    describe('PUT /api/borrows/:id/return', () => {
        it('should return a borrowed book', async () => {
            const { member, token, book } = await createMemberAndBook();

            const borrow = await BorrowRecord.create({
                userId: member._id,
                bookId: book._id,
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                status: 'borrowed'
            });

            // Decrease available manually to simulate borrow
            book.availableQuantity -= 1;
            await book.save();

            const res = await request(app)
                .put(`/api/borrows/${borrow._id}/return`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Book returned successfully');

            // Check book quantity restored
            const updatedBook = await Book.findById(book._id);
            expect(updatedBook.availableQuantity).toBe(3);

            // Check borrow status
            const updatedBorrow = await BorrowRecord.findById(borrow._id);
            expect(updatedBorrow.status).toBe('returned');
        });

        it('should reject returning already returned book', async () => {
            const { member, token, book } = await createMemberAndBook();

            const borrow = await BorrowRecord.create({
                userId: member._id,
                bookId: book._id,
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                status: 'returned',
                returnDate: new Date()
            });

            const res = await request(app)
                .put(`/api/borrows/${borrow._id}/return`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Book already returned');
        });
    });
});
