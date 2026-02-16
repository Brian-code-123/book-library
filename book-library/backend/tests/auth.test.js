const request = require('supertest');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const app = require('../app');
const User = require('../models/User');

beforeAll(async () => {
    await connect();
});

afterAll(async () => {
    await closeDatabase();
});

afterEach(async () => {
    await clearDatabase();
});

describe('Auth API', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'newuser',
                    email: 'newuser@example.com',
                    password: 'Password1!',
                    fullName: 'New User'
                });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Registration successful');
            expect(res.body.token).toBeDefined();
            expect(res.body.user.email).toBe('newuser@example.com');
            expect(res.body.user.password).toBeUndefined();
        });

        it('should reject duplicate email', async () => {
            await User.create({
                username: 'existing',
                email: 'existing@example.com',
                password: 'Password1!'
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'another',
                    email: 'existing@example.com',
                    password: 'Password1!'
                });

            expect(res.status).toBe(400);
        });

        it('should reject weak password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'user1',
                    email: 'user1@example.com',
                    password: 'short'
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('8 characters');
        });

        it('should reject password without uppercase', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'user1',
                    email: 'user1@example.com',
                    password: 'password1!'
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('uppercase');
        });

        it('should reject password without number', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'user1',
                    email: 'user1@example.com',
                    password: 'Passworddd!'
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('number');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with correct credentials', async () => {
            // Register first
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'Test1234!'
                });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'Test1234!'
                });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Login successful');
            expect(res.body.token).toBeDefined();
        });

        it('should reject invalid password', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'Test1234!'
                });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'WrongPassword1!'
                });

            expect(res.status).toBe(401);
        });

        it('should reject non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'Test1234!'
                });

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return current user profile', async () => {
            const registerRes = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'Test1234!'
                });

            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${registerRes.body.token}`);

            expect(res.status).toBe(200);
            expect(res.body.email).toBe('test@example.com');
        });

        it('should reject unauthenticated request', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.status).toBe(401);
        });
    });
});
