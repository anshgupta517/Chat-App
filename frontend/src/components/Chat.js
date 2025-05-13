import React, { useState, useEffect, useRef } from 'react';
import axios from '../utils/axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import './Chat.css'

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Initialize socket connection
    socketRef.current = io('http://localhost:5000', {
      auth: {
        token
      }
    });

    // Socket event listeners
    socketRef.current.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Fetch initial data
    fetchUsers();
    fetchChats();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/user');
      setUsers(data);
    } catch (error) {
      setError('Failed to fetch users');
    }
  };

  const fetchChats = async () => {
    try {
      const { data } = await axios.get('/api/chat');
      if (data.length > 0) {
        setSelectedChat(data[0]);
        fetchMessages(data[0]._id);
      }
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch chats');
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const { data } = await axios.get(`/api/message/${chatId}`);
      setMessages(data);
    } catch (error) {
      setError('Failed to fetch messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const { data } = await axios.post('/api/message', {
        content: newMessage,
        chatId: selectedChat._id,
      });

      socketRef.current.emit('sendMessage', data);
      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (error) {
      setError('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="user-profile">
          <h3>Chats</h3>
        </div>
        <div className="chat-list">
          {users.map(user => (
            <div
              key={user._id}
              className={`chat-item ${selectedChat?._id === user._id ? 'active' : ''}`}
              onClick={() => setSelectedChat(user)}
            >
              <div className="user-info">
                <img src={user.pic} alt={user.name} className="user-avatar" />
                <div className="user-details">
                  <h4>{user.name}</h4>
                  <p>{user.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <div className="chat-user-info">
                <img src={selectedChat.pic} alt={selectedChat.name} className="user-avatar" />
                <h3>{selectedChat.name}</h3>
              </div>
            </div>

            <div className="messages-container">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`message ${message.sender._id === localStorage.getItem('userId') ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    <p>{message.content}</p>
                    <span className="message-time">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="message-input-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="message-input"
              />
              <button type="submit" className="send-button">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <h3>Select a chat to start messaging</h3>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Chat; 