"use client"

// components/LandingPage.tsx
import React from 'react';

const LandingPage = () => {
  return (
    <div className="relative h-screen w-full bg-black text-white overflow-hidden font-sans">
      {/* Háttér placeholder */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-80 transition-all duration-1000 ease-in-out" 
        style={{ 
          backgroundImage: 'url(/images/bg-image.jpg)', 
        }}>
      </div>

      {/* Tartalom overlay */}
      <div className="relative z-10 flex flex-col h-full p-8 lg:p-12">
        {/* Felső sáv */}
        <div className="flex justify-between items-center w-full">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">TESOTTER</h1>
          <div className="flex items-center space-x-6 uppercase text-sm font-light">
            <span className="hover:text-gray-400 transition-colors duration-300 cursor-pointer">IN</span>
            <span className="hover:text-gray-400 transition-colors duration-300 cursor-pointer">TW</span>
            <span className="hover:text-gray-400 transition-colors duration-300 cursor-pointer">SV</span>
            <span className="ml-6 border px-4 py-2 hover:bg-white hover:text-black transition-colors duration-300 cursor-pointer">MENU</span>
          </div>
        </div>

        {/* Középső tartalom az 5 elemmel */}
        <div className="flex-grow flex items-center justify-center">
            <div className="flex justify-center space-x-8 lg:space-x-12 items-center w-full">
                <p className="opacity-70 text-sm font-light text-right leading-tight">
                  <span className="hidden md:inline">FRAGMENTS IN B&W</span><br />
                  <span className="text-xs">00:01:28</span>
                </p>
                <p className="opacity-70 text-sm font-light text-right leading-tight">
                  <span className="hidden md:inline">DAIMON IN MOTION</span><br />
                  <span className="text-xs">00:02:10</span>
                </p>
                <div className="text-center mx-4 md:mx-8 leading-none">
                    <h2 className="text-lg md:text-2xl font-bold">BEYOND THE FRAME</h2>
                    <p className="text-xs">00:01:28</p>
                </div>
                <p className="opacity-70 text-sm font-light text-left leading-tight">
                  <span className="hidden md:inline">CREATING CONNECTIONS</span><br />
                  <span className="text-xs">00:05:32</span>
                </p>
                <p className="opacity-70 text-sm font-light text-left leading-tight">
                  <span className="hidden md:inline">CAPTURING THE ESSENCE</span><br />
                  <span className="text-xs">00:09:22</span>
                </p>
            </div>
        </div>

        {/* Alsó rész */}
        <div className="flex justify-center items-end text-sm font-light pb-4">
          <p>A CREATIVE PRODUCTION BY SOLUTIONSS.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;