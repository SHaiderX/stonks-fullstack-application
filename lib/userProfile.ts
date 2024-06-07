// lib/userProfile.ts
import { supabase } from './supabaseClient';

export const followUser = async (currentUserEmail: string, targetUserEmail: string) => {
  // Fetch current user profile
  const { data: currentUserProfile, error: currentUserError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', currentUserEmail)
    .single();

  if (currentUserError) {
    console.error(currentUserError);
    return { error: currentUserError.message };
  }

  // Fetch target user profile
  const { data: targetUserProfile, error: targetUserError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', targetUserEmail)
    .single();

  if (targetUserError) {
    console.error(targetUserError);
    // Update only the following list of the current user
    const updatedFollowingList = [...currentUserProfile.following, targetUserEmail];

    const { error: updateFollowingError } = await supabase
      .from('profiles')
      .update({ following: updatedFollowingList })
      .eq('email', currentUserEmail);

    if (updateFollowingError) {
      console.error(updateFollowingError);
      return { error: updateFollowingError.message };
    }

    return { success: true, message: 'Target user not found. Only updated the following list.' };
  }

  // Update both following and followers lists
  const updatedFollowingList = [...currentUserProfile.following, targetUserEmail];
  const updatedFollowersList = [...targetUserProfile.followers, currentUserEmail];

  const { error: updateFollowingError } = await supabase
    .from('profiles')
    .update({ following: updatedFollowingList })
    .eq('email', currentUserEmail);

  if (updateFollowingError) {
    console.error(updateFollowingError);
    return { error: updateFollowingError.message };
  }

  const { error: updateFollowersError } = await supabase
    .from('profiles')
    .update({ followers: updatedFollowersList })
    .eq('email', targetUserEmail);

  if (updateFollowersError) {
    console.error(updateFollowersError);
    return { error: updateFollowersError.message };
  }

  return { success: true };
};
