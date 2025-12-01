import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AppTransitionContext = createContext();

export const useAppTransition = () => {
  const context = useContext(AppTransitionContext);
  if (!context) {
    throw new Error('useAppTransition must be used within AppTransitionProvider');
  }
  return context;
};

export const AppTransitionProvider = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState('slide'); // slide, fade, scale
  const [transitionDirection, setTransitionDirection] = useState('forward'); // forward, backward
  const navigate = useNavigate();

  const startTransition = useCallback((type = 'slide', direction = 'forward') => {
    setTransitionType(type);
    setTransitionDirection(direction);
    setIsTransitioning(true);
    
    // Add transition class to body
    document.body.classList.add('app-transitioning');
    document.body.classList.add(`transition-${type}`);
    document.body.classList.add(`direction-${direction}`);
  }, []);

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
    
    // Remove transition classes
    document.body.classList.remove('app-transitioning');
    document.body.classList.remove(`transition-${transitionType}`);
    document.body.classList.remove(`direction-${transitionDirection}`);
  }, [transitionType, transitionDirection]);

  const navigateWithTransition = useCallback((
    path, 
    options = { 
      type: 'slide', 
      direction: 'forward', 
      delay: 300 
    }
  ) => {
    if (isTransitioning) return;

    startTransition(options.type, options.direction);

    // Phase 1: Exit animation
    setTimeout(() => {
      navigate(path);
      
      // Phase 2: Enter animation
      setTimeout(() => {
        endTransition();
      }, options.delay);
    }, options.delay);
  }, [isTransitioning, startTransition, endTransition, navigate]);

  const value = {
    isTransitioning,
    transitionType,
    transitionDirection,
    navigateWithTransition,
    startTransition,
    endTransition
  };

  return (
    <AppTransitionContext.Provider value={value}>
      {children}
    </AppTransitionContext.Provider>
  );
};