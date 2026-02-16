require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User');

const books = [
    { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', isbn: '978-0-596-51774-8', description: 'Most programming languages contain good and bad parts, but JavaScript has more than its share of the bad.', publishedYear: 2008, category: 'Technology', totalQuantity: 3, availableQuantity: 3 },
    { title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0-132-35088-4', description: 'A handbook of agile software craftsmanship.', publishedYear: 2008, category: 'Technology', totalQuantity: 2, availableQuantity: 2 },
    { title: 'Design Patterns', author: 'Gang of Four', isbn: '978-0-201-63361-0', description: 'Elements of Reusable Object-Oriented Software.', publishedYear: 1994, category: 'Technology', totalQuantity: 2, availableQuantity: 2 },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0-743-27356-5', description: 'A story of the fabulously wealthy Jay Gatsby and his love for Daisy Buchanan.', publishedYear: 1925, category: 'Fiction', totalQuantity: 4, availableQuantity: 4 },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0-061-12008-4', description: 'The unforgettable novel of a childhood in a sleepy Southern town.', publishedYear: 1960, category: 'Fiction', totalQuantity: 3, availableQuantity: 3 },
    { title: '1984', author: 'George Orwell', isbn: '978-0-451-52493-5', description: 'A dystopian social science fiction novel and cautionary tale.', publishedYear: 1949, category: 'Fiction', totalQuantity: 3, availableQuantity: 3 },
    { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-0-553-10953-5', description: 'A landmark volume in science writing.', publishedYear: 1988, category: 'Science', totalQuantity: 2, availableQuantity: 2 },
    { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '978-0-062-31609-7', description: 'A brief history of humankind.', publishedYear: 2011, category: 'History', totalQuantity: 3, availableQuantity: 3 },
    { title: 'Steve Jobs', author: 'Walter Isaacson', isbn: '978-1-451-64853-9', description: 'The exclusive biography of Steve Jobs.', publishedYear: 2011, category: 'Biography', totalQuantity: 2, availableQuantity: 2 },
    { title: 'The Pragmatic Programmer', author: 'David Thomas & Andrew Hunt', isbn: '978-0-135-95705-9', description: 'Your journey to mastery in software development.', publishedYear: 2019, category: 'Technology', totalQuantity: 2, availableQuantity: 2 }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Book.deleteMany({});
        await User.deleteMany({});
        console.log('Cleared existing data');

        // Create books
        await Book.insertMany(books);
        console.log(`Seeded ${books.length} books`);

        // Create admin user
        const admin = new User({
            username: 'admin',
            email: 'admin@library.com',
            password: 'Admin123!',
            role: 'admin',
            fullName: 'Library Admin'
        });
        await admin.save();
        console.log('Created admin user (admin@library.com / Admin123!)');

        // Create test member
        const member = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'Test1234!',
            role: 'member',
            fullName: 'Test User'
        });
        await member.save();
        console.log('Created test user (test@example.com / Test1234!)');

        console.log('\nSeed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error.message);
        process.exit(1);
    }
}

seed();
