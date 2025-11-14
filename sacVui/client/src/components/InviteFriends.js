import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const InviteFriends = () => {
  const { user, updateUser } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const appConfig = {
    name: 'Sapharco Sales',
    tagline: 'Sales Management System',
    url: 'https://sapharcosales.app',
    description: 'Quản lý đơn hàng cho Trình dược viên tại các nhà thuốc'
  };
  
  const shareContent = {
    title: `${appConfig.name} - ${appConfig.tagline}`,
    text: `🔋 Discover the smartest way to charge your EV!\n\n⚡ Features:\n• Find nearest charging stations\n• Real-time availability\n• Price comparison\n• GPS navigation\n• Station reviews\n\n📱 Join thousands of EV drivers:`,
    url: appConfig.url
  };

  const socialPlatforms = [
    {
      id: 'native',
      name: 'Share',
      icon: '📤',
      color: '#007AFF',
      action: 'native'
    },
    {
      id: 'copy',
      name: 'Copy Link',
      icon: '🔗',
      color: '#34C759',
      action: 'copy'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '📱',
      color: '#25D366',
      action: 'whatsapp'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      color: '#1877F2',
      action: 'facebook'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: '🐦',
      color: '#1DA1F2',
      action: 'twitter'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      color: '#0A66C2',
      action: 'linkedin'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: '✈️',
      color: '#0088CC',
      action: 'telegram'
    },
    {
      id: 'email',
      name: 'Email',
      icon: '📧',
      color: '#FF9500',
      action: 'email'
    }
  ];

  const handleShare = async (platform) => {
    setIsSharing(true);
    
    try {
      let success = false;
      const fullMessage = `${shareContent.text}\n\n${shareContent.url}`;
      
      switch (platform.action) {
        case 'native':
          if (navigator.share) {
            await navigator.share({
              title: shareContent.title,
              text: shareContent.text,
              url: shareContent.url
            });
            setMessage('✅ Shared successfully!');
            success = true;
          } else {
            // Fallback to copy
            await navigator.clipboard.writeText(fullMessage);
            setMessage('✅ Link copied to clipboard!');
            success = true;
          }
          break;
          
        case 'copy':
          await navigator.clipboard.writeText(fullMessage);
          setMessage('✅ Link copied to clipboard!');
          success = true;
          break;
          
        case 'whatsapp':
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
          window.open(whatsappUrl, '_blank', 'width=600,height=400');
          setMessage('✅ WhatsApp opened!');
          success = true;
          break;
          
        case 'facebook':
          const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareContent.url)}&quote=${encodeURIComponent(shareContent.text)}`;
          window.open(fbUrl, '_blank', 'width=600,height=400');
          setMessage('✅ Facebook opened!');
          success = true;
          break;
          
        case 'twitter':
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareContent.text)}&url=${encodeURIComponent(shareContent.url)}`;
          window.open(twitterUrl, '_blank', 'width=600,height=400');
          setMessage('✅ Twitter opened!');
          success = true;
          break;
          
        case 'linkedin':
          const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareContent.url)}`;
          window.open(linkedinUrl, '_blank', 'width=600,height=400');
          setMessage('✅ LinkedIn opened!');
          success = true;
          break;
          
        case 'telegram':
          const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareContent.url)}&text=${encodeURIComponent(shareContent.text)}`;
          window.open(telegramUrl, '_blank', 'width=600,height=400');
          setMessage('✅ Telegram opened!');
          success = true;
          break;
          
        case 'email':
          const emailSubject = encodeURIComponent(shareContent.title);
          const emailBody = encodeURIComponent(fullMessage);
          const emailUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;
          window.location.href = emailUrl;
          setMessage('✅ Email client opened!');
          success = true;
          break;
          
        default:
          break;
      }
      
      if (success) {
        // Award points to user
        const newPoints = (user.points || 0) + 50;
        updateUser({ ...user, points: newPoints });
        
        setTimeout(() => {
          setMessage('');
          setShowInviteModal(false);
        }, 2500);
      }
    } catch (error) {
      console.error('Share error:', error);
      setMessage('❌ Unable to share. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsSharing(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <button 
        onClick={() => setShowInviteModal(true)}
        className="nav-item-enhanced invite-btn"
        title="Invite friends and earn 50 points"
      >
        <span className="nav-icon">🎁</span>
        <span className="nav-text">Invite</span>
        <span className="invite-reward-badge">+50</span>
      </button>

      {showInviteModal && (
        <div className="modal-overlay-enhanced" onClick={() => setShowInviteModal(false)}>
          <div className="invite-modal-enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-enhanced">
              <div className="modal-title-section">
                <div className="modal-icon">🎁</div>
                <div className="modal-title-text">
                  <h3>Invite Friends</h3>
                  <p>Share Sapharco Sales and earn rewards</p>
                </div>
              </div>
              <button 
                className="modal-close-btn"
                onClick={() => setShowInviteModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content-enhanced">
              <div className="invite-preview">
                <div className="app-preview-card">
                  <div className="app-icon">⚡</div>
                  <div className="app-info">
                    <h4>{appConfig.name}</h4>
                    <p>{appConfig.tagline}</p>
                  </div>
                </div>
                <div className="reward-info">
                  <span className="reward-icon">⭐</span>
                  <span className="reward-text">Earn 50 points for each successful invite</span>
                </div>
              </div>
              
              <div className="share-options-grid">
                {socialPlatforms.map((platform) => (
                  <button 
                    key={platform.id}
                    className="share-option-btn"
                    onClick={() => handleShare(platform)}
                    disabled={isSharing}
                    style={{ '--platform-color': platform.color }}
                  >
                    <span className="platform-icon">{platform.icon}</span>
                    <span className="platform-name">{platform.name}</span>
                  </button>
                ))}
              </div>

              {message && (
                <div className={`share-message ${message.includes('✅') ? 'success' : 'error'}`}>
                  <span className="message-icon">
                    {message.includes('✅') ? '✅' : '❌'}
                  </span>
                  <span className="message-text">{message}</span>
                </div>
              )}

              <div className="invite-stats">
                <div className="stat-item">
                  <span className="stat-number">{user.invitedFriends || 0}</span>
                  <span className="stat-label">Friends Invited</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{(user.invitedFriends || 0) * 50}</span>
                  <span className="stat-label">Points Earned</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InviteFriends;