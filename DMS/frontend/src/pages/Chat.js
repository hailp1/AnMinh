import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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
      // Load user info and messages in parallel
      const [userResponse, messagesResponse] = await Promise.all([
        api.users.getById(userId),
        api.messages.getMessages(userId)
      ]);

      setTargetUser(userResponse);
      setMessages(messagesResponse);
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadChatData();
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto refresh messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (userId) {
        try {
          const updatedMessages = await api.messages.getMessages(userId);
          // Only update if length changed to avoid flickering/scroll issues
          // In a real app, you'd compare last message ID
          if (updatedMessages.length !== messages.length) {
            setMessages(updatedMessages);
          }
        } catch (error) {
          console.error('Error refreshing messages:', error);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [userId, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !user) return;

    try {
      const message = await api.messages.sendMessage(userId, newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
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
              <span className="avatar-emoji">{targetUser.avatar || '👤'}</span>
              {targetUser.isActive && <div className="online-indicator"></div>}
            </div>
            <div className="user-details">
              <h2 className="user-name">{targetUser.name}</h2>
              <p className="user-status">
                {targetUser.role && <span>Role: {targetUser.role}</span>}
                {targetUser.employeeCode && <span style={{ marginLeft: '10px' }}>MNV: {targetUser.employeeCode}</span>}
              </p>
              <p className="user-status">
                {targetUser.isActive ? (
                  <><span className="status-dot online"></span>Đang hoạt động</>
                ) : (
                  <><span className="status-dot offline"></span>Ngoại tuyến</>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="chat-header-right">
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
            {messages.map((message) => {
              const isMe = message.senderId === user.id;
              return (
                <div
                  key={message.id}
                  className={`message ${isMe ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    <p>{message.content}</p>
                    <span className="message-time">
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
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