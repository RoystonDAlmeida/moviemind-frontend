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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-lg w-full max-w-lg relative flex flex-col items-stretch">
            <Button
              variant="ghost"
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-300"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="w-full px-6">
              <AuthForm isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthModal;
