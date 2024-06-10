"use client";
import { ReactNode, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuth from '../hooks/useAuth';
import SignInModal from '../components/auth/SignInModal';
import SignUpModal from '../components/auth/SignUpModal';
import ProfileCompletionModal from '../components/auth/ProfileCompletionModal';
import SettingsModal from '../components/SettingsModal';
import { supabase } from '../lib/supabaseClient';

interface LayoutProps {
  children: ReactNode;
}

interface Channel {
  id: number;
  username: string;
  profile_pic: string;
  is_live: boolean;
  email: string;
}

const Layout = ({ children }: LayoutProps) => {
  const [search, setSearch] = useState(''); // State for the search input
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State for the profile modal
  const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false); // State for the sign-in modal
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState<boolean>(false); // State for the sign-up modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false); // State for the profile completion modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false); // State for the settings modal
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null); // State for the current user's email
  const [currentUserUsername, setCurrentUserUsername] = useState<string | null>(null); // State for the current user's username
  const [profilePicUrl, setProfilePicUrl] = useState<string>(''); // State for the profile picture URL
  const [followedChannels, setFollowedChannels] = useState<Channel[]>([]); // State for followed channels
  const [recommendedChannels, setRecommendedChannels] = useState<Channel[]>([]); // State for recommended channels
  const isLoggedIn = useAuth(); // Custom hook to check if the user is logged in
  const router = useRouter(); // Next.js router for navigation
  const modalRef = useRef<HTMLDivElement>(null); // Ref for the profile modal

  // Effect to fetch user profile data and followed/recommended channels
  useEffect(() => {
    const checkUserProfile = async () => {
      const { data: userResponse } = await supabase.auth.getUser();

      if (userResponse?.user?.email) {
        setCurrentUserEmail(userResponse.user.email);

        const { data, error } = await supabase
          .from('Users')
          .select('profile_pic, username, following')
          .eq('email', userResponse.user.email)
          .single();

        if (error) {
          console.error(error);
          setIsProfileModalOpen(true); // Open profile completion modal if there is an error
        } else {
          setProfilePicUrl(data?.profile_pic || 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png');
          setCurrentUserUsername(data?.username || '');

          const followedEmails = data?.following || [];

          if (followedEmails.length > 0) {
            // Fetch the profile pictures and live status for followed users
            const { data: followedUsers, error: followedUsersError } = await supabase
              .from('Users')
              .select('id, username, profile_pic, is_live, email')
              .in('email', followedEmails);

            if (followedUsersError) {
              console.error(followedUsersError);
            } else {
              setFollowedChannels(followedUsers);
            }

            const { data: recommended, error: recommendedError } = await supabase
              .from('Users')
              .select('id, username, profile_pic, is_live, email')
              .not('email', 'in', followedEmails);

            if (recommendedError) {
              console.error(recommendedError);
            } else {
              setRecommendedChannels(recommended);
            }
          } else {
            const { data: recommended, error: recommendedError } = await supabase
              .from('Users')
              .select('id, username, profile_pic, is_live, email');

            if (recommendedError) {
              console.error(recommendedError);
            } else {
              setRecommendedChannels(recommended);
            }
          }
        }
      }
    };

    if (isLoggedIn) {
      checkUserProfile();
    } else {
      const fetchRecommendedChannels = async () => {
        const { data, error } = await supabase.from('Users').select('id, username, profile_pic, is_live, email');

        if (error) {
          console.error(error);
        } else {
          setRecommendedChannels(data);
        }
      };

      fetchRecommendedChannels();
    }
  }, [isLoggedIn]);

  // Function to handle user sign-out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsModalOpen(false);
    router.push('/');
  };

  // Function to open settings modal
  const handleSettings = () => {
    setIsSettingsModalOpen(true);
    setIsModalOpen(false);
  };

  // Function to open sign-in modal
  const handleLogin = () => {
    setIsSignInModalOpen(true);
  };

  // Function to open sign-up modal
  const handleSignUp = () => {
    setIsSignUpModalOpen(true);
  };

  // Function to navigate to the current user's profile
  const handleProfile = () => {
    if (currentUserUsername) {
      router.push(`/channel/${currentUserUsername}`);
      setIsModalOpen(false);
    }
  };

  // Effect to handle clicks outside the profile modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0B0E0F] text-white">
      {/* Topbar */}
      <div className="bg-[#24272C] text-white p-4 fixed w-full z-10 flex justify-between items-center" style={{ background: 'linear-gradient(to right, #A4214A, #3C1FAC, #7C28AC)' }}>
        <div className="flex items-center">
          <button onClick={() => router.push('/')} className="text-xl font-bold flex items-center">
            <img src="/stonks.png" alt="Logo" className="h-8 w-auto" />
            <span style={{ fontWeight: 'bold', color: 'white', textShadow: '2px 2px 2px purple', marginLeft: '8px' }}>STONKS</span>
          </button>
        </div>
        <div className="flex items-center flex-grow justify-center">
          <input
            type="text"
            placeholder="Search"
            className="w-1/2 p-2 rounded bg-gray-900 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center">
          {isLoggedIn === null ? (
            <div className="w-20" /> // Placeholder div with fixed width to prevent shifting
          ) : isLoggedIn ? (
            <button onClick={() => setIsModalOpen(!isModalOpen)} className="w-10 h-10 rounded-full">
              <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
            </button>
          ) : (
            <>
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-[#9E2150] text-white rounded hover:bg-[#6E1838] mr-2"
              >
                Login
              </button>
              <button
                onClick={handleSignUp}
                className="px-4 py-2 bg-[#4120AC] text-white rounded hover:bg-[#2A1470]"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 mt-16">
        {/* Sidebar */}
        <div className="w-1/6 bg-[#191B1F] text-white p-4">
          {isLoggedIn ? (
            <>
              <div className="flex flex-col">
                {/* <h2 className="text-xl font-bold mb-4 truncate" style={{ fontSize: 'min(1.5vw, 1rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Followed Channels</h2> */}
                <ul>
                  {/* {followedChannels.length > 0 ? (
                    followedChannels.map((channel: Channel) => (
                      <li key={channel.id} className="mb-2 truncate flex items-center w-full">
                        <Link href={`/channel/${channel.username}`} className="w-full">
                          <div className="flex items-center space-x-2 p-1 w-full rounded hover:bg-gray-700 cursor-pointer">
                            <img
                              src={channel.profile_pic || 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png'}
                              alt={channel.username}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="flex-grow">{channel.username}</span>
                            <span className={`text-sm ${channel.is_live ? 'text-red-500' : 'text-gray-500'} ml-auto`}>
                              {channel.is_live ? '• Live' : 'Offline'}
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="mb-2">Not following any channels</li>
                  )} */}
                </ul>
                <h2 className="text-xl font-bold mb-4 mt-4 truncate" style={{ fontSize: 'min(1.5vw, 1rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>All Channels</h2>
                <ul>
                  {recommendedChannels.map((channel: Channel) => (
                    <li key={channel.id} className="mb-2 truncate flex items-center w-full">
                      <Link href={`/channel/${channel.username}`} className="w-full">
                        <div className="flex items-center space-x-2 p-1 w-full rounded hover:bg-gray-700 cursor-pointer">
                          <img
                            src={channel.profile_pic || 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png'}
                            alt={channel.username}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="flex-grow">{channel.username}</span>
                          <span className={`text-sm ${channel.is_live ? 'text-red-500' : 'text-gray-500'} ml-auto`}>
                            {channel.is_live ? '• Live' : 'Offline'}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4 truncate" style={{ fontSize: 'min(1.5vw, 1rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Recommended Channels</h2>
              <ul>
                {recommendedChannels.map((channel: Channel) => (
                  <li key={channel.id} className="mb-2 truncate flex items-center w-full">
                    <Link href={`/channel/${channel.username}`} className="w-full">
                      <div className="flex items-center space-x-2 p-1 w-full rounded hover:bg-gray-700 cursor-pointer">
                        <img
                          src={channel.profile_pic || 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png'}
                          alt={channel.username}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="flex-grow">{channel.username}</span>
                        <span className={`text-sm ${channel.is_live ? 'text-red-500' : 'text-gray-500'} ml-auto`}>
                          {channel.is_live ? '• Live' : 'Offline'}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col p-4 bg-[#0B0E0F] overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Profile Modal */}
      {isModalOpen && (
        <div ref={modalRef} className="absolute top-16 right-4 z-20 bg-gray-800 p-4 rounded shadow-lg">
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mb-2 w-full"
          >
            Sign Out
          </button>
          <button
            onClick={handleSettings}
            className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700 w-full"
          >
            Settings
          </button>
          <button
            onClick={handleProfile}
            className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700 w-full mt-2"
          >
            My Profile
          </button>
        </div>
      )}

      {/* Sign-In Modal */}
      {isSignInModalOpen && <SignInModal closeModal={() => setIsSignInModalOpen(false)} />}

      {/* Sign-Up Modal */}
      {isSignUpModalOpen && <SignUpModal closeModal={() => setIsSignUpModalOpen(false)} />}

      {/* Settings Modal */}
      {isSettingsModalOpen && currentUserEmail && (
        <SettingsModal
          closeModal={() => setIsSettingsModalOpen(false)}
          currentUserEmail={currentUserEmail}
        />
      )}

      {/* Profile Completion Modal */}
      {isProfileModalOpen && currentUserEmail && (
        <ProfileCompletionModal
          closeModal={() => setIsProfileModalOpen(false)}
          currentUserEmail={currentUserEmail}
        />
      )}
    </div>
  );
};

export default Layout;
