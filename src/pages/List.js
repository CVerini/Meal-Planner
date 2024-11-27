import { useState, useEffect } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';

export default function List() {
    const navigate = useNavigate(); 

    const [meals, setMeals] = useState([]);

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
    
    const handleEditMeal = (mealId) => {
        const selectedMeal = meals.find(meal => meal._id === mealId);
        if (selectedMeal) {
            navigate('/editor', { state: { meal: selectedMeal } });
        }
    };      

    const handleRemoveMeal = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/api/meals/${id}`);
            setMeals(meals.filter(meal => meal._id !== id));
        } catch (error) {
            console.error('Failed to remove meal:', error);
        }
    };

    return (
        <>
            <h1>Meal List</h1>
            <Table striped bordered hover variant="dark" className='mb-3'>
                <thead>
                    <tr>
                        <th>Meal</th>
                        <th>Edit</th>
                        <th>Remove</th>
                    </tr>
                </thead>
                <tbody>
                    {meals.map((meal, index) => (
                        <tr key={index}>
                            <td>{meal.mealName}</td>
                            <td align='center'>
                                <div className='d-grid gap-2'>
                                    <Button variant='secondary' onClick={() => handleEditMeal(meal._id)}>Edit</Button>
                                </div>
                            </td>
                            <td align='center'>
                                <div className='d-grid gap-2'>
                                    <Button variant='secondary' onClick={() => handleRemoveMeal(meal._id)}>Remove</Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );
}
