const mongoose = require('mongoose');

//Inventory Schema and Model
const inventory = new mongoose.Schema({
    inventoryId: { 
        type: String,
        required: [true, 'Inventory ID is required'],
        unique: true,
        match: [/^I-\d{5}$/, 'Inventory ID must be in the format I-XXXXX']
    },
    userId: { 
        type: String, 
        required: [true, 'User ID is required'], 
        match: [/^U-\d{5}$/, 'User ID must be in the format U-XXXXX']
    },
    addedBy: { 
        type: String, 
        required: [true, 'Added by user ID is required'], 
        match: [/^U-\d{5}$/, 'Added by user ID must be in the format U-XXXXX']
    },
    ingredientName: { 
        type: String, 
        required: [true, 'Ingredient name is required'],
        minlength: [2, 'Ingredient name must be minimum 2 characters'],
        maxlength: [50, 'Ingredient name must be maximum 50 characters'],
        match: [/^[A-Za-z\s-'’]+$/, 'Ingredient name can only contain letters, spaces, hyphens, and apostrophes']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0.01, 'Quantity must be a positive number greater than 0'],
        max: [9999, 'Quantity must be less than or equal to 9999']
    },
    unit: {
        type: String,
        required: [true, 'Unit is required'],
        enum: {
            values: ["pieces", "kg", "g", "liters", "ml", "cups", "tbsp", "tsp", "dozen"],
            message: 'Unit must be one of: pieces, kg, g, liters, ml, cups, tbsp, tsp, dozen'
        }
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: [
                "Vegetables", "Fruits", "Meat", "Dairy", "Grains", "Spices",
                "Beverages", "Frozen", "Canned", "Other"
            ],
            message: 'Category must be one of: Vegetables, Fruits, Meat, Dairy, Grains, Spices, Beverages, Frozen, Canned, Other'
        }
    },
    purchaseDate: {
        type: Date,
        required: [true, 'Purchase date is required'],
        validate: [
            {
                validator: function(date) {
                    // Check string format
                    const isoString = date.toISOString().slice(0, 10);
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoString)) return false;
                    // Cannot be in the future
                    return date <= new Date();
                },
                message: 'Created date must be a valid date in YYYY-MM-DD format and cannot be in the future'
            }
        ]
    },
    expirationDate: {
        type: Date,
        required: [true, 'Expiration date is required'],
        validate: [
            {
                validator: function(date) {
                    const isoString = date.toISOString().slice(0, 10);
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoString)) return false;
                    let purchaseDate = this.purchaseDate;
                    // For update queries, get purchaseDate from the update payload
                    if (this && this.getUpdate) {
                        const update = this.getUpdate();
                        if (update && update.$set && update.$set.purchaseDate) {
                            purchaseDate = update.$set.purchaseDate;
                        }
                    }
                    if (!purchaseDate) return false;
                    return date >= purchaseDate;
                },
                message: 'Expiration date must be in YYYY-MM-DD format and must be after purchase date'
            }
        ],
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        enum: {
            values: ["Fridge", "Freezer", "Pantry", "Counter", "Cupboard"],
            message: 'Location must be one of: Fridge, Freezer, Pantry, Counter, Cupboard'
        }
    },
    cost: {
        type: Number,
        required: [true, 'Cost is required'],
        min: [0.01, 'Cost must be a positive number greater than 0'],
        max: [999.99, 'Cost must be less than or equal to 999.99'],
        validate: {
            validator: function(cost) {
                // Check for max 2 decimal places
                return /^\d+(\.\d{1,2})?$/.test(cost.toString());
            },
            message: 'Cost must have at most 2 decimal places'
        }
    },
    createdDate: {
        type: Date,
        required: [true, 'Created date is required'],
                validate: [
            {
                validator: function(date) {
                    const isoString = date.toISOString().slice(0, 10);
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoString)) return false;
                    return date <= new Date();
                },
                message: 'Expiration date must be in YYYY-MM-DD format and cannot be in the future'
            }
        ]

    }
});
/**
inventory.virtual('userId', {
    ref: 'User',
    localField: 'userId',
    foreignField: 'userId',
});
*/

const Inventory = mongoose.model('Inventory', inventory);

module.exports = Inventory;