import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useLocation } from 'react-router-dom';

export default function Editor() {
    const location = useLocation();
    const { meal } = location.state || { meal: null };

    useEffect(() => {
        if (meal) {
            setMealData({
                mealName: meal.mealName || '',
                mealServings: meal.mealServingsValue ? parseFloat(meal.mealServingsValue) : 0, // Ensure default is 0
                mealCost: meal.mealCostValue ? parseFloat(meal.mealCostValue) : 0.00, // Ensure default is 0.00
                ingredients: [...meal.ingredients]
            });
        }
    }, [meal]);

    const [mealData, setMealData] = useState({
        mealName: meal ? meal.mealName : '',
        mealServings: meal ? parseFloat(meal.mealServingsValue) : '', // Ensure default is an empty string for form handling
        mealCost: meal ? parseFloat(meal.mealCostValue) : '', // Ensure default is an empty string for form handling
        ingredients: meal ? [...meal.ingredients] : [{ ingredient: '', quantityValue: '', unit: '' }]
    });       

    const quantityRefs = useRef([]);

    const handleAddIngredient = () => {
        setMealData({
            ...mealData,
            ingredients: [...mealData.ingredients, { ingredient: '', quantityValue: '', unit: '' }]
        });
    };

    const handleRemoveIngredient = (index) => {
        const newIngredients = [...mealData.ingredients];
        newIngredients.splice(index, 1);
        setMealData({
            ...mealData,
            ingredients: newIngredients
        });
    };

    const handleIngredientChange = (index, key, value) => {
        const newIngredients = [...mealData.ingredients];
        newIngredients[index][key] = value;

        // Parse quantityValue as a number
        if (key === 'quantityValue') {
            newIngredients[index][key] = value === '' ? 0 : parseFloat(value) || 0; // Default to 0 if empty or NaN
        }

        setMealData({
            ...mealData,
            ingredients: newIngredients
        });
    };    

    const handleSubmit = async () => {
        try {
            // Ensure mealServings and mealCost are parsed as floats and fallback to 0 if empty
            const servings = mealData.mealServings ? parseFloat(mealData.mealServings) : 0;
            const cost = mealData.mealCost ? parseFloat(mealData.mealCost) : 0.00;

            console.log("Servings in input: ", mealData.mealServings)
            console.log("Servings parsed: ", servings)
    
            // Validate inputs
            if (isNaN(servings) || servings <= 0 || isNaN(cost) || cost < 0) {
                alert('Please enter valid numbers for Meal Servings and Meal Cost.');
                return; // Prevent submission if validation fails
            }
    
            const ingredients = mealData.ingredients.map(ingredient => {
                const quantityValue = parseFloat(ingredient.quantityValue); // Ensure quantityValue is a number
                return {
                    ...ingredient,
                    quantityValue: isNaN(quantityValue) ? 0 : quantityValue // Set to 0 if NaN
                };
            });
    
            const data = {
                ...mealData,
                mealServingsValue: servings,
                mealCostValue: cost,
                ingredients: ingredients
            };
    
            if (meal && meal._id) {
                await axios.put(`http://localhost:3001/api/meals/${meal._id}`, data);
                alert('Meal updated successfully');
            } else {
                await axios.post('http://localhost:3001/api/meals', data);
                alert('Meal created successfully');
            }
    
            setMealData({
                mealName: '',
                mealServingsValue: '',
                mealCostValue: '',
                ingredients: [{ ingredient: '', quantityValue: '', unit: '' }]
            });
        } catch (error) {
            console.error('Failed to save meal', error);
            alert('Failed to save meal');
        }
    };
    
    
    return (
        <>
            <h1>Meal Editor</h1>
            <Row>
                <Col>
                    <InputGroup className='mb-3 p-3'>
                        <InputGroup.Text id='mealName' className='bg-dark text-light'>Meal Name</InputGroup.Text>
                        <Form.Control
                            aria-describedby="name"
                            className='bg-dark text-light'
                            value={mealData.mealName}
                            onChange={(e) => setMealData({ ...mealData, mealName: e.target.value })}
                        />
                    </InputGroup>
                </Col>
                <Col>
                    <InputGroup className='mb-3 p-3'>
                        <InputGroup.Text id='mealServings' className='bg-dark text-light'>Meal Servings</InputGroup.Text>
                        <Form.Control
                            aria-describedby="servings"
                            className='bg-dark text-light'
                            type="number"
                            value={mealData.mealServings || ''} // Empty string if 0
                            onChange={(e) => {
                                const newServings = e.target.value === '' ? 0 : parseInt(e.target.value, 10); // Ensure empty string parses to 0
                                setMealData({ ...mealData, mealServings: newServings });
                            }}
                        />
                    </InputGroup>
                </Col>
                <Col>
                    <InputGroup className='mb-3 p-3'>
                        <InputGroup.Text id='mealCost' className='bg-dark text-light'>Meal Cost</InputGroup.Text>
                        <InputGroup.Text id='dollarSign' className='bg-dark text-light'>$</InputGroup.Text>
                        <Form.Control
                            aria-describedby="cost"
                            className='bg-dark text-light'
                            type="number"
                            step="0.01"
                            value={mealData.mealCost || ''} // Empty string if 0
                            onChange={(e) => {
                                const newCost = e.target.value === '' ? 0 : parseFloat(e.target.value); // Ensure empty string parses to 0.00
                                setMealData({ ...mealData, mealCost: newCost });
                            }}
                        />
                    </InputGroup>
                </Col>
            </Row>
            <Table striped bordered hover variant="dark" className='mb-3'>
                <thead>
                    <tr>
                        <th>Ingredient</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {mealData.ingredients.map((ingredient, index) => (
                        <tr key={index}>
                            <td>
                                <Form.Control
                                    value={ingredient.ingredient}
                                    onChange={(e) => handleIngredientChange(index, 'ingredient', e.target.value)}
                                    className='bg-dark text-light'
                                />
                            </td>
                            <td>
                                <Form.Control
                                    value={ingredient.quantityValue}
                                    onChange={(e) => handleIngredientChange(index, 'quantityValue', e.target.value)}
                                    className='bg-dark text-light'
                                    type="number"
                                    ref={el => quantityRefs.current[index] = el}
                                    onKeyPress={(e) => {
                                        if (isNaN(String.fromCharCode(e.which))) {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </td>
                            <td>
                                <Form.Control
                                    value={ingredient.unit}
                                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                                    className='bg-dark text-light'
                                />
                            </td>
                            <td align='center'>
                                <div className='d-grid gap-2'>
                                    <Button variant='secondary' onClick={() => handleRemoveIngredient(index)}>Remove</Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Row align='center'>
                <Col></Col>
                <Col>
                    <div className='d-grid gap-2'>
                        <Button onClick={handleAddIngredient}>Add Ingredient</Button>
                        <br></br>
                        <Button onClick={handleSubmit}>Submit Meal</Button>
                    </div>
                </Col>
                <Col></Col>
            </Row>
        </>
    );
}
