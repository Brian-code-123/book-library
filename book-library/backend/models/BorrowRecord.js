const mongoose = require('mongoose');

const borrowRecordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    status: {
        type: String,
        enum: ['borrowed', 'returned', 'overdue'],
        default: 'borrowed'
    },
    fine: { type: Number, default: 0 }
}, { timestamps: true });

// Virtual: Calculate if overdue
borrowRecordSchema.virtual('isOverdue').get(function() {
    return this.status === 'borrowed' && new Date() > this.dueDate;
});

// Method: Calculate fine ($0.50 per day overdue)
borrowRecordSchema.methods.calculateFine = function() {
    if (this.status !== 'borrowed' && this.status !== 'overdue') return 0;
    const now = this.returnDate || new Date();
    if (now <= this.dueDate) return 0;
    const daysOverdue = Math.ceil((now - this.dueDate) / (1000 * 60 * 60 * 24));
    return daysOverdue * 0.50;
};

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);
