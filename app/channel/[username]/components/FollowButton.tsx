// components/FollowButton.tsx
"use client";
import { useState } from 'react';
import { followUser } from '../../../../lib/userProfile';

interface FollowButtonProps {
  currentUserEmail: string;
  targetUserEmail: string;
  showLoginModal: () => void;
}

const FollowButton = ({ currentUserEmail, targetUserEmail, showLoginModal }: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFollow = async () => {
    if (!currentUserEmail) {
      // setMessage('Please log in to follow users.');
      showLoginModal();
      return;
    }

    const response = await followUser(currentUserEmail, targetUserEmail);

    if (response.error) {
      setMessage(response.error);
    } else {
      setMessage(response.message || 'Successfully followed the user!');
      setIsFollowing(true);
    }
  };

return (
  <div>
    <button
      onClick={handleFollow}
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
      disabled={isFollowing}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
    {message && <p>{message}</p>}
  </div>
);


};

export default FollowButton;
