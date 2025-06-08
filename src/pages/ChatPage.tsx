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
import { Navigate } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [channels, setChannels] = useState<StreamChannel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

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
        
        // Check if the client is already connected
        if (client.userID) {
          console.log('Stream Chat client already connected, reusing existing connection.');
          setChatClient(client);
          await loadChannels(client);
          setIsConnecting(false);
          return;
        }
        
        // Connect user to Stream Chat
        await client.connectUser(
          {
            id: user.id,
            name: user.name,
            image: user.avatar || undefined,
            role: user.role || 'user'
          },
          token
        );

        setChatClient(client);
        await loadChannels(client);
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize chat');
      } finally {
        setIsConnecting(false);
      }
    };

    const loadChannels = async (client: StreamChat) => {
      try {
        if (user?.role === 'admin') {
          // For admin: Get all support channels
          const filter = { 
            type: 'messaging',
            members: { $in: [user.id] }  // Include channels where admin is a member
          };
          const sort = { last_message_at: -1 };
          const channels = await client.queryChannels(filter, sort, {
            state: true,
            presence: true,
            limit: 10
          });
          setChannels(channels);
          
          if (channels.length > 0 && !selectedChannel) {
            setSelectedChannel(channels[0].id);
            setChannel(channels[0]);
          }
        } else {
          // For regular users: Get or create their support channel
          const channel = client.channel('messaging', `support-${user.id}`, {
            name: 'Customer Support',
            members: [user.id],
            created_by_id: user.id,
            configs: {
              typing_events: true,
              read_events: true,
              connect_events: true,
              reactions: true,
              replies: true,
              search: true,
              typing_indicators: {
                enabled: true
              }
            }
          });

          await channel.watch();
          setChannel(channel);
          setChannels([channel]);
        }
      } catch (err) {
        console.error('Error loading channels:', err);
        throw err;
      }
    };

    if (user) {
      initializeChat();
    }

    return () => {
      if (chatClient) {
        chatClient.disconnectUser().catch(console.error);
      }
    };
  }, [user, selectedChannel]);

  const handleChannelSelect = (channel: StreamChannel) => {
    setSelectedChannel(channel.id);
    setChannel(channel);
  };

  if (loading || isConnecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to chat...</p>
        </div>
      </div>
    );
  }

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

  if (!chatClient) {
    return null;
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Chat client={chatClient} theme="messaging light">
        {user?.role === 'admin' ? (
          <div className="flex h-full">
            <div className="w-1/4 border-r border-gray-200">
              <ChannelList
                filters={{ type: 'messaging' }}
                sort={{ last_message_at: -1 }}
                options={{ state: true, presence: true, limit: 10 }}
                Preview={({ channel }) => (
                  <div
                    className={`p-4 cursor-pointer hover:bg-gray-100 ${
                      selectedChannel === channel.id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => handleChannelSelect(channel)}
                  >
                    <h3 className="font-semibold">{channel.data?.name || 'Support Chat'}</h3>
                    <p className="text-sm text-gray-500">
                      {channel.state.messages[channel.state.messages.length - 1]?.text || 'No messages yet'}
                    </p>
                  </div>
                )}
              />
            </div>
            <div className="flex-1">
              {channel ? (
                <Channel channel={channel}>
                  <Window>
                    <ChannelHeader />
                    <MessageList />
                    <MessageInput />
                  </Window>
                  <Thread />
                </Channel>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Select a chat to start messaging</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Channel channel={channel!}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput />
            </Window>
            <Thread />
          </Channel>
        )}
      </Chat>
    </div>
  );
};

export default ChatPage;