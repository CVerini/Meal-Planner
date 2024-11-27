const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors'); 

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/Meals', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define a schema
const mealSchema = new mongoose.Schema({
    mealName: String,
    mealServingsValue: {
        type: Number,
        min: [1, 'Meal servings must be at least 1'],
        get: v => parseFloat(v).toFixed(2),
        set: v => parseFloat(v),
        alias: 'mealServings'
    },
    mealCostValue: {
        type: Number,
        min: [0, 'Meal cost cannot be negative'],
        get: v => parseFloat(v).toFixed(2),
        set: v => parseFloat(v),
        alias: 'mealCost'
    },
    ingredients: [{
        ingredient: String,
        quantityValue: {
            type: Number,
            min: [0, 'Quantity cannot be negative'],
            get: v => parseFloat(v).toFixed(2),
            set: v => parseFloat(v),
            alias: 'quantity'
        },
        unit: String
    }]
});


const Meal = mongoose.model('Meal', mealSchema);

// Define a route to handle incoming POST requests
app.post('/api/meals', async (req, res) => {
    const mealData = req.body;
    try {
        const newMeal = new Meal(mealData);
        await newMeal.save();
        res.status(201).json({ message: 'Meal created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create meal' });
    }
});

// Define a route to handle incoming PUT requests to update a meal by ID
app.put('/api/meals/:id', async (req, res) => {
    const { id } = req.params;
    const { mealName, mealServingsValue, mealCostValue, ingredients } = req.body;

    const mealData = {
        mealName,
        mealServingsValue, 
        mealCostValue,     
        ingredients
    };

    console.log(`Processed meal data:`, mealData); // Log the final data sent to MongoDB

    try {
        const updatedMeal = await Meal.findByIdAndUpdate(id, mealData, { new: true, runValidators: true });
        if (!updatedMeal) {
            return res.status(404).json({ message: 'Meal not found' });
        }
        res.status(200).json({ message: 'Meal updated successfully', meal: updatedMeal });
    } catch (error) {
        console.error('Error updating meal:', error);  // Log any errors
        res.status(500).json({ message: 'Failed to update meal' });
    }
});

// Define a route to handle incoming GET requests to fetch meals
app.get('/api/meals', async (req, res) => {
    try {
        const meals = await Meal.find(); // Fetch all meals from the database
        const formattedMeals = meals.map(meal => ({
            ...meal._doc,
            ingredients: meal.ingredients.map(ingredient => ({
                ...ingredient._doc
            }))
        }));
        res.status(200).json(formattedMeals); // Send the formatted meals as a JSON response
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch meals' });
    }
});

// Define a route to handle incoming DELETE requests to delete a meal by ID
app.delete('/api/meals/:id', async (req, res) => {
    const { id } = req.params; // Get the meal ID from the request parameters
    try {
        const deletedMeal = await Meal.findByIdAndDelete(id); // Find and delete the meal by ID
        if (!deletedMeal) {
            return res.status(404).json({ message: 'Meal not found' }); // Return 404 if meal is not found
        }
        res.status(200).json({ message: 'Meal deleted successfully' }); // Send success message
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete meal' }); // Send error message
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
