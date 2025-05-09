
import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import io from 'socket.io-client';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatId = 'someChatId'; 


  const socket = io('http://localhost:5000'); // Adjust based on your backend URL

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await axios.get(`/api/message/${chatId}`);
      setMessages(data);
    };

    fetchMessages();
  }, [chatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage) return;

    const messageData = { content: newMessage, chatId, sender: { name: 'Your Name' } }; // Replace with actual sender info
    socket.emit('sendMessage', messageData);
    setNewMessage('');
  };

  return (
    <div>
      <h2>Chat</h2>
      <div>
        {messages.map((msg) => (
          <div key={msg._id}>
            <strong>{msg.sender.name}: </strong>
            {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;