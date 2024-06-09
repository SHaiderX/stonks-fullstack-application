"use client";
import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const RealtimeHandler = () => {
  const currentUserRef = useRef<any>(null); // Ref to hold the current user


  // Function to update the user's online status in the database
  const updateOnlineStatus = async (isOnline: boolean) => {
    const user = currentUserRef.current; // Get the current user from the ref
    if (user) {
      console.log(`Updating user ${user.email} online status to ${isOnline}`);
      await supabase
        .from('Users')
        .update({ is_online: isOnline })
        .eq('email', user.email);
    } else {
      console.error('No current user found.');
    }
  };

  // Effect to handle visibility changes of the document
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isOnline = !document.hidden;
      updateOnlineStatus(isOnline);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Dependency array is empty to ensure this runs only once

  // Effect to fetch the current user from Supabase on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data) {
        currentUserRef.current = data.user; // Update the ref
        await updateOnlineStatus(true); // Set user as online when component mounts
      }
    };
    fetchUser();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Effect to handle the beforeunload event
  useEffect(() => {
    const handleBeforeUnload = () => updateOnlineStatus(false);

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Dependency array is empty to ensure this runs only once

  return null; // This component does not render any UI
};

export default RealtimeHandler;
