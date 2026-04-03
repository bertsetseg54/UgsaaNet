"use client";

import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import SignUp from "./components/SignUp";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    // 1. LocalStorage-оос шалгах
    const user = localStorage.getItem("user_data");
    
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Hydration error-оос сэргийлж, шалгаж дуустал юу ч харуулахгүй эсвэл Loading харуулна
  if (isLoggedIn === null) return <div className="flex justify-center p-10">Уншиж байна...</div>;

  // 2. Төлөвөөс хамаарч компонентоо буцаах
  return (
    <main>
      {isLoggedIn ? (
        <LandingPage onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <SignUp onLogin={() => setIsLoggedIn(true)} />
      )}
    </main>
  );
}