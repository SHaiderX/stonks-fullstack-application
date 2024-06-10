// components/auth/SignUpModal.tsx
"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

interface SignUpModalProps {
  closeModal: () => void;
}

const SignUpModal = ({ closeModal }: SignUpModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSignUp = async () => {
    setErrorMessage(null);
    if (!email || !password) {
      setErrorMessage('Email and password are required');
      return;
    }
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setErrorMessage(signUpError.message);
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setErrorMessage(signInError.message);
      } else {
        closeModal();
        window.location.reload();
      }
    }
  };

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      setErrorMessage(error.message);
    } else {
      closeModal();
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      closeModal();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-gray-900 p-8 rounded shadow-md text-white">
        <h1 className="text-2xl mb-4">Sign Up</h1>
        {errorMessage && <p className="mb-4 text-red-500">{errorMessage}</p>}
        <input
          type="email"
          placeholder="Email"
          className="mb-2 p-2 border rounded w-full text-white bg-gray-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="mb-4 p-2 border rounded w-full text-white bg-gray-800"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleSignUp} className="px-4 py-2 bg-green-500 text-white rounded mb-2 mr-3">
          Sign Up
        </button>
        <button onClick={handleGoogleSignUp} className="px-4 py-2 bg-red-500 text-white rounded">
          Sign Up with Google
        </button>
      </div>
    </div>
  );
};

export default SignUpModal;
