"use client";
import { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { useParams } from 'next/navigation';
import Layout from '../../../components/layout';

const ChannelPage = () => {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const { channel } = useParams();

  useEffect(() => {
    //TODO: Fetch channel data
  }, [channel]);

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
  };

  const handleFollow = () => {
    //TODO: Follow channel
  };

  const handleChatMessage = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
      setChatMessages([...chatMessages, (e.target as HTMLInputElement).value]);
      (e.target as HTMLInputElement).value = '';
    }
  };

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
          <div className="mt-4">
            <button
              onClick={handleFollow}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
            >
              Follow
            </button>
            <button
              onClick={toggleStreaming}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
            </button>
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
