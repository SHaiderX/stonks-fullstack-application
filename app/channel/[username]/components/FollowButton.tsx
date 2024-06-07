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
      setMessage('Please log in to follow users.');
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
        className={`px-4 py-2 ${isFollowing ? 'bg-gray-500' : 'bg-blue-500'} text-white rounded hover:bg-blue-600`}
        disabled={isFollowing}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FollowButton;
