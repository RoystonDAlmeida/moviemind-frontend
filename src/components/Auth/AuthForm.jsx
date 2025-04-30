import { SignIn, SignUp } from '@clerk/clerk-react';
import { commonAppearance } from '../../utils/clerkConfig';

const AuthForm = ({ isSignUp, setIsSignUp }) => {
  
  // Custom appearance to prevent horizontal scrolling and ensure centering
  const responsiveAppearance = {
    ...commonAppearance,
    layout: {
      ...commonAppearance.layout,
      socialButtonsVariant: 'blockButton',
      socialButtonsPlacement: 'top',
      itemSpacing: 2,
      logoPlacement: 'inside',
      logoImageUrl: null, 
    },
    elements: {
      ...commonAppearance.elements,
      formButtonPrimary: 'w-full',
      socialButtonsBlockButton: 'w-full max-w-full truncate',
      socialButtonsBlockButtonText: 'truncate',
      socialButtonsBlockButtonIconBox: 'flex-shrink-0',
      formFieldInput: 'w-full',
      rootBox: 'w-full min-w-0 overflow-x-hidden flex justify-center',
      card: 'w-full min-w-0 overflow-hidden',
      form: 'w-full min-w-0',
      formField: 'w-full min-w-0',
      main: 'w-full min-w-0',
      formContainer: 'w-full min-w-0',
      identityPreviewEditButtonIcon: 'flex-shrink-0',
      headerTitle: 'text-center mx-auto',
      headerSubtitle: 'text-center mx-auto',
      header: 'w-full text-center',
      footerAction: 'w-full text-center',
      footer: 'w-full text-center',
    }
  };

  return (
    <div className="w-full overflow-x-hidden flex justify-center">
      <div className="w-full max-w-xs">
        {isSignUp ? (
          <>
            <SignUp
              appearance={responsiveAppearance}
              afterSignUpUrl="/"
              signInUrl="/"
              socialButtonsPlacement="top"
              providers={['oauth_google', 'oauth_github']}
            />
            <div className="mt-4 text-center">
              <p className="text-slate-400 text-sm">
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
            <SignIn
              appearance={responsiveAppearance}
              afterSignInUrl="/"
              signUpUrl="/"
              socialButtonsPlacement="top"
              providers={['oauth_google', 'oauth_github']}
            />
            <div className="mt-4 text-center">
              <p className="text-slate-400 text-sm">
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
    </div>
  </div>
  );
};

export default AuthForm;