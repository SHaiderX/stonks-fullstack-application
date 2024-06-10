"use client";
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface ProfileCompletionModalProps {
  closeModal: () => void;
  currentUserEmail: string;
}

const ProfileCompletionModal = ({ closeModal, currentUserEmail }: ProfileCompletionModalProps) => {
  // State variables for user input and error messages
  const [username, setUsername] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState<string>('');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [popupNotifications, setPopupNotifications] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Function to validate image URL
  const validateImageUrl = (url: string): boolean => {
    const urlPattern = new RegExp('https?://.*\\.(?:png|jpg|jpeg|gif|bmp|webp)$', 'i');
    return urlPattern.test(url);
  };

  // Function to check if the username already exists
  const checkUsernameExists = async (username: string) => {
    const { data, error } = await supabase
      .from('Users')
      .select('username')
      .eq('username', username);

    if (error) {
      console.error(error);
      setErrorMessage('Error checking username. Please try again.');
      return true;
    }

    return data.length > 0;
  };

  // Function to handle saving the profile
  const handleSave = async () => {
    if (!username) {
      setErrorMessage('Username is required.');
      return;
    }

    // Check if the username already exists
    const usernameExists = await checkUsernameExists(username);
    if (usernameExists) {
      setErrorMessage('Username already exists. Please choose another one.');
      return;
    }

    // Validate the profile picture URL if provided
    if (profilePicUrl && !validateImageUrl(profilePicUrl)) {
      setErrorMessage('Please provide a valid image URL.');
      return;
    }

    // Set the default profile picture URL if not provided
    const defaultProfilePicUrl = 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png';
    const finalProfilePicUrl = profilePicUrl || defaultProfilePicUrl;

    // Fetch user data from the database
    const { data: userData, error: userError } = await supabase
      .from('Users')
      .select('*')
      .eq('email', currentUserEmail);

    if (userError) {
      console.error(userError);
      setErrorMessage('Failed to fetch user data.');
      return;
    }

    // If the user does not exist, create a new user
    if (userData.length === 0) {
      const { error: insertError } = await supabase.from('Users').insert({
        email: currentUserEmail,
        username,
        profile_pic: finalProfilePicUrl,
        notification_pref: {
          email: emailNotifications,
          popup: popupNotifications,
        },
      });

      if (insertError) {
        setErrorMessage('Failed to save profile.');
        return;
      }
    } else {
      // If the user exists, update the user data
      const { error: updateError } = await supabase.from('Users').update({
        username,
        profile_pic: finalProfilePicUrl,
        notification_pref: {
          email: emailNotifications,
          popup: popupNotifications,
        },
      }).eq('email', currentUserEmail);

      if (updateError) {
        setErrorMessage('Failed to update profile.');
        return;
      }
    }

    // Close the modal and reload the page
    closeModal();
    window.location.reload();
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded shadow-md text-black">
        <h1 className="text-2xl mb-4">Complete Your Profile</h1>
        {errorMessage && <p className="mb-4 text-red-500">{errorMessage}</p>}
        <input
          type="text"
          placeholder="Username"
          className="mb-2 p-2 border rounded w-full"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Profile Picture URL (optional)"
          className="mb-2 p-2 border rounded w-full"
          value={profilePicUrl}
          onChange={(e) => setProfilePicUrl(e.target.value)}
        />
        <div className="mb-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
            <span className="ml-2">Email Notifications</span>
          </label>
        </div>
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={popupNotifications}
              onChange={(e) => setPopupNotifications(e.target.checked)}
            />
            <span className="ml-2">Popup Notifications</span>
          </label>
        </div>
        <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded">
          Save
        </button>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;
