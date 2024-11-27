import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Generator from './pages/Generator';
import List from './pages/List';
import Editor from './pages/Editor';
import 'bootstrap/dist/css/bootstrap.min.css';
import './pages/styles/Style.css';
import NavBar from './components/NavBar';

export default function App() {
    return (
        <div>
            <NavBar />
            <Router>
                <Routes>
                    <Route path="/" element={<Generator />} />
                    <Route path="/generator" element={<Generator />} />
                    <Route path="/list" element={<List />} />
                    <Route path="/editor" element={<Editor />} />
                </Routes>
            </Router>
        </div>
    );
}
