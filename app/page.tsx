"use client";
import Layout from '../components/layout';
import Link from 'next/link';

const HomePage = () => {
  const activeChannels = [
    { id: 1, name: 'Active Channel 1', username: 'activechannel1', thumbnail: '/path/to/thumbnail1.jpg' },
    { id: 2, name: 'Active Channel 2', username: 'activechannel2', thumbnail: '/path/to/thumbnail2.jpg' },
    { id: 3, name: 'Active Channel 3', username: 'activechannel3', thumbnail: '/path/to/thumbnail3.jpg' },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeChannels.map(channel => (
          <Link key={channel.id} href={`/channel/${channel.username}`}>
            <div className="bg-white rounded-lg overflow-hidden shadow-lg cursor-pointer">
              <img src={channel.thumbnail} alt={channel.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-bold">{channel.name}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export default HomePage;
