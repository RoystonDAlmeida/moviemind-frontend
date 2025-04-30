import MovieSearch from './MovieSearch/MovieSearch';

const MainContent = ({ user, setIsAuthModalOpen, savedMovies, addToSavedMovies }) => {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Discover Your Next Favorite Movie
        </h2>
        <p className="text-lg text-slate-300">
          Enter a movie you love and let our AI find similar films you'll enjoy.
        </p>
      </div>

      <MovieSearch 
        user={user} 
        onAuthRequired={() => setIsAuthModalOpen(true)}
        savedMovies={savedMovies} // Pass down
        addToSavedMovies={addToSavedMovies} // Pass down
      />
    </main>
  );
};

export default MainContent;
