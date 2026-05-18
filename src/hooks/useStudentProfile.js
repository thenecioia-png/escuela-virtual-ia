import { useState, useCallback } from 'react';
import { getStorage, setStorage } from '../utils/storage';

const DEFAULT_PROFILE = {
  name: '',
  age: null,
  avatar: '🦉',
  learningStyle: null, // 'visual' | 'auditivo' | 'kinestesico' | 'lector'
  interests: [],
  strengths: [],
  weaknesses: [],
  createdAt: null,
  onboardingComplete: false,
};

const AVATARS = ['🦉', '🦊', '🐢', '🦋', '🐼', '🦁', '🐰', '🐨', '🦄', '🐙'];

export function useStudentProfile() {
  const [profile, setProfile] = useState(() => getStorage('profile', DEFAULT_PROFILE));

  const updateProfile = useCallback((updates) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      setStorage('profile', next);
      return next;
    });
  }, []);

  const setLearningStyle = useCallback((style) => {
    updateProfile({ learningStyle: style });
  }, [updateProfile]);

  const addInterest = useCallback((interest) => {
    setProfile((prev) => {
      if (prev.interests.includes(interest)) return prev;
      const next = { ...prev, interests: [...prev.interests, interest] };
      setStorage('profile', next);
      return next;
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    updateProfile({ onboardingComplete: true, createdAt: Date.now() });
  }, [updateProfile]);

  const resetProfile = useCallback(() => {
    setStorage('profile', DEFAULT_PROFILE);
    setProfile(DEFAULT_PROFILE);
  }, []);

  return {
    profile,
    updateProfile,
    setLearningStyle,
    addInterest,
    completeOnboarding,
    resetProfile,
    avatars: AVATARS,
  };
}
