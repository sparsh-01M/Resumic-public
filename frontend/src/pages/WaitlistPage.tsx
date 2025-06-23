import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const WAITLIST_KEY = 'waitlist_joined_email';

const WaitlistPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const checkWaitlist = async (email: string) => {
      try {
        // const response = await fetch(`VITE_API_URL.ENV/api/waitlist/check?email=${encodeURIComponent(email)}`);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/waitlist/check?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        setAlreadyJoined(!!data.joined);
      } catch (err) {
        setAlreadyJoined(false);
      }
    };
    if (user?.email) {
      setEmail(user.email);
      checkWaitlist(user.email);
    } else {
      setAlreadyJoined(false);
      setEmail('');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setAlreadyJoined(false);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/waitlist/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setName('');
        localStorage.setItem(WAITLIST_KEY, email);
      } else if (response.status === 409) {
        setAlreadyJoined(true);
        localStorage.setItem(WAITLIST_KEY, email);
      } else {
        setError(data.message || 'Failed to join waitlist');
      }
    } catch (err) {
      setError('Failed to join waitlist');
    } finally {
      setLoading(false);
    }
  };

  const showThankYou = success || alreadyJoined;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4 text-primary-700 dark:text-primary-300 text-center">Join the Waitlist</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300 text-center">Be the first to know when we launch! Enter your name and email below.</p>
        {showThankYou ? (
          <>
            <div className="mt-4 text-success-600 dark:text-success-400 text-center">
              Thank you for your interest.<br />
              You will get one month of <b>Resumic Pro</b> free after launch.
            </div>
            <div className="mt-8 text-2xl font-bold text-primary-700 dark:text-primary-300 text-center">
              Till then check out our <a href="/jobs" className="underline text-primary-600 dark:text-primary-400">job page</a><br />
              especially designed for freshers to join top global startups.
            </div>
          </>
        ) : (
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 mb-1" htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-primary-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-primary-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />
            </div>
            <Button type="submit" variant="primary" fullWidth disabled={loading} isLoading={loading}>
              Join Waitlist
            </Button>
          </form>
        )}
        {error && <div className="mt-4 text-error-600 dark:text-error-400">{error}</div>}
      </div>
    </div>
  );
};

export default WaitlistPage; 