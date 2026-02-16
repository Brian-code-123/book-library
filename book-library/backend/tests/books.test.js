const request = require('supertest');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const app = require('../app');
const Book = require('../models/Book');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let adminToken;
let memberToken;

beforeAll(async () => {
    await connect();
});

afterAll(async () => {
    await closeDatabase();
});

afterEach(async () => {
    await clearDatabase();
});

async function createAdmin() {
    const admin = new User({
        username: 'admin',
        email: 'admin@library.com',
        password: 'Admin123!',
        role: 'admin',
        fullName: 'Admin User'
    });
    await admin.save();
    const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { user: admin, token };
}

async function createMember() {
    const member = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test1234!',
        role: 'member',
        fullName: 'Test User'
    });
    await member.save();
    const token = jwt.sign({ userId: member._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { user: member, token };
}

describe('Books API', () => {
    describe('GET /api/books', () => {
        it('should return empty array when no books', async () => {
            const res = await request(app).get('/api/books');
            expect(res.status).toBe(200);
            expect(res.body.data).toEqual([]);
            expect(res.body.pagination.total).toBe(0);
        });

        it('should return all books', async () => {
            await Book.create([
                { title: 'Book 1', author: 'Author 1' },
                { title: 'Book 2', author: 'Author 2' }
            ]);

            const res = await request(app).get('/api/books');
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(2);
            expect(res.body.pagination.total).toBe(2);
        });

        it('should filter books by category', async () => {
            await Book.create([
                { title: 'JS Book', author: 'Author 1', category: 'Technology' },
                { title: 'Novel', author: 'Author 2', category: 'Fiction' }
            ]);

            const res = await request(app).get('/api/books?category=Technology');
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].title).toBe('JS Book');
        });

        it('should search books by title', async () => {
            await Book.create([
                { title: 'JavaScript Guide', author: 'Author 1' },
                { title: 'Python Guide', author: 'Author 2' }
            ]);

            const res = await request(app).get('/api/books?search=JavaScript');
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].title).toBe('JavaScript Guide');
        });

        it('should paginate results', async () => {
            for (let i = 0; i < 15; i++) {
                await Book.create({ title: `Book ${i}`, author: `Author ${i}` });
            }

            const res = await request(app).get('/api/books?page=2&limit=10');
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(5);
            expect(res.body.pagination.page).toBe(2);
            expect(res.body.pagination.pages).toBe(2);
        });
    });

    describe('GET /api/books/:id', () => {
        it('should return a book by ID', async () => {
            const book = await Book.create({ title: 'Test Book', author: 'Test Author' });

            const res = await request(app).get(`/api/books/${book._id}`);
            expect(res.status).toBe(200);
            expect(res.body.title).toBe('Test Book');
        });

        it('should return 404 for non-existent book', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const res = await request(app).get(`/api/books/${fakeId}`);
            expect(res.status).toBe(404);
        });
    });

    describe('POST /api/books', () => {
        it('should create a new book (admin)', async () => {
            const { token } = await createAdmin();

            const bookData = {
                title: 'JavaScript Guide',
                author: 'John Doe',
                isbn: '978-0-123456-78-9',
                category: 'Technology',
                totalQuantity: 3,
                availableQuantity: 3
            };

            const res = await request(app)
                .post('/api/books')
                .set('Authorization', `Bearer ${token}`)
                .send(bookData);

            expect(res.status).toBe(201);
            expect(res.body.title).toBe('JavaScript Guide');
        });

        it('should reject non-admin users', async () => {
            const { token } = await createMember();

            const res = await request(app)
                .post('/api/books')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Test', author: 'Test' });

            expect(res.status).toBe(403);
        });

        it('should reject unauthenticated requests', async () => {
            const res = await request(app)
                .post('/api/books')
                .send({ title: 'Test', author: 'Test' });

            expect(res.status).toBe(401);
        });
    });

    describe('PUT /api/books/:id', () => {
        it('should update a book (admin)', async () => {
            const { token } = await createAdmin();
            const book = await Book.create({ title: 'Old Title', author: 'Author' });

            const res = await request(app)
                .put(`/api/books/${book._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'New Title' });

            expect(res.status).toBe(200);
            expect(res.body.title).toBe('New Title');
        });
    });

    describe('DELETE /api/books/:id', () => {
        it('should delete a book (admin)', async () => {
            const { token } = await createAdmin();
            const book = await Book.create({ title: 'Delete Me', author: 'Author' });

            const res = await request(app)
                .delete(`/api/books/${book._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Book deleted successfully');

            const found = await Book.findById(book._id);
            expect(found).toBeNull();
        });
    });
});
