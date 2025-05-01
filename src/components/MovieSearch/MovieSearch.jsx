import { useState, useEffect, useCallback } from 'react'; // Added useEffect
import { useAuth } from '@clerk/clerk-react'; // Import useAuth hook
import { useSearchParams } from 'react-router-dom'; // Import useSearchParams
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import MovieGrid from './MovieGrid';
import LoadingSpinner from './LoadingSpinner';
import NoResults from './NoResults';
import ResultsCount from './ResultsCount';
import { toast } from 'sonner';

function MovieSearch({ user, onAuthRequired, savedMovies, addToSavedMovies }) {

  // Use Clerk's auth hook
  const { getToken, isSignedIn } = useAuth();

  // Get search params hook
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from search params or defaults
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('lang') || 'all');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || 'all');

  const [loading, setLoading] = useState(false); // Loading state for search results
  const [isAddingMovie, setIsAddingMovie] = useState(false); // Loading state for adding a movie

  const [recommendations, setRecommendations] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const [error, setError] = useState(null); // Error state for search

  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [availableGenres, setAvailableGenres] = useState([]);
  // Removed numResults state, can derive from filteredRecommendations.length

  // Use useCallback to memoize handleSearch
  const handleSearch = useCallback(async (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // --- Update URL Params on Search Trigger ---
    // Create a new URLSearchParams object based on the current ones
    const currentParams = new URLSearchParams(searchParams);
    // Set the 'q' parameter with the trimmed query
    currentParams.set('q', trimmedQuery);
    // Update the URL, replacing the current history entry
    // This ensures the URL reflects the search term *when* the search starts
    setSearchParams(currentParams, { replace: true });

    // Reset state before new search
    setRecommendations([]); // Clear previous results immediately
    setShowFilters(false); // Hide filters until new results arrive
    setLoading(true);
    setError(null);

    try {
      // Fetch Recommendations from backend
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: trimmedQuery, // Use trimmed query
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
  }, []);

  // Effect to run search when component mounts if 'q' param exists
  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      // Set the search query state (already done via useState initializer)
      // Trigger the search
      handleSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSearch]); // Add handleSearch as dependency (safe due to useCallback)

  // Effect to update URL when search query or filters change
  useEffect(() => {
    // Create a new URLSearchParams object based on the current ones
    // This preserves existing parameters like 'q'
    const currentParams = new URLSearchParams(searchParams);

    // Update filter parameters, removing them if 'all' is selected
    ['lang', 'type', 'genre'].forEach(key => {
      const value = { lang: selectedLanguage, type: selectedType, genre: selectedGenre }[key];
      if (value && value !== 'all') {
          currentParams.set(key, value);
      } else {
          currentParams.delete(key); // Remove if 'all' or undefined
      }
    });

    // Use replace: true to avoid adding unnecessary entries to browser history
    setSearchParams(currentParams, { replace: true });
  }, [selectedLanguage, selectedType, selectedGenre, searchParams, setSearchParams]);

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
      // Call the function passed from App to update the central state
      addToSavedMovies(movie.id);
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

  // Wrapper function for the SearchBar component to trigger search and update state
  const triggerSearch = () => {
    handleSearch(searchQuery); // Pass the current searchQuery state
  };

  return (
    <div className="space-y-8">
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={triggerSearch}
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
          savedMovies={savedMovies} // Pass the set of saved movie IDs received from props
          handleSaveMovie={handleAddToLibrary}
          isSaving={isAddingMovie} // Pass the adding state to potentially disable buttons
        />
      )}
    </div>
  );
}

export default MovieSearch;