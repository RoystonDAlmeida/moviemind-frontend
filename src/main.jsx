// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider, useUser, useAuth } from '@clerk/clerk-react';
import App from './App';
import './index.css';
import { syncUserToSupabase } from './lib/clerk-supabase';
import { commonAppearance } from './utils/clerkConfig'; // Import the config

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

function Root() {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncError, setSyncError] = React.useState(null);
  const hasSyncedRef = React.useRef(false); // Add a ref to track if the user has been synced

  React.useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn && user && !isSyncing && !hasSyncedRef.current) { // Check if the user has already been synced
        setIsSyncing(true);
        setSyncError(null);
        try {
          // Get the token from 'supabase' template
          const token = await getToken({ template: "supabase" });

          if (!token) {
            throw new Error('Could not obtain valid token');
          }

          await syncUserToSupabase(user, token);
          hasSyncedRef.current = true; // Set the ref to true after syncing
        } catch (error) {
          console.error('Error syncing user:', error);
          setSyncError(error.message);
        } finally {
          setIsSyncing(false);
        }
      }
    };
    syncUser();
  }, [isSignedIn, user, isSyncing]); // Remove getToken from the dependency array

  // Reset hasSyncedRef when the user signs out
  React.useEffect(() => {
    if (!isSignedIn) {
      hasSyncedRef.current = false;
    }
  }, [isSignedIn]);

  return <App syncStatus={{ isSyncing, syncError }} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey} appearance={commonAppearance}> {/* Pass the config here */}
      <Root />
    </ClerkProvider>
  </React.StrictMode>,
);
