"use client";
import { useState, useEffect, KeyboardEvent } from 'react';
import { useParams } from 'next/navigation';
import Layout from '../../../components/layout';
import { supabase } from '../../../lib/supabaseClient';
import FollowButton from './components/FollowButton';
import useAuth from '../../../hooks/useAuth';
import SignInModal from '../../../components/auth/SignInModal';

const ChannelPage = () => {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [channelData, setChannelData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false);
  const params = useParams();
  const isLoggedIn = useAuth();

  // Ensure username is a string
  const username = Array.isArray(params.username) ? params.username[0] : params.username;

  useEffect(() => {
    const fetchChannelData = async () => {
      const { data, error } = await supabase
        .from('Users')
        .select('*')
        .ilike('username', username);

      if (error || data.length === 0) {
        setChannelData({ username: "doesn't exist", profile_pic: '' });
      } else {
        setChannelData(data[0]);
        setIsStreaming(data[0].is_live);
      }
    };

    const fetchCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('Users')
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

  const toggleStreaming = async () => {
    const newIsStreaming = !isStreaming;
    setIsStreaming(newIsStreaming);

    const { error } = await supabase
      .from('Users')
      .update({ is_live: newIsStreaming })
      .eq('username', currentUser.username);

    if (error) {
      console.error('Failed to update streaming status:', error);
    }
  };

  const handleChatMessage = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
      setChatMessages([...chatMessages, (e.target as HTMLInputElement).value]);
      (e.target as HTMLInputElement).value = '';
    }
  };

  const isSelf = currentUser && currentUser.username.toLowerCase() === username.toLowerCase();

  return (
    <Layout>
      <div className="flex h-full">
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-200">
          {channelData?.username === "doesn't exist" ? (
            <div className="flex items-center mt-4">
              <h1 className="text-2xl font-bold">User doesn't exist</h1>
            </div>
          ) : (
            <>
              <div className="flex items-center mt-4">
                <img
                  src={channelData?.profile_pic || 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png'}
                  alt={channelData?.username}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <h1 className="text-2xl font-bold">{channelData?.username || "doesn't exist"}</h1>
              </div>
              <div className="relative w-full max-w-4xl h-96 bg-black mt-4">
                {isStreaming ? (
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/jfKfPfyJRdk"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">
                    Not Live
                  </div>
                )}
              </div>
              <div className="mt-4">
                {!isSelf && (
                  <FollowButton
                    currentUserEmail={currentUser ? currentUser.email : ''}
                    targetUserEmail={channelData ? channelData.email : ''}
                    showLoginModal={() => setIsSignInModalOpen(true)}
                  />
                )}
                {isSelf && (
                  <button
                    onClick={toggleStreaming}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    {isStreaming ? 'Stop Streaming' : 'Go Live'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        {channelData?.username !== "doesn't exist" && (
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
        )}
      </div>
      {isSignInModalOpen && <SignInModal closeModal={() => setIsSignInModalOpen(false)} />}
    </Layout>
  );
};

export default ChannelPage;
