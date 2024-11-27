import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

export default function NavBar() {
    return(
        <>
            <Navbar bg="primary" data-bs-theme="dark" sticky='top'>
                <Container>
                    <Nav className="w-100 justify-content-between">
                        <Nav.Link href="generator">Generate Meal Plan</Nav.Link>
                        <Nav.Link href="list">Meal List</Nav.Link>
                        <Nav.Link href="editor">Create Meal</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
        </>
    );
}