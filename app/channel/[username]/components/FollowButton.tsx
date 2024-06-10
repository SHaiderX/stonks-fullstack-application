"use client";
import { useState, useEffect } from 'react';
import { followUser } from '../../../../lib/userProfile';
import { supabase } from '../../../../lib/supabaseClient';

interface FollowButtonProps {
  currentUserEmail: string;
  targetUserEmail: string;
  showLoginModal: () => void;
  onFollowStatusChange: () => void;  // Callback to notify parent component of follow status change
}

const FollowButton = ({ currentUserEmail, targetUserEmail, showLoginModal, onFollowStatusChange }: FollowButtonProps) => {
  // State to track if the current user is following the target user
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  // Effect to check if the current user is already following the target user
  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (!currentUserEmail) return; // Exit if there's no current user email

      // Query the 'Users' table to check the 'following' list of the current user
      const { data, error } = await supabase
        .from('Users')
        .select('following')
        .eq('email', currentUserEmail)
        .single();

      if (error) {
        console.error(error); // Log any error
        return;
      }

      // If the 'following' list includes the target user's email, set 'isFollowing' to true
      if (data && data.following && data.following.includes(targetUserEmail)) {
        setIsFollowing(true);
      }
    };

    checkFollowingStatus();
  }, [currentUserEmail, targetUserEmail]); // Re-run effect if currentUserEmail or targetUserEmail changes

  // Handler for the follow/unfollow button click
  const handleFollow = async () => {
    if (!currentUserEmail) {
      showLoginModal(); // Show login modal if the user is not logged in
      return;
    }

    // Call followUser function to toggle follow status
    const response = await followUser(currentUserEmail, targetUserEmail);

    if (!response.error) {
      setIsFollowing(!isFollowing); // Toggle the 'isFollowing' state
      onFollowStatusChange();  // Notify parent component of follow status change
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
