"use client";
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuth from '../hooks/useAuth';
import SignInModal from '../components/auth/SignInModal';
import SignUpModal from '../components/auth/SignUpModal';
import { supabase } from '../lib/supabaseClient';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState<boolean>(false);
  const isLoggedIn = useAuth();
  const router = useRouter();

  const recommendedChannels = [
    { id: 1, name: 'Channel 1', username: 'channel1' },
    { id: 2, name: 'Channel 2', username: 'channel2' },
    { id: 3, name: 'Channel 3', username: 'channel3' },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsModalOpen(false); // Ensure the profile modal closes on sign out
    router.push('/');
  };

  const handleSettings = () => {
    router.push('/settings');
    setIsModalOpen(false);
  };

  const handleLogin = () => {
    setIsSignInModalOpen(true);
  };

  const handleSignUp = () => {
    setIsSignUpModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Topbar */}
      <div className="bg-gray-900 text-white p-4 fixed w-full z-10 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={() => router.push('/')} className="text-xl font-bold">
            Logo
          </button>
        </div>
        <div className="flex items-center flex-grow justify-center">
          <input
            type="text"
            placeholder="Search"
            className="w-1/2 p-2 rounded bg-gray-700 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center">
          {isLoggedIn === null ? (
            <div className="w-20" /> // Placeholder div with fixed width to prevent shifting
          ) : isLoggedIn ? (
            <button onClick={() => setIsModalOpen(!isModalOpen)} className="w-10 h-10 bg-gray-500 rounded-full">
              {/* Profile pic empty for now */}
            </button>
          ) : (
            <>
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
              >
                Login
              </button>
              <button
                onClick={handleSignUp}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
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
        <div className="w-1/6 bg-gray-800 text-white p-4">
          <h2 className="text-xl font-bold mb-4 break-words">Recommended Channels</h2>
          <ul>
            {recommendedChannels.map(channel => (
              <li key={channel.id} className="mb-2">
                <Link href={`/channel/${channel.username}`}>
                  <span className="cursor-pointer">{channel.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col p-4 bg-gray-100 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Profile Modal */}
      {isModalOpen && (
        <div className="absolute top-16 right-4 z-20 bg-white p-4 rounded shadow-lg">
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mb-2 w-full"
          >
            Sign Out
          </button>
          <button
            onClick={handleSettings}
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 w-full"
          >
            Settings
          </button>
        </div>
      )}

      {/* Sign-In Modal */}
      {isSignInModalOpen && <SignInModal closeModal={() => setIsSignInModalOpen(false)} />}

      {/* Sign-Up Modal */}
      {isSignUpModalOpen && <SignUpModal closeModal={() => setIsSignUpModalOpen(false)} />}
    </div>
  );
};

export default Layout;
