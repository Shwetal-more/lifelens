import React from 'react';

interface SignUpLoginScreenProps {
  onAuthSuccess: () => void;
}

const SignUpLoginScreen: React.FC<SignUpLoginScreenProps> = ({ onAuthSuccess }) => {
  return (
    <div className="h-full flex flex-col justify-center items-center p-6 bg-background">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Welcome to LifeLens</h1>
        <p className="text-secondary mb-10">Let's begin your journey to wellness.</p>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-4 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none"
            defaultValue="demo@lifelens.app"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-4 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none"
            defaultValue="password"
          />
        </div>

        <div className="mt-10 space-y-4">
          <button
            onClick={onAuthSuccess}
            className="w-full bg-primary text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-primary/90 transform hover:-translate-y-1 transition-all duration-200"
          >
            Login
          </button>
          <button
            onClick={onAuthSuccess}
            className="w-full bg-card text-primary font-bold py-4 px-8 rounded-xl shadow-card hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpLoginScreen;