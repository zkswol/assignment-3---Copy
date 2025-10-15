const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Ingredient name is required"],
    minlength: [3, "Ingredient name must be at least 3 characters long"],
  },
  quantity: {
    type: String,
    required: [true, "Ingredient quantity is required"],
    validate: {
      validator: function(ingredient) {
        return /^\d+(\.\d+)?\s*\w+$/.test(ingredient);
      },
      message: "Quantity must be a positive number followed by a unit of measurement"
    },
  },
});

const recipes = new mongoose.Schema({
    recipeId: { 
        type: String, 
        required: [true, 'Recipe ID is required'], 
        unique: true,
        match: [/^R-\d{5}$/, 'Recipe ID must be in the format R-XXXXX']
    },
    userId: { 
        type: String, 
        required: [true, 'User ID is required'], 
        match: [/^U-\d{5}$/, 'User ID must be in the format U-XXXXX']
    },
    ownerId: { 
        type: String, 
        required: [true, 'Owner ID is required'], 
        match: [/^U-\d{5}$/, 'Owner ID must be in the format U-XXXXX']
    },
    title: { 
        type: String, 
        required: [true, 'Title is required'],
        minlength: [3, 'Title must be minimum 3 characters'],
        maxlength: [100, 'Title must be maximum 100 characters'],
    },
    chef: { 
        type: String, 
        required: [true, 'Chef is required'],
        minlength: [2, 'Chef must be minimum 2 characters'],
        maxlength: [50, 'Chef must be maximum 50 characters'],
        match: [/^[A-Za-z\s\-'’]+$/, 'Chef can only contain letters, spaces, hyphens, and apostrophes']
    },
    ingredients: { 
        type: [ingredientSchema], 
        required: [true, 'Ingredients are required'],
        validate: [
            {
                validator: function(arr) {
                    return arr.length >= 1 && arr.length <= 20;
                },
                message: 'Ingredients must contain between 1 and 20 items'
            }
        ]
    },
    instructions: { 
        type: [String], 
        required: [true, 'Instructions are required'],
        validate: [
            {
                validator: function(arr) {
                    return arr.length >= 1 && arr.length <= 15;
                },
                message: 'Instructions must contain between 1 and 15 steps'
            },
            {
                validator: function(arr) {
                    return arr.every(step => step.length >= 10);
                },
                message: 'Each instruction step must be at least 10 characters long'
            }
        ]
    },
    mealType: { 
        type: String, 
        required: [true, 'Meal type is required'],
        enum: ["Breakfast", "Lunch", "Dinner", "Snack"]
    },
    cuisineType: { 
        type: String, 
        required: [true, 'Cuisine type is required'],
        enum: ["Italian", "Asian", "Mexican", "American", "French", "Indian", "Mediterranean", "Other"]
    },
    prepTime: { 
        type: Number, 
        required: [true, 'Prep time is required'],
        min: [1, 'Prep time must be at least 1 minute'],
        max: [480, 'Prep time must not exceed 480 minutes'],
    },
    difficulty: { 
        type: String, 
        required: [true, 'Difficulty is required'], 
        enum: ["Easy", "Medium", "Hard"] 
    },
    servings: { 
        type: Number, 
        required: [true, 'Servings are required'],
        min: [1, 'Servings must be at least 1'],
        max: [20, 'Servings must not exceed 20']
    },
    createdDate: { 
        type: Date, 
        required: [true, 'Created date is required'],
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
});

/**
recipes.virtual('userId', {
    ref: 'User',
    localField: 'userId',
    foreignField: 'userId',
});
*/

const Recipe = mongoose.model('Recipe', recipes);
module.exports = Recipe;