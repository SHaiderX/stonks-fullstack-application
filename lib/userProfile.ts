// lib/userProfile.ts
import { supabase } from './supabaseClient';

export const followUser = async (currentUserEmail: string, targetUserEmail: string) => {
  // Fetch current user profile
  const { data: currentUserProfile, error: currentUserError } = await supabase
    .from('Users')
    .select('*')
    .eq('email', currentUserEmail)
    .single();

  if (currentUserError) {
    console.error(currentUserError);
    return { error: currentUserError.message };
  }

  // Fetch target user profile
  const { data: targetUserProfile, error: targetUserError } = await supabase
    .from('Users')
    .select('*')
    .eq('email', targetUserEmail)
    .single();

  // Initialize following list if it doesn't exist
  const currentUserFollowing = currentUserProfile.following ? JSON.parse(currentUserProfile.following) : [];

  if (targetUserError) {
    console.error(targetUserError);
    // Update only the following list of the current user
    const updatedFollowingList = [...currentUserFollowing, targetUserEmail];

    const { error: updateFollowingError } = await supabase
      .from('Users')
      .update({ following: JSON.stringify(updatedFollowingList) })
      .eq('email', currentUserEmail);

    if (updateFollowingError) {
      console.error(updateFollowingError);
      return { error: updateFollowingError.message };
    }

    return { success: true, message: 'Target user not found. Only updated the following list.' };
  }

  // Initialize followers list if it doesn't exist
  const targetUserFollowers = targetUserProfile.followers ? JSON.parse(targetUserProfile.followers) : [];

  const isAlreadyFollowing = currentUserFollowing.includes(targetUserEmail);

  let updatedFollowingList;
  let updatedFollowersList;

  if (isAlreadyFollowing) {
    // Unfollow user
    updatedFollowingList = currentUserFollowing.filter((email: string) => email !== targetUserEmail);
    updatedFollowersList = targetUserFollowers.filter((email: string) => email !== currentUserEmail);
  } else {
    // Follow user
    updatedFollowingList = [...currentUserFollowing, targetUserEmail];
    updatedFollowersList = [...targetUserFollowers, currentUserEmail];
  }

  const { error: updateFollowingError } = await supabase
    .from('Users')
    .update({ following: JSON.stringify(updatedFollowingList) })
    .eq('email', currentUserEmail);

  if (updateFollowingError) {
    console.error(updateFollowingError);
    return { error: updateFollowingError.message };
  }

  const { error: updateFollowersError } = await supabase
    .from('Users')
    .update({ followers: JSON.stringify(updatedFollowersList) })
    .eq('email', targetUserEmail);

  if (updateFollowersError) {
    console.error(updateFollowersError);
    return { error: updateFollowersError.message };
  }

  return { success: true, message: isAlreadyFollowing ? 'Unfollowed successfully.' : 'Followed successfully.' };
};
