import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import MainContent from './components/MainContent';
import AuthModal from './components/Auth/AuthModal';
import UserLibrary from './components/UserLibrary';
import { Toaster } from 'sonner';
import { useUser, useAuth } from '@clerk/clerk-react';

// Function to fetch user library IDs (moved from MovieSearch)
const fetchUserLibraryIds = async (getToken) => {
  try {
      const token = await getToken({ template: 'supabase' });
      if (!token) return new Set(); // No token, return empty set

      const response = await fetch('/api/library', {
          headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
          console.error(`Failed to fetch library: ${response.statusText}`);
          return new Set(); // Return empty set on error
      }

      const data = await response.json();
      if (data && Array.isArray(data.library)) {
          return new Set(data.library.map(item => item.movie_id));
      }
      return new Set();
  } catch (error) {
      console.error("Error fetching user library IDs:", error);
      return new Set(); // Return empty set on exception
  }
};

function App() {
  const { user } = useUser();
  const { getToken, isSignedIn } = useAuth(); // Use Clerk's auth hook
  const [searchParams, setSearchParams] = useSearchParams();

  // State variables now controlled by query parameters
  const isAuthModalOpen = searchParams.get('auth') === 'open';
  const isLibraryOpen = searchParams.get('library') === 'open';

  // State to maintain saved movie IDs (lifted from MovieSearch)
  const [savedMovies, setSavedMovies] = useState(new Set());

  // Fetch saved movies when the component mounts or user logs in/out (lifted from MovieSearch)
  useEffect(() => {
    const loadLibrary = async () => {
      
      // Redirect unauthenticated users trying to open library
      if (!isSignedIn && isLibraryOpen) {
        // Use a function form to ensure we're working with the latest params
        setSearchParams(prevParams => {
          const newParams = new URLSearchParams(prevParams);
          newParams.delete('library');
          newParams.set('auth', 'open');
          return newParams;
        }, { replace: true }); // Use replace to avoid bad history entry
        setSavedMovies(new Set()); // Ensure library state is cleared
        return; // Stop further execution in this effect run
      }

      // Proceed to load library if signed in
      if (isSignedIn) {
        const libraryIds = await fetchUserLibraryIds(getToken);
        setSavedMovies(libraryIds);
      }
    };
    loadLibrary();
  }, [isSignedIn, getToken, isLibraryOpen, setSearchParams]); // Re-run when authentication state changes

  // Function to update query parameters (modified to handle replace option)
  const updateQueryParams = (key, value, options = {}) => {
    // Use functional update to avoid stale state issues with searchParams
    setSearchParams(prevParams => {
      const newParams = new URLSearchParams(prevParams);
      if (value) {
        newParams.set(key, 'open');
      } else {
        newParams.delete(key);
      }
      return newParams;
    }, options);
  };

  // Function to add a movie ID to the central state
  const addToSavedMovies = (movieId) => {
    setSavedMovies(prev => new Set([...prev, movieId]));
  };

  // Function to remove a movie ID from the central state
  const removeFromSavedMovies = (movieId) => {
    setSavedMovies(prev => {
      const newSet = new Set(prev);
      newSet.delete(movieId);
      return newSet;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <Helmet>
        <title>
          {/* Only set title here if Auth Modal is open, otherwise let child components handle it */}
          {isAuthModalOpen? 'Sign In / Sign Up - MovieMind': null}
        </title>
      </Helmet>

      <Header
        setIsAuthModalOpen={(isOpen) => updateQueryParams('auth', isOpen)}
        setIsLibraryOpen={(isOpen) => updateQueryParams('library', isOpen)}
      />
      {/* Add flex-grow to make main content take available space */}
      <MainContent
        className="flex-grow"
        isAuthModalOpen={isAuthModalOpen}
        setIsAuthModalOpen={(isOpen) => updateQueryParams('auth', isOpen)}
        user={user}
        savedMovies={savedMovies} // Pass down saved movies state
        addToSavedMovies={addToSavedMovies} // Pass down add function
      />
      <AuthModal
        isOpen={isAuthModalOpen}  // Controlled by URL param state
        onClose={() => updateQueryParams('auth', false)}
      />
      <UserLibrary
        isOpen={isLibraryOpen && isSignedIn} // Only truly open if URL param is set AND user is signed in
        onClose={() => updateQueryParams('library', false)} // Closing always removes the param
        removeFromSavedMovies={removeFromSavedMovies} // Pass down remove function
        user={user}
      />
      <Toaster position="top-center" />
      <Footer />
    </div>
  );
}

export default App;
