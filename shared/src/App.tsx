import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { useUserfront, LoginForm, } from "@userfront/react";
import { SignupForm } from "@userfront/react";
import Users from './pages/Users';
import Dashboard from './pages/Dashboard';

function App() {
    const { tokens, user, logout } = useUserfront();
    const [showLogin, setShowLogin] = useState(true);

    const toggleForm = () => {
        setShowLogin(!showLogin);
    };

    const navigate = useNavigate();

    useEffect(() => {
        if (tokens && tokens.accessToken) {
            console.log('Tokens:', tokens);
            console.log('User:', user);
            navigate('/');
        } else {
            console.log('No tokens');
        }
    }, [tokens, user]); 

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    if (tokens && tokens.accessToken)
        return (
            <div>
                <p>Пользователь: {user?.email}</p>
                {/* <LogoutButton compact={false}/> */}
                <button onClick={handleLogout}>Выйти</button>
                <br />
                <nav>
                <ul>
                    <li>
                        <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/users">Users</Link>
                    </li>
                </ul>
                </nav>
        
                <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/login" element={<Users />} />
                    <Route path="/users" element={<Users />} />
                    {/* <Route path="/" element={<Dashboard />} /> */}
                </Routes>
            </div>
        );
    else

    return (
        <div>
            {tokens && tokens.accessToken ? (
                <div>
                    <p>Вы вошли</p>
                    <button onClick={handleLogout}>Выйти</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {showLogin ? <LoginForm /> : <SignupForm />}
                    <button
                        onClick={toggleForm}
                        style={{ marginTop: '10px' }} // Добавляем отступ сверху
                    >
                        {showLogin ? "Регистрация" : "Войти"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;