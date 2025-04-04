import { useState } from 'react';
import Header from './components/Header';
import MainContent from './components/MainContent';
import AuthModal from './components/Auth/AuthModal';
import UserLibrary from './components/UserLibrary';
import { Toaster } from 'sonner';
import { useUser } from '@clerk/clerk-react';

function App() {
  const { user } = useUser();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <Header
        setIsAuthModalOpen={setIsAuthModalOpen}
        setIsLibraryOpen={setIsLibraryOpen}
      />
      <MainContent setIsAuthModalOpen={setIsAuthModalOpen} user={user} />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <UserLibrary
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        user={user}
      />
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
