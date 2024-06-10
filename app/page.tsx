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
  const [activeChannels, setActiveChannels] = useState<Channel[]>([]); // State to store the list of active channels

  useEffect(() => {
    // Function to fetch active channels from the database
    const fetchActiveChannels = async () => {
      const { data, error } = await supabase
        .from('Users')
        .select('id, username, stream_url, profile_pic')
        .eq('is_live', true); // Fetch only users who are currently live

      if (error) {
        console.error('Error fetching active channels:', error); // Log any errors that occur during the fetch
        return;
      }

      if (data) {
        // Map through the data to add thumbnails to each channel
        const channelsWithThumbnails = await Promise.all(
          data.map(async (channel) => {
            const videoId = channel.stream_url.split('/embed/')[1]; // Extract video ID from the stream URL
            const thumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`; // Construct the thumbnail URL

            return {
              ...channel,
              thumbnail, // Add the thumbnail to the channel object
            };
          })
        );

        setActiveChannels(channelsWithThumbnails); // Update the state with the channels including thumbnails
      }
    };

    fetchActiveChannels(); // Call the function to fetch active channels
  }, []); // Dependency array is empty, so this effect runs only once on mount

  return (
    <Layout>
      <div className="max-w-6xl p-16">
        <h2 className="text-white text-2xl font-bold mb-4">Currently Live</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeChannels.map((channel) => (
            <Link key={channel.id} href={`/channel/${channel.username}`}>
              <div
                style={{
                  backgroundColor: '#0B0E0F',
                  overflow: 'hidden',
                  boxShadow: '4px 4px 6px -1px #7B28AC',
                  cursor: 'pointer',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  marginTop: '0.5rem',
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    '6px 6px 15px -3px #7B28AC, 4px 4px 6px -2px #7B28AC';
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    '4px 4px 6px -1px #7B28AC';
                }}
              >
                <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                  <img
                    src={channel.thumbnail}
                    alt={channel.username}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                  />
                </div>
                <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', backgroundColor: '#111' }}>
                  <img
                    src={channel.profile_pic || 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png'}
                    alt={channel.username}
                    style={{ width: '2rem', height: '2rem', borderRadius: '50%', marginRight: '1rem' }}
                  />
                  <h3 style={{ fontWeight: 'bold', color: 'white', flexGrow: 1 }}>{channel.username}</h3>
                  <span style={{ color: 'red', display: 'flex', alignItems: 'center' }}>
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
      </div>
    </Layout>
  );
};

export default HomePage;
