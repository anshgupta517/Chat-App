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
  const [chats, setChats] = useState([]);
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

    socketRef.current.on('newChat', (chat) => {
      setChats(prev => {
        // Check if chat already exists
        const exists = prev.some(c => c._id === chat._id);
        if (!exists) {
          return [chat, ...prev];
        }
        return prev;
      });
    });

    // Fetch initial data
    fetchUsers();
    fetchChats();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [navigate]);

  // Effect to handle chat room joining/leaving
  useEffect(() => {
    if (selectedChat) {
      socketRef.current?.emit('join chat', selectedChat._id);
    }
    return () => {
      if (selectedChat) {
        socketRef.current?.emit('leave chat', selectedChat._id);
      }
    };
  }, [selectedChat]);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/user');
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    }
  };

  const fetchChats = async () => {
    try {
      const { data } = await axios.get('/api/chat');
      setChats(data);
      if (data && data.length > 0) {
        setSelectedChat(data[0]);
        fetchMessages(data[0]._id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Failed to fetch chats');
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const { data } = await axios.get(`/api/message/${chatId}`);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to fetch messages');
    }
  };

  const handleUserSelect = async (user) => {
    try {
      const { data } = await axios.post('/api/chat', { userId: user._id });
      setSelectedChat(data);
      fetchMessages(data._id);
    } catch (error) {
      console.error('Error creating chat:', error);
      setError('Failed to create chat');
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

      // Add message to local state immediately
      setMessages(prev => [...prev, data]);
      setNewMessage('');

      // Emit message through socket
      socketRef.current.emit('sendMessage', data);
    } catch (error) {
      console.error('Error sending message:', error);
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
          {chats.map(chat => (
            <div
              key={chat._id}
              className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
              onClick={() => {
                setSelectedChat(chat);
                fetchMessages(chat._id);
              }}
            >
              <div className="user-info">
                <img 
                  src={chat.users.find(u => u._id !== localStorage.getItem('userId'))?.pic} 
                  alt={chat.users.find(u => u._id !== localStorage.getItem('userId'))?.name} 
                  className="user-avatar" 
                />
                <div className="user-details">
                  <h4>{chat.users.find(u => u._id !== localStorage.getItem('userId'))?.name}</h4>
                  <p>{chat.users.find(u => u._id !== localStorage.getItem('userId'))?.email}</p>
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
                <img 
                  src={selectedChat.users.find(u => u._id !== localStorage.getItem('userId'))?.pic} 
                  alt={selectedChat.users.find(u => u._id !== localStorage.getItem('userId'))?.name} 
                  className="user-avatar" 
                />
                <h3>{selectedChat.users.find(u => u._id !== localStorage.getItem('userId'))?.name}</h3>
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