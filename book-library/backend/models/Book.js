const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, unique: true, sparse: true },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    publishedYear: { type: Number },
    category: { type: String, default: 'General' },
    totalQuantity: { type: Number, default: 1 },
    availableQuantity: { type: Number, default: 1 }
}, { timestamps: true });

// Text index for search
bookSchema.index({ title: 'text', author: 'text' });

module.exports = mongoose.model('Book', bookSchema);
