"use client";
import { ReactNode, useState } from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [search, setSearch] = useState('');

  const recommendedChannels = [
    { id: 1, name: 'Channel 1', username: 'channel1' },
    { id: 2, name: 'Channel 2', username: 'channel2' },
    { id: 3, name: 'Channel 3', username: 'channel3' },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/6 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Recommended Channels</h2>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="bg-gray-900 text-white p-4">
          <div className="max-w-4xl mx-auto flex items-center">
            <div className="flex-1 text-center">
              <input
                type="text"
                placeholder="Search"
                className="w-1/2 p-2 rounded bg-gray-700 text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="p-4 flex-1 bg-gray-100 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
