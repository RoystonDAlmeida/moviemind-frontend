import { useState, useEffect } from 'react'; // Added useEffect
import { useAuth } from '@clerk/clerk-react'; // Import useAuth hook
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import MovieGrid from './MovieGrid';
import LoadingSpinner from './LoadingSpinner';
import NoResults from './NoResults';
import ResultsCount from './ResultsCount';
import { toast } from 'sonner';

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

function MovieSearch({ user, onAuthRequired }) {
  // Use Clerk's auth hook
  const { getToken, isSignedIn } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');

  const [loading, setLoading] = useState(false); // Loading state for search results
  const [isAddingMovie, setIsAddingMovie] = useState(false); // Loading state for adding a movie

  const [recommendations, setRecommendations] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const [error, setError] = useState(null); // Error state for search

  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [availableGenres, setAvailableGenres] = useState([]);
  // Removed numResults state, can derive from filteredRecommendations.length

  // State to maintain saved movie IDs
  const [savedMovies, setSavedMovies] = useState(new Set());

  // Fetch saved movies when the component mounts or user logs in/out
  useEffect(() => {
    const loadLibrary = async () => {
      if (isSignedIn) {
        const libraryIds = await fetchUserLibraryIds(getToken);
        setSavedMovies(libraryIds);
      } else {
        setSavedMovies(new Set()); // Clear library if user logs out
      }
    };
    loadLibrary();
  }, [isSignedIn, getToken]); // Re-run when authentication state changes


  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setRecommendations([]);
    setShowFilters(false);

    try {
      // Fetch Recommendations from backend
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery.trim(), // Trim query before sending
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch recommendations (${response.status})`);
      }

      if (!data || !Array.isArray(data.recommendations)) {
        console.error("Invalid recommendations response format:", data);
        throw new Error('Received invalid recommendations format');
      }

      setRecommendations(data.recommendations);
      setShowFilters(true);

      // Extract unique filters from the results
      const languages = new Set();
      const types = new Set();
      const genres = new Set();
      data.recommendations.forEach((movie) => {
        if (movie.languages) movie.languages.forEach((lang) => languages.add(lang));
        if (movie.type) types.add(movie.type);
        if (movie.genres) movie.genres.forEach((g) => genres.add(g));
      });
      // Sort filters for consistent display
      setAvailableLanguages(['all', ...Array.from(languages).sort()]);
      setAvailableTypes(['all', ...Array.from(types).sort()]);
      setAvailableGenres(['all', ...Array.from(genres).sort()]);

    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError(error.message || 'Failed to fetch recommendations');
      setRecommendations([]); // Clear results on error
      setShowFilters(false);
    } finally {
      setLoading(false);
    }
  };

  // --- Function to call backend API ---
  const handleAddToLibrary = async (movie) => {

    // Check auth status using Clerk's hook
    if (!isSignedIn) {
      onAuthRequired(); // Trigger login/signup flow
      return;
    }
    // Prevent multiple simultaneous adds
    if (isAddingMovie) return;

    setIsAddingMovie(true); // Set loading state for the button

    try {
      // 1. Get the authentication token from Clerk
      const supabaseAccessToken = await getToken({ template: 'supabase' }); // Use your Supabase template name

      if (!supabaseAccessToken) {
        // Handle missing token (e.g., session expired during interaction)
        toast.error('Authentication session issue. Please log in again.');
        onAuthRequired();
        throw new Error('Authentication token not available.');
      }

      // 2. Call the backend API endpoint
      const response = await fetch('/api/library/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 3. Include the token for authentication
          'Authorization': `Bearer ${supabaseAccessToken}`,
        },
        // 4. Send the movie object
        body: JSON.stringify({ movie: movie }),
      });

      // 5. Handle the response from the backend
      const result = await response.json();

      if (!response.ok) {
        // Handle specific auth/permission errors
        if (response.status === 401 || response.status === 403) {
             toast.error(result.error || 'Permission denied. Please log in again.');
             onAuthRequired(); // Prompt re-login
        }
        // Throw an error for other failed responses
        throw new Error(result.error || `Failed to add movie (${response.status})`);
      }

      // 6. Update frontend state on successful addition
      setSavedMovies(prev => new Set([...prev, movie.id]));
      toast.success(result.message || 'Added to your library');

    } catch (error) {
      console.error('Error saving movie via backend:', error);
      // Avoid showing duplicate toasts if already handled (e.g., 401/403/token missing)
      if (!error.message.includes('401') && !error.message.includes('403') && !error.message.includes('token not available')) {
          toast.error(error.message || 'Failed to add movie to library');
      }
    } finally {
      setIsAddingMovie(false); // Reset loading state for the button
    }
  };

  // Filter recommendations based on selected criteria
  const filteredRecommendations = recommendations.filter((movie) => {
    const languageMatch =
      selectedLanguage === 'all' ||
      (movie.languages && movie.languages.includes(selectedLanguage));
    const typeMatch = selectedType === 'all' || movie.type === selectedType;
    const genreMatch =
      selectedGenre === 'all' ||
      (movie.genres && movie.genres.includes(selectedGenre));
    return languageMatch && typeMatch && genreMatch;
  });

  return (
    <div className="space-y-8">
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        loading={loading} // Pass search loading state
        error={error}
      />

      {/* Show filters and count only when filters are active and results exist */}
      {showFilters && recommendations.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          {/* Show count of FILTERED results */}
          <ResultsCount numResults={filteredRecommendations.length} />
          <FilterBar
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            availableLanguages={availableLanguages}
            availableTypes={availableTypes}
            availableGenres={availableGenres}
          />
        </div>
      )}

      {/* Show loading spinner during search */}
      {loading && <LoadingSpinner />}

      {/* Show error message if search failed */}
      {!loading && error && (
          <div className="text-center text-red-500 py-4">{error}</div>
      )}

      {/* Show NoResults if search is done, no error, filters shown, but filtered list is empty */}
      {!loading && !error && showFilters && filteredRecommendations.length === 0 && (
          <NoResults message={recommendations.length > 0 ? "No movies match your current filter criteria." : "No recommendations found for your search."} />
      )}

      {/* Show movie grid if search is done, no error, and there are filtered results */}
      {!loading && !error && filteredRecommendations.length > 0 && (
        <MovieGrid
          movies={filteredRecommendations}
          savedMovies={savedMovies} // Pass the set of saved movie IDs
          handleSaveMovie={handleAddToLibrary}
          isSaving={isAddingMovie} // Pass the adding state to potentially disable buttons
        />
      )}
    </div>
  );
}

export default MovieSearch;