import { useUser, useClerk } from '@clerk/clerk-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { UserCircle, LogOut, Library } from 'lucide-react';
import { useState } from 'react';

const Header = ({ setIsAuthModalOpen, setIsLibraryOpen }) => {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLibraryClick = () => {
    setIsLibraryOpen(true);
    setIsDropdownOpen(false);
  };

  return (
    <header className="border-b border-slate-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          MovieMind
        </h1>
        {isSignedIn ? (
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-pink-600 text-white hover:from-pink-600 hover:to-purple-400"
              >
                <UserCircle className="w-4 h-4" />
                <span>Welcome, {user.firstName || user.emailAddresses[0].emailAddress}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleLibraryClick} className="flex items-center gap-2">
                <Library className="w-4 h-4" />
                <span>My Library</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-pink-600 text-white hover:from-pink-600 hover:to-purple-400"
          >
            <UserCircle className="w-4 h-4" />
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
