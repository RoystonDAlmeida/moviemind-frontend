import { useState } from 'react';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import AuthForm from './AuthForm';

const AuthModal = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  
  const handleClose = () => {
    onClose();
    setIsSignUp(false);
  };
  
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 p-4 sm:p-6 rounded-lg w-full max-w-sm relative flex flex-col items-center max-h-[90vh] overflow-hidden">
            <Button
              variant="ghost"
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-300 z-10"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="w-full overflow-y-auto overflow-x-hidden">
              <AuthForm isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthModal;