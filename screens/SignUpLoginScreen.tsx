import React, { useState } from 'react';

interface SignUpLoginScreenProps {
  onAuthSuccess: () => void;
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

  const handlePhoneSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (phoneStep === 'number' && phoneNumber.trim().length > 8) {
          setPhoneStep('otp');
      } else if (phoneStep === 'otp' && otp === '123456') { // Demo OTP
          onAuthSuccess();
      } else if (phoneStep === 'otp') {
          alert("Invalid OTP. Please enter 123456 for this demo.");
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
                    onChange={(e) => setPhoneNumber(e.target.value)}
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
                    onChange={(e) => setOtp(e.target.value)}
                />
                <p className="text-xs text-secondary mt-2 text-center">A code was sent to {phoneNumber}. (Hint: it's 123456)</p>
            </div>
        )}
        <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-primary/90">
            {phoneStep === 'number' ? 'Send Code' : 'Verify'}
        </button>
        <button onClick={() => setAuthMethod(null)} className="w-full text-sm text-secondary font-semibold">Back</button>
    </form>
  );

  const renderEmailAuth = () => (
      <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none"
            defaultValue="demo@lifelens.app"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none"
            defaultValue="password"
          />
          <button
            onClick={onAuthSuccess}
            className="w-full bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-primary/90"
          >
            Login / Sign Up
          </button>
          <button onClick={() => setAuthMethod(null)} className="w-full text-sm text-secondary font-semibold">Back</button>
      </div>
  );

  return (
    <div className="h-full flex flex-col justify-center items-center p-6 bg-background">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back</h1>
        <p className="text-secondary mb-10">Your journey to wellness continues.</p>
        
        <div className="space-y-4">
            {!authMethod ? (
                 <div className="space-y-4">
                    <button onClick={onAuthSuccess} className="w-full flex items-center justify-center gap-3 bg-white text-primary font-bold py-3 px-4 rounded-xl shadow-card hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                        <GoogleIcon />
                        Sign in with Google
                    </button>
                    <button onClick={() => setAuthMethod('phone')} className="w-full bg-card text-primary font-bold py-3 px-4 rounded-xl shadow-card hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                        Sign in with Phone
                    </button>
                     <div className="relative flex py-3 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink mx-4 text-xs text-secondary">OR</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    <button onClick={() => setAuthMethod('email')} className="w-full bg-card text-primary font-bold py-3 px-4 rounded-xl shadow-card hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
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
