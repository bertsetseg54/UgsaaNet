import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage'; 
import Start from './components/Start';


export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('user_data');
    setIsLoggedIn(!!user);
  }, []);

  if (isLoggedIn === null) return null;

  return (
    <>
      {isLoggedIn ? (
        <LandingPage onLogout={() => {
          localStorage.removeItem('user_data');
          setIsLoggedIn(false);
        }} />
      ) : (
        <Start />
      )}
    </>
  );
}