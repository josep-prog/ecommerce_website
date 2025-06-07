import React, { useEffect, useState } from 'react';
import { StreamChat, Channel as StreamChannel } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Video, Phone, Paperclip, Smile } from 'lucide-react';
import 'stream-chat-react/dist/css/v2/index.css';
import axios from 'axios';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        if (!user) {
          throw new Error('User not authenticated');
        }

        // Verify environment variables
        if (!import.meta.env.VITE_API_URL || !import.meta.env.VITE_STREAM_API_KEY) {
          throw new Error('Missing required environment variables');
        }

        // Get token from backend
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/chat-token`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.data.token) {
          throw new Error('Failed to get chat token');
        }

        const { token } = response.data;

        // Initialize Stream Chat client
        const client = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);
        
        // Connect user to Stream Chat with retry logic
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            await client.connectUser(
              {
                id: user.id,
                name: user.name,
                image: user.avatar || undefined,
              },
              token
            );
            break;
          } catch (err) {
            retryCount++;
            if (retryCount === maxRetries) {
              throw new Error('Failed to connect to chat after multiple attempts');
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }

        // Create or get support channel
        const channel = client.channel('messaging', 'support', {
          name: 'Customer Support',
          members: [user.id],
        });

        await channel.watch();
        setChatClient(client);
        setChannel(channel);
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize chat');
      } finally {
        setIsConnecting(false);
      }
    };

    initializeChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser().catch(console.error);
      }
    };
  }, [user]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 p-4 rounded-lg bg-red-50">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isConnecting || !chatClient || !channel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Chat client={chatClient} theme="messaging light">
        <Channel channel={channel}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;