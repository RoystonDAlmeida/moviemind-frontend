// clerk-supabase.js

export async function syncUserToSupabase(user, token) {
  if (!user) {
    console.error('Error in syncUserToSupabase: User is missing');
    throw new Error('User is missing');
  }
  if (!token) {
    console.error('Error in syncUserToSupabase: Token is missing');
    throw new Error('Token is missing');
  }

  try {
    // Get OAuth account information if available
    const oauthAccount = user.externalAccounts?.[0];

    // Create a user object with/without OAuth data
    const userDataToSend = {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      first_name: user.firstName,
      last_name: user.lastName,
      avatar_url: user.imageUrl,
      oauth_provider: oauthAccount?.provider || null, // 'oauth_google' or 'oauth_github'
      oauth_id: oauthAccount?.externalId || null,
    };

    // sync-user edge function to add users to the table
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user: userDataToSend }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to sync user: HTTP ${response.status}`;
      if (response.status === 401) {
        errorMessage = 'Unauthorized: Invalid or missing JWT';
      } else if (response.status === 400) {
        errorMessage = 'Bad Request: Invalid user data';
      }
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch (e) {
        // If the response is not valid JSON, use the raw text
        if (errorText) errorMessage += ` - ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in syncUserToSupabase:', error);
    throw error;
  }
}