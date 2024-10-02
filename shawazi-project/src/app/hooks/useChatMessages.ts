import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import {v4 as uuidv4} from 'uuid';

interface Message {
  id: string;
  content: string;
  sender: string;
  receiverId: string;
  role: string;
  timestamp: string;
}
const useChatMessages = (currentUserId: string, currentUserRole: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe('chat-channel');
    channel.bind('new-message', (data: Message) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);
  const sendMessage = async (content: string, receiverId: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      content,
      sender: currentUserId,
      receiverId,
      role: currentUserRole,
      timestamp: new Date().toISOString(),
    };
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage),
      });
      if (!response.ok) {
        throw new Error(`Error sending message: ${response.statusText}`);
      }
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  return {
    messages,
    sendMessage,
  };
};
export default useChatMessages;




