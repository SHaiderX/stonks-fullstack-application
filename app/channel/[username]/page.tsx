"use client";
import { useState, useEffect, KeyboardEvent, useRef } from 'react';
import { useParams } from 'next/navigation';
import Layout from '../../../components/layout';
import { supabase } from '../../../lib/supabaseClient';
import FollowButton from './components/FollowButton';
import useAuth from '../../../hooks/useAuth';
import SignInModal from '../../../components/auth/SignInModal';

interface Emote {
  name: string;
  url: string;
}

interface Params {
  username: string | string[];
}

interface User {
  username: string;
  email: string;
  is_live: boolean;
  followers: string[];
}

const ChannelPage = () => {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<{ user: string; message: string; isEmote: boolean }[]>([]);
  const [channelData, setChannelData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false);
  const [isEmotesPopupOpen, setIsEmotesPopupOpen] = useState<boolean>(false);
  const [emotes, setEmotes] = useState<Emote[]>([]);
  const params = useParams();
  const isLoggedIn = useAuth();
  const chatEndRef = useRef<HTMLDivElement>(null);

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
        setEmotes(data[0].emotes || []);
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

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const toggleStreaming = async () => {
    if (!currentUser) return;

    const newIsStreaming = !isStreaming;
    setIsStreaming(newIsStreaming);

    const { error } = await supabase
      .from('Users')
      .update({ is_live: newIsStreaming })
      .eq('username', currentUser.username);

    if (newIsStreaming) {
      if (currentUser.followers) {
        let followersList = typeof currentUser.followers === 'string' ? JSON.parse(currentUser.followers) : currentUser.followers;
        for (const followerEmail of followersList) {
          try {
            const { data: followerData, error } = await supabase
              .from('Users')
              .select('email, is_online, notification_pref')
              .eq('email', followerEmail)
              .single();
            if (error) continue;

            if (followerData.is_online && followerData.notification_pref.popup) { //If online and has allows popups, send push notification
              const { data, error: insertError } = await supabase
                .from('notifications')
                .insert([
                  {
                    streamer: currentUser.username,
                    user: followerData.email,
                    sent: false,
                  },
                ]);

              if (insertError) console.error(`Error inserting notification: ${insertError.message}`);
            } else if (!followerData.is_online && followerData.notification_pref.email) { //If offline and allows email notifications, send email
              console.log(`User ${currentUser.email} is live, sending email to follower ${followerData.email}`);
              fetch('/api/sendEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: followerData.email,
                  subject: `${currentUser.username} is live!`,
                  message: `${currentUser.username} is now live. Check it out!`,
                }),
              });
            }
          } catch (err) {
            console.error(`Error processing follower ${followerEmail}:`, err);
          }
        }
      }
    }

    if (error) {
      console.error('Failed to update streaming status:', error);
    }
  };

  const handleChatMessage = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
      setChatMessages([...chatMessages, { user: currentUser?.username || 'Unknown', message: (e.target as HTMLInputElement).value, isEmote: false }]);
      (e.target as HTMLInputElement).value = '';
    }
  };

  const handleEmoteClick = (emote: Emote) => {
    setChatMessages([...chatMessages, { user: currentUser?.username || 'Unknown', message: emote.url, isEmote: true }]);
    setIsEmotesPopupOpen(false);
  };

  const isSelf = currentUser && currentUser.username.toLowerCase() === username.toLowerCase();
  const streamUrl = channelData?.stream_url || "https://www.youtube.com/embed/jfKfPfyJRdk";

  return (
    <Layout>
      <div className="flex h-full text-white">
        <div className="flex-1 flex flex-col items-center justify-center">
          {channelData?.username === "doesn't exist" ? (
            <div className="flex items-center mt-4">
              <h1 className="text-2xl font-bold">User doesn't exist</h1>
            </div>
          ) : (
            <>
              <div className="relative w-full max-w-screen-xl h-auto">
                {isStreaming ? (
                  <iframe
                    className="w-full h-auto aspect-video"
                    src={streamUrl}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-auto aspect-video bg-black flex items-center justify-center text-white text-2xl">
                    Not Live
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center w-full max-w-screen-xl mt-4 px-4">
                <div className="flex items-center">
                  <img
                    src={channelData?.profile_pic || 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png'}
                    alt={channelData?.username}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <h1 className="text-2xl font-bold">{channelData?.username || "doesn't exist"}</h1>
                  <span className={`ml-4 flex items-center ${isStreaming ? 'text-red-500' : 'text-gray-500'}`}>
                    <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="10" />
                    </svg>
                    {isStreaming ? 'Live' : 'Offline'}
                  </span>
                </div>
                <div>
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
                      className="px-4 py-2 bg-gray-900 text-white rounded-full shadow-md transition-transform transform hover:scale-105 hover:shadow-lg"
                      style={{
                        boxShadow: '0 0 10px 4px rgba(128, 0, 128, 0.7)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                      onMouseOver={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px 6px rgba(128, 0, 128, 0.8)';
                      }}
                      onMouseOut={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 10px 4px rgba(128, 0, 128, 0.7)';
                      }}
                    >
                      {isStreaming ? 'Stop Streaming' : 'Go Live'}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        {channelData?.username !== "doesn't exist" && (
          <div className="w-1/4 bg-gray-800 p-4 h-full flex flex-col">
            <h3 className="text-xl font-bold mb-4">Chat</h3>
            <div className="flex-1 overflow-y-auto mb-2 custom-scrollbar" style={{ maxHeight: '70vh' }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} className="mb-2 break-words">
                  <span className="font-bold text-gray-300">{msg.user}</span>
                  {msg.isEmote ? (
                    <img src={msg.message} alt="emote" className="max-h-12 max-w-full" />
                  ) : (
                    <p className="text-gray-200">{msg.message}</p>
                  )}
                  <hr className="border-gray-700 my-2" />
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Type a message..."
                className="p-2 border rounded w-full bg-gray-700 text-white mr-2"
                onKeyDown={handleChatMessage}
              />
              <button
                className="px-2 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                onClick={() => setIsEmotesPopupOpen(!isEmotesPopupOpen)}
              >
                😀
              </button>
            </div>
            {isEmotesPopupOpen && (
              <div className="absolute bottom-16 right-4 bg-gray-800 p-4 rounded shadow-lg">
                {emotes.length === 0 ? (
                  <p className="text-gray-400">No channel emotes</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {emotes.map((emote) => (
                      <button key={emote.name} onClick={() => handleEmoteClick(emote)}>
                        <img src={emote.url} alt={emote.name} className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {isSignInModalOpen && <SignInModal closeModal={() => setIsSignInModalOpen(false)} />}
    </Layout>
  );
};

export default ChannelPage;
