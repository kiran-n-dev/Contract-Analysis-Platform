import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
    const { isAuthenticated, logout } = useAuth();

    return (
        <header className="header">
            <h1 className="header-title">Contract Analysis Platform</h1>
            <nav className="header-nav">
                <ul>
                    <li><Link to="/">Dashboard</Link></li>
                    {isAuthenticated ? (
                        <>
                            <li><Link to="/upload">Upload Document</Link></li>
                            <li><button onClick={logout}>Logout</button></li>
                        </>
                    ) : (
                        <div className="header-auth-buttons">
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/register">Register</Link></li>
                        </div>
                    )}
                </ul>
            </nav>
        </header>
    );
};

export default Header;
