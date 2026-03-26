import { useState, useEffect } from "react";
import Start from "./components/Start";
import { useRouter } from "next/router";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user_data");
    setIsLoggedIn(!!user);
  }, []);

  if (isLoggedIn === null) return null;

  return <>{isLoggedIn ? router.push("/landingPage") : <Start />}</>;
}
