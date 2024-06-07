"use client";
import { useState, useEffect, KeyboardEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '../../../components/layout';
import { supabase } from '../../../lib/supabaseClient';
import FollowButton from './components/FollowButton';

const ChannelPage = () => {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [channelData, setChannelData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false);
  const { username } = useParams();
  const router = useRouter();

  useEffect(() => {
    // Fetch channel data
    const fetchChannelData = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.error(error);
        setChannelData({ name: 'Unknown', profile_pic: '', email: '', following: [], followers: [], stream_url: '' });
      } else {
        setChannelData(data);
      }
    };

    // Fetch current user
    const fetchCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', user.email)
          .single();

        if (error) {
          console.error(error);
        } else {
          setCurrentUser(data);
        }
      }
    };

    fetchChannelData();
    fetchCurrentUser();
  }, [username]);

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
  };

  const handleChatMessage = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
      setChatMessages([...chatMessages, (e.target as HTMLInputElement).value]);
      (e.target as HTMLInputElement).value = '';
    }
  };

  if (!channelData) {
    return (
      <Layout>
        <div className="flex h-full">
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-200">
            <div className="relative w-full max-w-4xl h-96 bg-black">
              <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">Not Live</div>
            </div>
            <div className="mt-4 flex items-center">
              <div className="w-12 h-12 rounded-full mr-4 bg-gray-400" />
              <h1 className="text-2xl font-bold">Loading...</h1>
            </div>
            {/* <div className="mt-4">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                disabled
              >
                Follow
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                disabled
              >
                Start Streaming
              </button>
            </div> */}
          </div>
          <div className="w-1/4 bg-white p-4 border-l">
            <h3 className="text-xl font-bold mb-4">Chat</h3>
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto mb-4"></div>
              <input
                type="text"
                placeholder="Type a message..."
                className="p-2 border rounded w-full"
                disabled
              />
            </div>
          </div>
        </div>
      </Layout>
    );
  }


  const isSelf = currentUser && currentUser.username === username;

  return (
    <Layout>
      <div className="flex h-full">
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-200">
          <div className="relative w-full max-w-4xl h-96 bg-black">
            {isStreaming ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/jfKfPfyJRdk"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">Not Live</div>
            )}
          </div>
          <div className="mt-4 flex items-center">
            <img src={channelData.profile_pic || '/default_profile.png'} alt={channelData.name} className="w-12 h-12 rounded-full mr-4" />
            <h1 className="text-2xl font-bold">{channelData.username}</h1>
          </div>
          <div className="mt-4">
            {!isSelf && (
              <FollowButton
                currentUserEmail={currentUser ? currentUser.email : ''}
                targetUserEmail={channelData.email}
                showLoginModal={() => setIsSignInModalOpen(true)}
              />
            )}
            {isSelf && (
              <button
                onClick={toggleStreaming}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
              </button>
            )}
          </div>
        </div>
        <div className="w-1/4 bg-white p-4 border-l">
          <h3 className="text-xl font-bold mb-4">Chat</h3>
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto mb-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className="mb-2">
                  <span className="text-gray-700">{msg}</span>
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="Type a message..."
              className="p-2 border rounded w-full"
              onKeyDown={handleChatMessage}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChannelPage;
