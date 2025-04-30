import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Card } from './ui/card';
import { Film, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

function UserLibrary({ isOpen, onClose, user, removeFromSavedMovies }) {
  const { getToken, isSignedIn } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(null); // State to track which movie is being removed

  useEffect(() => {
    if (isOpen && isSignedIn) {
      fetchLibrary();
    }
    else if(!isSignedIn) {
      // Clear movies if user is not signed in when dialog is interacted with
      setMovies([]);
      setLoading(false);
    }
    // Reset loading state if dialog closes
    if (!isOpen) {
      setLoading(true); // Reset loading for next open
    }
  }, [isOpen, isSignedIn, getToken]);

  // Fetch user library with saved movies
  const fetchLibrary = async () => {
    setLoading(true);
    try {
      // 1. Get the authentication token
      const token = await getToken({ template: 'supabase' });
      if (!token) {
        // Handle case where token is unavailable (e.g., session expired)
        toast.error('Authentication session issue. Please log in again.');

        // Optionally call a re-auth function if available
        throw new Error('Authentication token not available.');
      }

      // 2. Call the backend endpoint
      const response = await fetch('/api/library', {
        method: 'GET',
        headers: {
          // 3. Include the token for authentication
          'Authorization': `Bearer ${token}`,
        },
      });

      // 4. Handle the response
      const data = await response.json();

      if (!response.ok) {
        // Use error message from backend if available
        throw new Error(data.error || `Failed to load library (${response.status})`);
      }

      // 5. Update state with data from backend
      // Ensure the backend returns the full movie details needed for display
      setMovies(data.library || []);

    } catch (error) {
      console.error('Error fetching library via backend:', error);
      // Avoid duplicate toasts if token error was already shown
      if (!error.message.includes('token not available')) {
          toast.error(error.message || 'Failed to load your library');
      }
      setMovies([]); // Clear movies on error
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (movieId) => {

    // Check auth status and prevent double clicks
    if (!isSignedIn || isRemoving === movieId) return;

    setIsRemoving(movieId); // Set loading state for this specific movie

    try {
        // 1. Get the authentication token
        const token = await getToken({ template: 'supabase' });
        if (!token) {
            toast.error('Authentication session issue. Please log in again.');
            // Optionally trigger re-auth if needed
            throw new Error('Authentication token not available.');
        }

        // 2. Call the backend DELETE endpoint
        const response = await fetch(`/api/library/${movieId}`, { 
            method: 'DELETE',
            headers: {
                // 3. Include the token for authentication
                'Authorization': `Bearer ${token}`,
            },
        });

        // 4. Handle the response
        let result = {};
        if (response.status !== 204) {
            try {
                result = await response.json(); // Try parsing JSON if not 204
            } catch (e) {
                // Handle cases where response is not JSON even if not 204
                console.warn("Response was not JSON:", response.statusText);
            }
        }


        if (!response.ok) {
            // Handle specific auth/permission errors
            if (response.status === 401 || response.status === 403) {
                toast.error(result.error || 'Permission denied. Please log in again.');
                // Optionally trigger re-auth
            }
            // Throw an error for other failed responses
            throw new Error(result.error || `Failed to remove movie (${response.status})`);
        }

        // 5. Update frontend state on successful removal
        // Update local list for immediate UI feedback within the dialog
        setMovies(prevMovies => prevMovies.filter(m => m.movie_id !== movieId));
        // Call the function passed from App to update the central state
        removeFromSavedMovies(movieId);
        toast.success(result.message || 'Movie removed from library'); // Use message from backend if available

    } catch (error) {
        console.error('Error removing movie via backend:', error);
        // Avoid duplicate toasts if token error was already shown
        if (!error.message.includes('token not available')) {
            toast.error(error.message || 'Failed to remove movie');
        }
    } finally {
        setIsRemoving(null); // Reset loading state regardless of success/failure
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-slate-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">My Movie Library</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Film className="mx-auto h-12 w-12 mb-4" />
            <p>Your library is empty. Start adding movies you love!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {movies.map((movie) => (
              <Card key={movie.movie_id} className="bg-slate-800 border-slate-700 overflow-hidden">
                <div className="flex">
                  <div className="w-24 h-36 bg-slate-900 flex-shrink-0">
                    {movie.poster ? (
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="h-8 w-8 text-slate-700" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold truncate text-white">{movie.title}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(movie.movie_id)}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{movie.year}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {movie.genres?.map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-xs"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default UserLibrary;