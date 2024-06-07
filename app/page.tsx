"use client";
import { useEffect, useState } from 'react';
import Layout from '../components/layout';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

interface Channel {
  id: number;
  username: string;
  stream_url: string;
  thumbnail: string;
  profile_pic: string;
}

const HomePage = () => {
  const [activeChannels, setActiveChannels] = useState<Channel[]>([]);

  useEffect(() => {
    const fetchActiveChannels = async () => {
      const { data, error } = await supabase
        .from('Users')
        .select('id, username, stream_url, profile_pic')
        .eq('is_live', true);

      if (error) {
        console.error('Error fetching active channels:', error);
        return;
      }

      if (data) {
        const channelsWithThumbnails = await Promise.all(
          data.map(async (channel) => {
            const videoId = channel.stream_url.split('/embed/')[1];
            const thumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;

            return {
              ...channel,
              thumbnail,
            };
          })
        );

        setActiveChannels(channelsWithThumbnails);
      }
    };

    fetchActiveChannels();
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {activeChannels.map((channel) => (
          <Link key={channel.id} href={`/channel/${channel.username}`}>
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer">
              <img src={channel.thumbnail} alt={channel.username} className="w-full h-48 object-cover" />
              <div className="p-4 flex items-center">
                <img
                  src={channel.profile_pic || 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png'}
                  alt={channel.username}
                  className="w-8 h-8 rounded-full mr-4"
                />
                <h3 className="font-bold text-white flex-grow">{channel.username}</h3>
                <span className="text-red-500 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="10" />
                  </svg>
                  Live
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export default HomePage;
