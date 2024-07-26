import { useState, useEffect } from 'react';
import '../Templates/chat.css';
import chatData from '../data/chat.json';
import axios from 'axios';
import fs from 'fs';
import userIcon from '../assets/user-icon.png';

const ChatPage1 = () => {
  const [chatDataState, setChatDataState] = useState({});
  const [userQuery, setUserQuery] = useState('');

  useEffect(() => {
    setChatDataState(chatData);
  }, []);

  const handleSubmit = async () => {
    console.log('Submitted Query:', userQuery);
    const botResponse = await callBot(userQuery);
    setUserQuery('');
    saveChatData(userQuery, botResponse); // Call the function to save chat data
  }

  const callBot = async (prompt) => {
    console.log('callBot called with prompt:', prompt);
    const inputs = {
      input: {
        prompt: prompt,
        system_prompt:  `You are Lexi, a legal document drafter. Your aim is to write legal documents in an easily understandable language with less legal jargon. you cna use upto 1000 tokens to write the document.please write the documents with proper structure and format.`,
        max_new_tokens: 1000,
      },
    };

    try {
      console.log('Calling the chat server... with input: ', inputs);
      const response = await axios.post('http://localhost:3000/chat', inputs, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Chat server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error calling the chat server:', error);
      return '';
    }
  };

  const saveChatData = (userQuery, botResponse) => {
    const updatedChatData = {
      ...chatDataState,
      [userQuery]: botResponse,
    };
    setChatDataState(updatedChatData);
    const jsonData = JSON.stringify(updatedChatData, null, 2);
    fs.writeFile('./data/chat.json', jsonData, (err) => {
      if (err) {
        console.log('Done');
      } else {
        console.log('Successfully wrote to file');
      }
    });
  };



  return (
    <div className="chat-container">
      <h1>Lexi</h1>
      <div className="chat-history">
        {Object.entries(chatDataState).map(([user, botResponse], index) => (
          <div key={index} className="chat-entry">
            <div className="user-container">
              <img src={userIcon} className='user-icon-img'></img>
              <p className="user">{user}</p>
            </div>
            <p className='user-query'></p>
            
            <p className="bot">{botResponse}</p>
          </div>
        ))}
      </div>
      <div className="input-area">
        <textarea
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          placeholder="Enter your query..."
        />
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default ChatPage1;
