"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

interface SignUpModalProps {
  closeModal: () => void;
}

const SignUpModal = ({ closeModal }: SignUpModalProps) => {
  const [email, setEmail] = useState(''); // State to store the email input
  const [password, setPassword] = useState(''); // State to store the password input
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State to store error messages
  const modalRef = useRef<HTMLDivElement>(null); // Ref for the modal to handle outside clicks
  const router = useRouter(); // Router for navigation

  // Function to handle sign-up with email and password
  const handleSignUp = async () => {
    setErrorMessage(null); // Clear previous error messages
    if (!email || !password) {
      setErrorMessage('Email and password are required'); // Show error if fields are empty
      return;
    }
    // Attempt to sign up the user
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setErrorMessage(signUpError.message); // Show error if sign-up fails
    } else {
      // Attempt to sign in the user after successful sign-up
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setErrorMessage(signInError.message); // Show error if sign-in fails
      } else {
        closeModal(); // Close the modal on successful sign-in
        window.location.reload(); // Reload the page
      }
    }
  };

  // Function to handle sign-up with Google
  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      setErrorMessage(error.message); // Show error if sign-up fails
    } else {
      closeModal(); // Close the modal on successful sign-up
    }
  };

  // Function to handle clicks outside the modal
  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      closeModal(); // Close the modal if click is outside of it
    }
  };

  // Effect to add and clean up the event listener for outside clicks
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
