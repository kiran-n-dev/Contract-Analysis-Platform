import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                setUser(null);
                setIsAuthenticated(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (userData) => {
        // After successful login, re-check auth status to get full user data from session
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const fetchedUserData = await response.json();
                setUser(fetchedUserData);
                setIsAuthenticated(true);
            } else {
                console.error('Failed to fetch user data after login');
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error fetching user data after login:', error);
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const logout = async () => {
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            if (response.ok) {
                setUser(null);
                setIsAuthenticated(false);
                navigate('/login'); // Redirect to login page after logout
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
