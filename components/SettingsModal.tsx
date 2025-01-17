"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface SettingsModalProps {
  closeModal: () => void;
  currentUserEmail: string;
}

const SettingsModal = ({ closeModal, currentUserEmail }: SettingsModalProps) => {
  // State variables for notification preferences, stream URL, profile picture URL, and error message
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [popupNotifications, setPopupNotifications] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [profilePicUrl, setProfilePicUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch user settings when the component mounts or currentUserEmail changes
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('Users')
        .select('notification_pref, stream_url, profile_pic')
        .eq('email', currentUserEmail)
        .single();

      if (error) {
        console.error(error);
        setErrorMessage('Failed to fetch settings.');
      } else if (data) {
        setEmailNotifications(data.notification_pref.email);
        setPopupNotifications(data.notification_pref.popup);
        setStreamUrl(data.stream_url || '');
        setProfilePicUrl(data.profile_pic || '');
      }
    };

    fetchSettings();
  }, [currentUserEmail]);

  // Validate YouTube URL
  const validateYouTubeUrl = (url: string) => {
    const regex = /^(https:\/\/www\.youtube\.com\/(watch\?v=|embed\/))[a-zA-Z0-9_-]+$/;
    return regex.test(url);
  };

  // Validate image URL
  const validateImageUrl = (url: string): boolean => {
    const urlPattern = new RegExp('https?://.*\\.(?:png|jpg|jpeg|gif|bmp|webp)$', 'i');
    return urlPattern.test(url);
  };

  // Handle save button click
  const handleSave = async () => {
    // Validate stream URL
    if (streamUrl && !validateYouTubeUrl(streamUrl)) {
      setErrorMessage('Invalid URL format. The URL must be in the format "https://www.youtube.com/watch?v=[ID]".');
      return;
    }

    // Validate profile picture URL
    if (profilePicUrl && !validateImageUrl(profilePicUrl)) {
      setErrorMessage('Please provide a valid image URL.');
      return;
    }

    const embedUrl = streamUrl.replace('watch?v=', 'embed/');

    // Update user settings in Supabase
    const { error } = await supabase
      .from('Users')
      .update({
        notification_pref: {
          email: emailNotifications,
          popup: popupNotifications,
        },
        stream_url: embedUrl,
        profile_pic: profilePicUrl,
      })
      .eq('email', currentUserEmail);

    if (error) {
      setErrorMessage('Failed to save settings.');
      return;
    }

    closeModal();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50">
      <div className="bg-gray-900 p-8 rounded shadow-md text-black">
        <h1 className="text-2xl text-white mb-4">Notification Settings</h1>
        {errorMessage && <p className="mb-4 text-red-500">{errorMessage}</p>}
        <div className="mb-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
            <span className="ml-2 text-white">Email Notifications</span>
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
            <span className="ml-2 text-white">Popup Notifications</span>
          </label>
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2">Change Stream URL</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=jfKfPfyJRdk"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2">Profile Picture URL (optional)</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={profilePicUrl}
            onChange={(e) => setProfilePicUrl(e.target.value)}
            placeholder="https://example.com/profile-pic.jpg"
          />
        </div>
        <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded">
          Save
        </button>
        <button onClick={closeModal} className="px-4 py-2 bg-gray-300 text-black rounded ml-2">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
