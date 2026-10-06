import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(authService.getAccessToken());
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const profile = await authService.getProfile();
      if (profile) {
        const userData = {
          username: profile.username || '',
          email: profile.email || '',
          fullName: profile.full_name || '',
          dateOfBirth: profile.date_of_birth || '',
          age: profile.age,
          gender: profile.gender || '',
          phoneNumber: profile.phone_number || '',
          preferredLanguage: profile.preferred_language || 'English',
          bloodGroup: profile.blood_group || '',
          emergencyContactName: profile.emergency_contact_name || '',
          emergencyContactPhone: profile.emergency_contact_phone || '',
          allergies: profile.allergies || '',
          chronicConditions: profile.chronic_conditions || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          country: profile.country || 'India',
          isProfileCompleted: profile.is_profile_completed || false,
          completionPercentage: profile.completion_percentage || 0,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at
        };
        setUser(userData);
        if (userData.fullName || userData.username) {
          localStorage.setItem('user_name', userData.fullName || userData.username);
        }
        return userData;
      }
    } catch (e) {
      console.warn('[AuthContext] Could not fetch profile:', e);
    }
    return null;
  };

  useEffect(() => {
    const existingToken = authService.getAccessToken();
    if (existingToken) {
      setToken(existingToken);
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = async (username, password) => {
    const data = await authService.login(username, password);
    setToken(data.access);
    const profile = await fetchProfile();
    return { ...data, profile };
  };

  const registerUser = async (username, email, password, fullName, age, gender, phone, language) => {
    return await authService.register(username, email, password, fullName, age, gender, phone, language);
  };

  const updateUserProfile = async (profileData) => {
    const updated = await authService.updateProfile(profileData);
    await fetchProfile();
    return updated;
  };

  const logoutUser = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        user,
        token,
        loading,
        loginUser,
        registerUser,
        updateUserProfile,
        logoutUser,
        refreshProfile: fetchProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
