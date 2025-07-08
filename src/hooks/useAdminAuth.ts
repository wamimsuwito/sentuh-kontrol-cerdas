
import { useState, useEffect } from 'react';

interface AdminUser {
  username: string;
  isLoggedIn: boolean;
}

export const useAdminAuth = () => {
  const [adminUser, setAdminUser] = useState<AdminUser>({
    username: '',
    isLoggedIn: false
  });

  // Check if admin is already logged in on mount
  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminAuth');
    if (savedAdmin) {
      const parsedAdmin = JSON.parse(savedAdmin);
      setAdminUser(parsedAdmin);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // Simple hardcoded authentication
    if (username === 'admin' && password === 'jakarta') {
      const user = { username, isLoggedIn: true };
      setAdminUser(user);
      localStorage.setItem('adminAuth', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAdminUser({ username: '', isLoggedIn: false });
    localStorage.removeItem('adminAuth');
  };

  return {
    adminUser,
    login,
    logout,
    isLoggedIn: adminUser.isLoggedIn
  };
};
