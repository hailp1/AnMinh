import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserById, getChatMessages, sendChatMessage } from '../utils/mockData';

const Chat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [targetUser, setTargetUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);

  const loadChatData = async () => {
    try {
      const userData = getUserById(userId);
      const chatMessages = getChatMessages(userId);
      
      setTargetUser(userData);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChatData();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto refresh messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (userId) {
        const updatedMessages = getChatMessages(userId);
        setMessages(updatedMessages);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;

    const message = sendChatMessage(userId, newMessage.trim(), true);
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Đang tải cuộc trò chuyện...</div>;
  }

  if (!targetUser) {
    return (
      <div className="chat-error">
        <h2>❌ Không tìm thấy người dùng</h2>
        <Link to="/map" className="btn-primary">← Quay lại bản đồ</Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="chat-error">
        <h2>🔐 Vui lòng đăng nhập để chat</h2>
        <Link to="/login" className="btn-primary">Đăng nhập</Link>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <Link to="/map" className="back-btn">
            <span className="back-icon">←</span>
          </Link>
          <div className="chat-user-info">
            <div className="user-avatar">
              <span className="avatar-emoji">{targetUser.avatar}</span>
              {targetUser.isOnline && <div className="online-indicator"></div>}
            </div>
            <div className="user-details">
              <h2 className="user-name">{targetUser.name}</h2>
              <p className="user-status">
                {targetUser.hub && <span>📍 Hub: {targetUser.hub}</span>}
                {targetUser.id && <span style={{ marginLeft: '10px' }}>🆔 Mã: {targetUser.id}</span>}
                {targetUser.distance && (
                  <span style={{ marginLeft: '10px' }}>
                    📏 {targetUser.distance < 1000 
                      ? `${Math.round(targetUser.distance)}m` 
                      : `${(targetUser.distance / 1000).toFixed(1)}km`}
                  </span>
                )}
              </p>
              <p className="user-status">
                {targetUser.isOnline ? (
                  <><span className="status-dot online"></span>Đang online</>
                ) : (
                  <><span className="status-dot offline"></span>Hoạt động {formatMessageTime(targetUser.lastSeen || targetUser.lastLogin)}</>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="chat-header-right">
          {targetUser.hub && (
            <div style={{ 
              padding: '5px 10px', 
              background: 'rgba(26, 92, 162, 0.1)', 
              borderRadius: '8px',
              fontSize: '12px',
              color: '#1a5ca2',
              marginRight: '10px'
            }}>
              {targetUser.hub}
            </div>
          )}
          <div className="chat-menu">
            <button className="menu-btn">⋮</button>
          </div>
        </div>
      </div>

      {/* Chat Navigation Menu */}
      <div className="chat-nav-menu">
        <button 
          className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <span className="nav-icon">💬</span>
          <span className="nav-text">Chat</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() => setActiveTab('location')}
        >
          <span className="nav-icon">📍</span>
          <span className="nav-text">Vị trí</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'rating' ? 'active' : ''}`}
          onClick={() => setActiveTab('rating')}
        >
          <span className="nav-icon">⭐</span>
          <span className="nav-text">Đánh giá</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <span className="nav-icon">📞</span>
          <span className="nav-text">Liên hệ</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'share' ? 'active' : ''}`}
          onClick={() => setActiveTab('share')}
        >
          <span className="nav-icon">🔗</span>
          <span className="nav-text">Chia sẻ</span>
        </button>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-icon">💬</div>
            <h3>Chưa có tin nhắn nào</h3>
            <p>Hãy bắt đầu cuộc trò chuyện với {targetUser.name}!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.fromCurrentUser ? 'sent' : 'received'}`}
              >
                <div className="message-content">
                  <p>{message.text}</p>
                  <span className="message-time">
                    {formatMessageTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="message-input-form">
        <div className="message-input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Nhắn tin cho ${targetUser.name}...`}
            className="message-input"
            maxLength={500}
          />
          <button 
            type="submit" 
            className="send-btn"
            disabled={!newMessage.trim()}
          >
            📤
          </button>
        </div>
      </form>

      {/* Quick Messages */}
      <div className="quick-messages">
        <div className="quick-messages-header">
          <span className="quick-title">Tin nhắn nhanh</span>
        </div>
        <div className="quick-messages-grid">
          <button 
            className="quick-msg-btn"
            onClick={() => setNewMessage('Chào bạn! 👋')}
          >
            <span className="quick-icon">👋</span>
            <span className="quick-text">Chào bạn</span>
          </button>
          <button 
            className="quick-msg-btn"
            onClick={() => setNewMessage('Bạn đang ở nhà thuốc nào vậy?')}
          >
            <span className="quick-icon">📍</span>
            <span className="quick-text">Hỏi vị trí</span>
          </button>
          <button 
            className="quick-msg-btn"
            onClick={() => setNewMessage('Trạm này sạc nhanh không bạn?')}
          >
            <span className="quick-icon">⚡</span>
            <span className="quick-text">Hỏi tốc độ</span>
          </button>
          <button 
            className="quick-msg-btn"
            onClick={() => setNewMessage('Cảm ơn bạn! 😊')}
          >
            <span className="quick-icon">😊</span>
            <span className="quick-text">Cảm ơn</span>
          </button>
          <button 
            className="quick-msg-btn"
            onClick={() => setNewMessage('Bạn có thể chia sẻ kinh nghiệm không?')}
          >
            <span className="quick-icon">💡</span>
            <span className="quick-text">Hỏi kinh nghiệm</span>
          </button>
          <button 
            className="quick-msg-btn"
            onClick={() => setNewMessage('Hẹn gặp lại! 👋')}
          >
            <span className="quick-icon">👋</span>
            <span className="quick-text">Tạm biệt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;