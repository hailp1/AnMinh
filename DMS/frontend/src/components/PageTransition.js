import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const location = useLocation();

  useEffect(() => {
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname, children]);

  return (
    <div className={`page-transition-container ${isTransitioning ? 'transitioning' : ''}`}>
      <div className="page-content">
        {displayChildren}
      </div>
      {isTransitioning && (
        <div className="page-transition-overlay">
          <div className="transition-loader">
            <div className="loader-circle"></div>
            <div className="loader-text">Đang tải...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageTransition;