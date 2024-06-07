// components/ProfileCompletionModal.tsx
"use client";
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface ProfileCompletionModalProps {
  closeModal: () => void;
  currentUserEmail: string;
}

const ProfileCompletionModal = ({ closeModal, currentUserEmail }: ProfileCompletionModalProps) => {
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [popupNotifications, setPopupNotifications] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(e.target.files[0]);
    }
  };

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

  const handleSave = async () => {
    if (!username) {
      setErrorMessage('Username is required.');
      return;
    }

    const usernameExists = await checkUsernameExists(username);
    if (usernameExists) {
      setErrorMessage('Username already exists. Please choose another one.');
      return;
    }

    let profilePicUrl = 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png';
    if (profilePic) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pics')
        .upload(`public/${profilePic.name}`, profilePic);

      if (uploadError) {
        console.error(uploadError);
        setErrorMessage('Failed to upload profile picture.');
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('profile-pics')
        .getPublicUrl(uploadData.path);
      
      profilePicUrl = publicUrlData.publicUrl;
    }

    const { data: userData, error: userError } = await supabase
      .from('Users')
      .select('*')
      .eq('email', currentUserEmail);

    if (userError) {
      console.error(userError);
      setErrorMessage('Failed to fetch user data.');
      return;
    }

    if (userData.length === 0) {
      // User does not exist, create a new user
      const { error: insertError } = await supabase.from('Users').insert({
        email: currentUserEmail,
        username,
        profile_pic: profilePicUrl,
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
      // User exists, update the user
      const { error: updateError } = await supabase.from('Users').update({
        username,
        profile_pic: profilePicUrl,
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

    closeModal();
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
        <input type="file" onChange={handleProfilePicUpload} className="mb-2 p-2 border rounded w-full" />
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
