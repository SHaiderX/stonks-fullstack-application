// components/SettingsModal.tsx
"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface SettingsModalProps {
  closeModal: () => void;
  currentUserEmail: string;
}

const SettingsModal = ({ closeModal, currentUserEmail }: SettingsModalProps) => {
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [popupNotifications, setPopupNotifications] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('Users')
        .select('notification_pref')
        .eq('email', currentUserEmail)
        .single();

      if (error) {
        console.error(error);
        setErrorMessage('Failed to fetch settings.');
      } else if (data?.notification_pref) {
        setEmailNotifications(data.notification_pref.email);
        setPopupNotifications(data.notification_pref.popup);
      }
    };

    fetchSettings();
  }, [currentUserEmail]);

  const handleSave = async () => {
    const { error } = await supabase
      .from('Users')
      .update({
        notification_pref: {
          email: emailNotifications,
          popup: popupNotifications,
        },
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
      <div className="bg-white p-8 rounded shadow-md text-black">
        <h1 className="text-2xl mb-4">Notification Settings</h1>
        {errorMessage && <p className="mb-4 text-red-500">{errorMessage}</p>}
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
        <button onClick={closeModal} className="px-4 py-2 bg-gray-300 text-black rounded ml-2">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
