import { SignIn, SignUp } from '@clerk/clerk-react';
import { commonAppearance } from '../../utils/clerkConfig';

const AuthForm = ({ isSignUp, setIsSignUp }) => {
  return (
    <>
      {isSignUp ? (
        <>
          <SignUp appearance={commonAppearance} afterSignUpUrl="/" />
          <div className="mt-4 text-center">
            <p className="text-slate-400">
              Already have an account?{' '}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-purple-400 hover:text-purple-300"
              >
                Sign In
              </button>
            </p>
          </div>
        </>
      ) : (
        <>
          <SignIn appearance={commonAppearance} afterSignInUrl="/" />
          <div className="mt-4 text-center">
            <p className="text-slate-400">
              Don't have an account?{' '}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-purple-400 hover:text-purple-300"
              >
                Sign Up
              </button>
            </p>
          </div>
        </>
      )}
    </>
  );
};

export default AuthForm;