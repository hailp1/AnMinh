import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  const navigateWithTransition = useCallback((path, options = {}) => {
    setIsTransitioning(true);
    
    // Add slide out animation
    document.body.classList.add('page-transitioning-out');
    
    setTimeout(() => {
      navigate(path, options);
      
      // Add slide in animation
      document.body.classList.remove('page-transitioning-out');
      document.body.classList.add('page-transitioning-in');
      
      setTimeout(() => {
        document.body.classList.remove('page-transitioning-in');
        setIsTransitioning(false);
      }, 300);
    }, 300);
  }, [navigate]);

  return {
    isTransitioning,
    navigateWithTransition
  };
};