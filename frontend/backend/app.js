const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json()); // to parse JSON bodies
const PORT = 8080;
// Serve Angular build output (absolute path from this file)
const STATIC_DIR = path.join(__dirname, '../dist/frontend/browser');
app.use(express.static(STATIC_DIR));
app.listen(PORT, '0.0.0.0', () => console.log(`API server running on http://0.0.0.0:${PORT}`));

mongoose.connect('mongodb://127.0.0.1:27017/cloud_kitchen_pro');

const User = require('./models/user');
const Recipe = require('./models/recipe');
const Inventory = require('./models/inventory');

function toInstructionArray(instructions) {
  if (Array.isArray(instructions)) return instructions;
  if (typeof instructions === 'string') return instructions.split('\n').filter(s => s.trim());
  return [];
}

async function findRecipeById(id) {
  return await Recipe.findOne({ recipeId: id });
}

// Auto-generated ID functions
async function generateNextUserId() {
  const lastUser = await User.findOne().sort({ userId: -1 });
  if (!lastUser || !lastUser.userId) {
      return "U-00001";
  } else {
      const maxId = parseInt(lastUser.userId.substring(2), 10);
      const paddedId = String(maxId + 1).padStart(5, '0');
      return `U-${paddedId}`;
  }
}

async function generateNextRecipeId() {
  const lastRecipe = await Recipe.findOne().sort({ recipeId: -1 });
  if (!lastRecipe || !lastRecipe.recipeId) {
      return "R-00001";
  } else {
      const maxId = parseInt(lastRecipe.recipeId.substring(2), 10);
      const paddedId = String(maxId + 1).padStart(5, '0');
      return `R-${paddedId}`;
  }
}

async function generateNextInventoryId() {
  const lastInventory = await Inventory.findOne().sort({ inventoryId: -1 });
  if (!lastInventory || !lastInventory.inventoryId) {
      return "I-00001";
  } else {
      const maxId = parseInt(lastInventory.inventoryId.substring(2), 10);
      const paddedId = String(maxId + 1).padStart(5, '0');
      return `I-${paddedId}`;
  }
}


app.get('/me-34475338', async (req, res) => {
  const { userId } = req.query;  // coming from Angular URL/query
  const user = await User.findOne({ userId });
  if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
  res.json({ ok: true, user });
});


app.post('/register-34475338', async (req, res) => {
  try {
    const { fullname, email, password, role, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ ok:false, error:'Email already registered' });
    
    // Generate userId automatically
    const userCount = await User.countDocuments();
    const userId = `U-${String(userCount + 1).padStart(5, '0')}`;
    
    const newUser = new User({ userId, fullname, email, password, role, phone });
    await newUser.save();

    res.status(201).json({ ok:true, message:'User registered successfully' });
  } catch (err) {
    console.error(err);
    
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ ok:false, error: errors[0] }); // Send first error message
    }
    
    // Handle duplicate key errors (like email already exists)
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(409).json({ ok:false, error: `${field} already exists` });
    }
    
    // Handle other errors
    res.status(500).json({ ok:false, error:'Server error' });
  }
});

app.post('/login-34475338', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ ok:false, error:'Invalid credentials' });
    if (user.password !== password) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }
    res.json({ ok:true, message:'Login successful', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok:false, error:'Server error' });
  }
});

app.get('/stats-34475338', async (req, res) => {
  try {
    const [recipes, inventory, users] = await Promise.all([
      Recipe.countDocuments(),
      Inventory.countDocuments(),
      User.countDocuments()
    ]);
    res.json({ recipes, inventory, users });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'stats_failed' });
  }
});

app.get('/view-recipes-34475338', async (req, res) => {
  try {
    const { userId, ownerId } = req.query;
    // verify actor
    const actor = await User.findOne({ userId });
    if (!actor) return res.status(404).json({ ok: false, error: 'User not found' });
    if (actor.role !== 'chef') {
      return res.status(403).json({ ok: false, error: 'Only chefs can view recipes' });
    }

    const filter = ownerId ? { ownerId } : {};
    const recipes = await Recipe.find(filter).sort({ createdAt: -1 });

    // Optionally enrich with owner names (like your A2 ownerMap)
    // const ownerIds = [...new Set(recipes.map(r => r.ownerId))];
    // const owners = await User.find({ userId: { $in: ownerIds } });
    // const ownerMap = Object.fromEntries(owners.map(o => [o.userId, o.fullname]));

    res.json({ ok: true, recipes /*, ownerMap*/ });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.post('/add-recipe-34475338', async (req, res) => {
  try {
    const {
      userId, title, chef, ingredients, instructions,
      mealType, cuisineType, prepTime, difficulty, servings
    } = req.body;

    // actor must exist & be chef
    const actor = await User.findOne({ userId });
    if (!actor) return res.status(404).json({ ok: false, error: 'User not found' });

    if (actor.role !== 'chef') {
      return res.status(403).json({ ok: false, error: 'Only chefs can manage recipes' });
    }

    // duplicate title per chef (case-insensitive), same as A2
    const existing = await Recipe.findOne({
      chef: { $regex: new RegExp(`^${chef}$`, 'i') },
      title: { $regex: new RegExp(`^${title}$`, 'i') }
    });
    if (existing) {
      return res.status(400).json({ ok: false, error: 'A recipe with this title already exists for this chef' });
    }

    // generate custom recipeId if you used it in A2
    let recipeId = undefined;
    if (typeof generateNextRecipeId === 'function') {
      recipeId = await generateNextRecipeId();
    }

    const recipe = new Recipe({
      recipeId,                 // may be undefined if you don’t use it
      userId,                   // actor id provided
      ownerId: userId,          // owner is creator (same as A2)
      title,
      chef,
      ingredients,              // keep as passed; enforce array in your schema if needed
      instructions: toInstructionArray(instructions),
      mealType,
      cuisineType,
      prepTime,
      difficulty,
      servings,
      createdDate: new Date()
    });

    await recipe.save();
    res.status(201).json({ ok: true, recipe });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ ok: false, error: errors.join(', ') });
    }
    if (err.code === 11000) {
      return res.status(400).json({ ok: false, error: 'Duplicate key' });
    }
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.put('/edit-recipe-34475338', async (req, res) => {
  try {
    const {
      userId, recipeId, title, chef, cuisineType, mealType,
      prepTime, difficulty, servings, ingredients, instructions
    } = req.body;

    const actor = await User.findOne({ userId });
    if (!actor) return res.status(404).json({ ok: false, error: 'User not found' });
    if (actor.role !== 'chef') {
      return res.status(403).json({ ok: false, error: 'Only chefs can manage recipes' });
    }

    const recipe = await findRecipeById(recipeId);
    if (!recipe) return res.status(404).json({ ok: false, error: 'Recipe not found' });

    // owner check (same as A2 intent)
    if (String(recipe.ownerId) !== String(userId)) {
      return res.status(403).json({ ok: false, error: 'You do not own this recipe' });
    }

    // duplicate title check excluding current recipe
    if (title && chef) {
      const dup = await Recipe.findOne({
        chef: { $regex: new RegExp(`^${chef}$`, 'i') },
        title: { $regex: new RegExp(`^${title}$`, 'i') },
        _id: { $ne: recipe._id }
      });
      if (dup) {
        return res.status(400).json({ ok: false, error: 'A recipe with this title already exists for this chef' });
      }
    }

    // normalize update doc
    const updateDoc = {
      ...(title !== undefined && { title }),
      ...(chef !== undefined && { chef }),
      ...(cuisineType !== undefined && { cuisineType }),
      ...(mealType !== undefined && { mealType }),
      ...(prepTime !== undefined && { prepTime }),
      ...(difficulty !== undefined && { difficulty }),
      ...(servings !== undefined && { servings }),
      ...(ingredients !== undefined && { ingredients: Array.isArray(ingredients) ? ingredients : Object.values(ingredients || {}) }),
      ...(instructions !== undefined && { instructions: toInstructionArray(instructions) })
    };

    const updated = await Recipe.findByIdAndUpdate(recipe._id, { $set: updateDoc }, { new: true, runValidators: true });
    res.json({ ok: true, recipe: updated });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ ok: false, error: errors.join(', ') });
    }
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.delete('/delete-recipe-34475338/:id', async (req, res) => {
  try {
    const { userId } = req.query; // actor
    const recipeId = req.params.id; // recipe to delete

    const actor = await User.findOne({ userId });
    if (!actor) return res.status(404).json({ ok: false, error: 'User not found' });
    if (actor.role !== 'chef') {
      return res.status(403).json({ ok: false, error: 'Only chefs can manage recipes' });
    }

    const recipe = await findRecipeById(recipeId);
    if (!recipe) return res.status(404).json({ ok: false, error: 'Recipe not found' });

    if (String(recipe.ownerId) !== String(userId)) {
      return res.status(403).json({ ok: false, error: 'You do not own this recipe' });
    }

    await Recipe.deleteOne({ _id: recipe._id });
    res.sendStatus(204); // no content
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Inventory Management API Endpoints

// Get all inventory items
app.get('/inventory-34475338', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Verify user exists
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    // Get all inventory items (shared inventory)
    const inventory = await Inventory.find().sort({ createdAt: -1 });
    res.json({ ok: true, inventory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Get single inventory item
app.get('/inventory-34475338/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    const { id } = req.params;
    
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    const item = await Inventory.findOne({ inventoryId: id });
    if (!item) return res.status(404).json({ ok: false, error: 'Inventory item not found' });

    res.json({ ok: true, item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Create new inventory item
app.post('/inventory-34475338', async (req, res) => {
  try {
    const { userId, ingredientName, quantity, unit, category, purchaseDate, expirationDate, location, cost } = req.body;
    
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    const inventoryId = await generateNextInventoryId();
    const createdDate = new Date();

    const newItem = new Inventory({
      inventoryId,
      userId,
      addedBy: userId,
      ingredientName,
      quantity,
      unit,
      category,
      purchaseDate: new Date(purchaseDate),
      expirationDate: new Date(expirationDate),
      location,
      cost,
      createdDate
    });

    await newItem.save();
    res.status(201).json({ ok: true, item: newItem });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ ok: false, error: errors.join(', ') });
    }
    if (err.code === 11000) {
      return res.status(400).json({ ok: false, error: 'Duplicate inventory ID' });
    }
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Update inventory item
app.put('/inventory-34475338/:id', async (req, res) => {
  try {
    const { userId, ingredientName, quantity, unit, category, purchaseDate, expirationDate, location, cost } = req.body;
    const { id } = req.params;
    
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    const updatedItem = await Inventory.findOneAndUpdate(
      { inventoryId: id },
      { 
        $set: { 
          ingredientName, 
          quantity, 
          unit, 
          category, 
          purchaseDate: new Date(purchaseDate), 
          expirationDate: new Date(expirationDate), 
          location, 
          cost 
        } 
      },
      { runValidators: true, new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ ok: false, error: 'Inventory item not found' });
    }

    res.json({ ok: true, item: updatedItem });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ ok: false, error: errors.join(', ') });
    }
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Delete inventory item
app.delete('/inventory-34475338/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    const { id } = req.params;
    
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    const deleted = await Inventory.deleteOne({ inventoryId: id });
    if (deleted.deletedCount === 0) {
      return res.status(404).json({ ok: false, error: 'Inventory item not found' });
    }

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// SPA fallback: serve Angular index.html for any other GET route
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});