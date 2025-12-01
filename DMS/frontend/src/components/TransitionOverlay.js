import React from 'react';
import { useAppTransition } from '../context/AppTransitionContext';

const TransitionOverlay = () => {
  const { isTransitioning, transitionType } = useAppTransition();

  if (!isTransitioning) return null;

  const getOverlayContent = () => {
    switch (transitionType) {
      case 'slide':
        return (
          <div className="transition-slide-overlay">
            <div className="slide-loader">
              <div className="slide-progress"></div>
            </div>
          </div>
        );
      case 'fade':
        return (
          <div className="transition-fade-overlay">
            <div className="fade-loader">
              <div className="fade-spinner"></div>
              <div className="fade-text">Đang tải...</div>
            </div>
          </div>
        );
      case 'scale':
        return (
          <div className="transition-scale-overlay">
            <div className="scale-loader">
              <div className="scale-circle"></div>
              <div className="scale-pulse"></div>
            </div>
          </div>
        );
      default:
        return (
          <div className="transition-default-overlay">
            <div className="default-loader">
              <div className="loader-spinner"></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`app-transition-overlay ${transitionType}`}>
      {getOverlayContent()}
    </div>
  );
};

export default TransitionOverlay;