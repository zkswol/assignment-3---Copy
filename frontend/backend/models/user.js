const mongoose = require('mongoose');

const users = new mongoose.Schema({
    
    userId: { 
        type: String, 
        required: [true, 'User ID is required'], 
        unique: true,
        match: [/^U-\d{5}$/, 'User ID must be in the format U-XXXXX']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email must be a valid email address']
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be minimum 8 characters'],
        match: [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
            'Password must be minimum 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        ]
    },
    fullname: { 
        type: String, 
        required: [true, 'Full name is required'],
        minlength: [2, 'Full name must be minimum 2 characters'],
        maxlength: [100, 'Full name must be maximum 100 characters'],
        match: [/^[A-Za-z\s-'’]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes']
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: {
            values: ["admin", "chef", "manager"],
            message: 'Role must be either admin, chef, or manager'
        }
    },
    phone: { 
        type: String, 
        required: [true, 'Phone number is required'],
        match: [/^\+61\s?4\d{2}\s?\d{3}\s?\d{3}$/, 'Phone number must be in Australian mobile format: +61 4xx xxx xxx']
    },
}, { timestamps: true });

const User = mongoose.model('User', users);
module.exports = User;