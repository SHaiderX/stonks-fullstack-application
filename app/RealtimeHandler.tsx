"use client";
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-toastify';

interface NotificationPayload {
  new: {
    id: number;
    streamer: string;
    user: string;
  };
}

const RealtimeHandler = () => {
  const currentUserRef = useRef<any>(null); // Ref to hold the current user
  const [notification, setNotification] = useState<string | null>(null); // State to hold notification message
  const [user, setUser] = useState<any>(null); // State to trigger effect when user is set

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

  // Function to show notification
  const showNotification = async (streamer: string, notificationId: number) => {
    toast(`${streamer} has just went live!`, { autoClose: 3000, 
    onClick: () => window.location.href = `${window.location.origin}/channel/${streamer}` });

    // Update the notification as sent
    console.log(`Notification was just shown!!`);
    await supabase
      .from('notifications')
      .update({ sent: true })
      .eq('id', notificationId);
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
        setUser(data.user); // Trigger effect by setting user state
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

  // Effect to listen for notifications
  useEffect(() => {
    if (user) {
      console.log("Subbing to notification for user ", user.email);
      console.log(`Setting up real-time subscription for user: ${user.email}`);
      const subscription = supabase
        .channel(`notifications:user=eq.${user.email}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user=eq.${user.email}` }, (payload: NotificationPayload) => {
          console.log(`Received payload:`, payload);
          if (payload.new.user === user.email) {
            showNotification(payload.new.streamer, payload.new.id);
          }
        })
        .subscribe();

      return () => {
        console.log(`Removing real-time subscription for user: ${user.email}`);
        supabase.removeChannel(subscription);
      };
    }
  }, [user]); // Dependency array is now based on the state user

  return null; // Render notification if it exists
};

export default RealtimeHandler;
