"use client";
import { useState, useEffect } from 'react';
import { followUser } from '../../../../lib/userProfile';
import { supabase } from '../../../../lib/supabaseClient';

interface FollowButtonProps {
  currentUserEmail: string;
  targetUserEmail: string;
  showLoginModal: () => void;
  onFollowStatusChange: () => void;  // Added this line
}

const FollowButton = ({ currentUserEmail, targetUserEmail, showLoginModal, onFollowStatusChange }: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (!currentUserEmail) return;

      const { data, error } = await supabase
        .from('Users')
        .select('following')
        .eq('email', currentUserEmail)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      if (data && data.following && data.following.includes(targetUserEmail)) {
        setIsFollowing(true);
      }
    };

    checkFollowingStatus();
  }, [currentUserEmail, targetUserEmail]);

  const handleFollow = async () => {
    if (!currentUserEmail) {
      showLoginModal();
      return;
    }

    const response = await followUser(currentUserEmail, targetUserEmail);

    if (!response.error) {
      setIsFollowing(!isFollowing);
      onFollowStatusChange();  // Call the callback function to notify the change
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
      >
        {isFollowing ? 'Unfollow' : 'Follow'}
      </button>
    </div>
  );
};

export default FollowButton;
