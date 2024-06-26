import React from "react";
import "./First.css";
import { Button } from "flowbite-react";
import { useHistory } from "react-router-dom";

function First() {
  const handleLogin = () => {
    window.location.href = "http://127.0.0.1:8000/login"; // Redirect to Spotify login
  };

  return (
    <main className="overflow-hidden flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-[#1DB954] to-[#191414] px-4 py-12 md:px-6 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center space-y-6 text-center">
        <h1 className="text-5xl font-bold text-white sm:text-6xl md:text-7xl">
          Get a playlist based on your mood.
        </h1>
        <p className="text-lg text-gray-200 md:text-xl">
          Sign in with Spotify to start exploring new music and discover new
          songs.
        </p>
        <Button
          onClick={handleLogin}
          variant="outline"
          className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-lg font-medium text-[#191414] transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
        >
          Sign in with Spotify
        </Button>
      </div>
    </main>
  );
}

export default First;
