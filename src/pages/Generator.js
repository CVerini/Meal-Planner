import { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, InputGroup, Form, Button, Table } from 'react-bootstrap';

export default function Generator() {
    const [servings, setServings] = useState('');
    const [meals, setMeals] = useState([]);
    const [mealPlan, setMealPlan] = useState([]);
    const [ingredients, setIngredients] = useState([]);

    useEffect(() => {
        async function fetchMeals() {
            try {
                const response = await axios.get('http://localhost:3001/api/meals');
                setMeals(response.data);
            } catch (error) {
                console.error('Failed to fetch meals:', error);
            }
        }

        fetchMeals();
    }, []);

    const aggregateIngredients = (selectedMeals) => {
        const ingredientMap = new Map();

        selectedMeals.forEach(meal => {
            meal.ingredients.forEach(ingredient => {
                const key = `${ingredient.ingredient}-${ingredient.unit}`;
                if (ingredientMap.has(key)) {
                    ingredientMap.get(key).quantityValue += ingredient.quantityValue;
                } else {
                    ingredientMap.set(key, { ...ingredient, id: key });
                }
            });
        });

        return Array.from(ingredientMap.values());
    };

    const generateMealPlan = () => {
        let remainingServings = parseInt(servings);
        const selectedMeals = [];
        const availableMeals = [...meals];

        while (remainingServings > 0 && availableMeals.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableMeals.length);
            const meal = availableMeals.splice(randomIndex, 1)[0];

            selectedMeals.push(meal);
            remainingServings -= meal.mealServingsValue;
        
        }

        if (remainingServings > 0) {
            alert('Not enough meals to fulfill the servings requirement without repeats.');
        } else {
            setMealPlan(selectedMeals);
            setIngredients(aggregateIngredients(selectedMeals));
        }
    };

    const removeIngredient = (id) => {
        setIngredients(prevIngredients => prevIngredients.filter(ingredient => ingredient.id !== id));
    };

    return (
        <>
            <h1>Meal Plan Generator</h1>
            <Row>
                <Col></Col>
                <Col>
                    <InputGroup className='mb-3 p-3'>
                        <InputGroup.Text id='servings' className='bg-dark text-light'>Number of Servings</InputGroup.Text>
                        <Form.Control
                            type="number"
                            className='bg-dark text-light'
                            value={servings}
                            onChange={(e) => setServings(e.target.value)}
                            placeholder="Enter the number of servings"
                        />
                    </InputGroup>
                </Col>
                <Col></Col>
            </Row>
            <Row align='center'>
                <Col></Col><Col></Col>
                <Col>
                    <div className='d-grid gap-2'>
                        <Button
                            onClick={generateMealPlan}
                            style={{ padding: '5px 10px', fontSize: '0.9rem' }}
                        >
                            Generate Meal Plan
                        </Button>
                    </div>
                </Col>
                <Col></Col><Col></Col>
            </Row>
            <br/>

            {mealPlan.length > 0 && (
                <>
                    <h2>Meal Plan</h2>
                    <Table striped bordered hover variant="dark" className='mb-3'>
                        <thead>
                            <tr>
                                <th>Meal</th>
                                <th>Servings</th>
                                <th>Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mealPlan.map((meal, index) => (
                                <tr key={index}>
                                    <td>{meal.mealName}</td>
                                    <td>{meal.mealServingsValue}</td>
                                    <td>{meal.mealCostValue.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <h2>Ingredients List</h2>
                    <Table striped bordered hover variant="dark" className='mb-3'>
                        <thead>
                            <tr>
                                <th>Ingredient</th>
                                <th>Quantity</th>
                                <th>Unit</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ingredients.map((ingredient, index) => (
                                <tr key={index}>
                                    <td>{ingredient.ingredient}</td>
                                    <td>{ingredient.quantityValue}</td>
                                    <td>{ingredient.unit}</td>
                                    <td align='center'>
                                        <div className='d-grid gap-2'>
                                            <Button 
                                                variant="secondary" 
                                                size="sm" 
                                                onClick={() => removeIngredient(ingredient.id)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </>
            )}
        </>
    );
}
