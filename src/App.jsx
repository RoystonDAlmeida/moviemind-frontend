import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MainContent from './components/MainContent';
import AuthModal from './components/Auth/AuthModal';
import UserLibrary from './components/UserLibrary';
import { Toaster } from 'sonner';
import { useUser } from '@clerk/clerk-react';

function App() {
  const { user } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();

  // State variables now controlled by query parameters
  const isAuthModalOpen = searchParams.get('auth') === 'open';
  const isLibraryOpen = searchParams.get('library') === 'open';

  // Function to update query parameters
  const updateQueryParams = (key, value) => {
    if (value) {
      searchParams.set(key, 'open');
    } else {
      searchParams.delete(key);
    }
    setSearchParams(searchParams);
  };

  // Update query parameters when state changes
  useEffect(() => {
    updateQueryParams('auth', isAuthModalOpen);
  }, [isAuthModalOpen]);

  useEffect(() => {
    updateQueryParams('library', isLibraryOpen);
  }, [isLibraryOpen]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
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
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => updateQueryParams('auth', false)}
      />
      <UserLibrary
        isOpen={isLibraryOpen}
        onClose={() => updateQueryParams('library', false)}
        user={user}
      />
      <Toaster position="top-center" />
      <Footer />
    </div>
  );
}

export default App;
