import React, { useState } from 'react';
import { auth } from '../services/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

interface SignUpLoginScreenProps {
  onAuthSuccess: (authData: { name: string; email?: string, phone?: string }) => void;
}

// Add a declaration for the window property to satisfy TypeScript
declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
    }
}

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.417 44 30.638 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);

const SignUpLoginScreen: React.FC<SignUpLoginScreenProps> = ({ onAuthSuccess }) => {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | null>(null);
  const [phoneStep, setPhoneStep] = useState<'number' | 'otp'>('number');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('demo@lifelens.app');
  const [password, setPassword] = useState('password');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        onAuthSuccess({
            name: result.user.displayName || 'New User',
            email: result.user.email || undefined
        });
    } catch (error: any) {
        setError("Failed to sign in with Google. Please try again.");
        console.error(error);
        setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      if (phoneStep === 'number') {
          if (phoneNumber.trim().length > 8) {
              try {
                  if (!window.recaptchaVerifier) {
                      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                          'size': 'invisible'
                      });
                  }
                  const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
                  setConfirmationResult(confirmation);
                  setPhoneStep('otp');
              } catch (error: any) {
                  console.error("SMS Error:", error);
                  setError('Failed to send code. Check number and try again.');
              }
          } else {
              setError('Please enter a valid phone number.');
          }
      } else { // phoneStep === 'otp'
          if (confirmationResult && otp.length === 6) {
              try {
                  const result = await confirmationResult.confirm(otp);
                  onAuthSuccess({
                      name: 'New User',
                      phone: result.user.phoneNumber || phoneNumber
                  });
              } catch (error: any) {
                  setError("Invalid OTP. Please try again.");
              }
          } else {
              setError("Please enter the 6-digit OTP.");
          }
      }
      setIsLoading(false);
  };

  const handleEmailLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess({
            name: userCredential.user.displayName || email.split('@')[0],
            email: userCredential.user.email || undefined
        });
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
            try {
                const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
                onAuthSuccess({
                    name: email.split('@')[0],
                    email: newUserCredential.user.email || undefined
                });
            } catch (createError: any) {
                setError('Signup failed. Password must be at least 6 characters.');
                setIsLoading(false);
            }
        } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            setError('Incorrect email or password.');
            setIsLoading(false);
        } else {
            setError('An error occurred. Please try again.');
            setIsLoading(false);
        }
    }
  };


  const renderPhoneAuth = () => (
    <form onSubmit={handlePhoneSubmit} className="space-y-4">
        {phoneStep === 'number' ? (
            <div>
                <label className="block text-sm font-medium text-secondary mb-1">Phone Number</label>
                <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none"
                    value={phoneNumber}
                    onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (error) setError('');
                    }}
                    disabled={isLoading}
                />
            </div>
        ) : (
            <div>
                <label className="block text-sm font-medium text-secondary mb-1">Enter Code</label>
                <input
                    type="text"
                    placeholder="123456"
                    className="w-full px-4 py-3 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none"
                    value={otp}
                    onChange={(e) => {
                        setOtp(e.target.value);
                        if (error) setError('');
                    }}
                    disabled={isLoading}
                    autoComplete="one-time-code"
                />
                <p className="text-xs text-secondary mt-2 text-center">A code was sent to {phoneNumber}.</p>
            </div>
        )}
        {error && <p className="text-red-500 text-sm text-center -mb-2">{error}</p>}
        <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-primary/90 disabled:bg-primary/70">
            {isLoading ? '...' : (phoneStep === 'number' ? 'Send Code' : 'Verify')}
        </button>
        <button onClick={() => { setAuthMethod(null); setError(''); }} disabled={isLoading} className="w-full text-sm text-secondary font-semibold">Back</button>
    </form>
  );

  const renderEmailAuth = () => (
      <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <button
            onClick={handleEmailLogin}
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-primary/90 disabled:bg-primary/70"
          >
            {isLoading ? '...' : 'Login / Sign Up'}
          </button>
          <button onClick={() => { setAuthMethod(null); setError(''); }} disabled={isLoading} className="w-full text-sm text-secondary font-semibold">Back</button>
      </div>
  );

  return (
    <div className="h-full flex flex-col justify-center items-center p-6 bg-background relative">
       <div id="recaptcha-container"></div>
       {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        )}
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back</h1>
        <p className="text-secondary mb-10">Your journey to wellness continues.</p>
        
        <div className="space-y-4">
            {!authMethod ? (
                 <div className="space-y-4">
                    <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full flex items-center justify-center gap-3 bg-white text-primary font-bold py-3 px-4 rounded-xl shadow-card hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none">
                        <GoogleIcon />
                        Sign in with Google
                    </button>
                    <button onClick={() => setAuthMethod('phone')} disabled={isLoading} className="w-full bg-card text-primary font-bold py-3 px-4 rounded-xl shadow-card hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none">
                        Sign in with Phone
                    </button>
                     <div className="relative flex py-3 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink mx-4 text-xs text-secondary">OR</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    <button onClick={() => setAuthMethod('email')} disabled={isLoading} className="w-full bg-card text-primary font-bold py-3 px-4 rounded-xl shadow-card hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none">
                        Continue with Email
                    </button>
                </div>
            ) : authMethod === 'phone' ? (
                renderPhoneAuth()
            ) : (
                renderEmailAuth()
            )}
        </div>
      </div>
    </div>
  );
};

export default SignUpLoginScreen;