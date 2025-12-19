import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Pay from './pages/Pay';
import Monitor from './pages/Monitor';
import Login from './pages/Login';
import Signup from './pages/Signup';
import History from './pages/History';

import { supabase } from './supabase';

function App() {
  const [currentScreen, setCurrentScreen] = useState('pay');
  const [txData, setTxData] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth State Listener
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data) {
        setUser({ ...data, email: authUser.email }); // Merge profile with auth email
      } else {
        // Trigger might not have run yet or failed?
        // Fallback: use auth metadata if DB record missing (for initial render)
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || 'User',
          balance: 0
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time Balance Subscription
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('balance-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Balance updated!', payload);
          setUser((prevUser) => ({
            ...prevUser,
            balance: payload.new.balance,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id]);

  const getDeviceId = () => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  };

  const getGeolocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: 0, longitude: 0 });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          resolve({ latitude: 0, longitude: 0 });
        }
      );
    });
  };

  const handlePay = async (data) => {
    // We do NOT switch screens anymore, allowing Pay.jsx to handle the UI with TransactionAnimation
    // setCurrentScreen('processing'); 

    try {
      const { latitude, longitude } = await getGeolocation();
      const deviceId = getDeviceId();

      const payload = {
        ...data,
        latitude,
        longitude,
        deviceId,
        userId: user?.id
      };

      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      setTxData(result);

      // We return the result so Pay.jsx can show the success animation
      // setCurrentScreen('status'); 
      return result;

    } catch (error) {
      console.error("Payment Error:", error);
      // Let Pay.jsx handle the error UI
      throw error;
    }
  };

  const handleLogin = (userData) => {
    // Handled by onAuthStateChange, but we can set local state optimistically
    // setUser(userData); 
    // Actually better to do nothing and let the listener fire.
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentScreen('pay');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></div>
        Loading...
      </div>
    );
  }

  if (!user) {
    if (isSignup) {
      return <Signup onSwitchToLogin={() => setIsSignup(false)} />;
    }
    return <Login onLogin={handleLogin} onSwitchToSignup={() => setIsSignup(true)} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        // User requested "remove Complete UI", so 'home' routes to 'pay'
        return <Pay user={user} onBack={() => setCurrentScreen('pay')} onPay={handlePay} onLogout={handleLogout} onHistory={() => setCurrentScreen('history')} />;
      case 'pay':
        return <Pay user={user} onBack={() => setCurrentScreen('pay')} onPay={handlePay} onLogout={handleLogout} onHistory={() => setCurrentScreen('history')} />;
      case 'history':
        return <History user={user} onBack={() => setCurrentScreen('pay')} onLogout={handleLogout} />;
      case 'monitor':
        // Mapping "Transactions" to Monitor for now, or just keeping the hidden route
        return <Monitor onBack={() => setCurrentScreen('pay')} />;
      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-white">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-medium text-gray-600">Processing Payment...</p>
          </div>
        );
      case 'status':
        return <Status {...txData} onHome={() => setCurrentScreen('pay')} />;
      default:
        return <Pay user={user} onBack={() => setCurrentScreen('pay')} onPay={handlePay} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full flex-1 flex flex-col"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
