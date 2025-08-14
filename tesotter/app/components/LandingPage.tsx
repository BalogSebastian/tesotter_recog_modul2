// app/components/LandingPage.tsx
"use client"

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link'; // <--- Új import

const OcrProcessor = dynamic(() => import('./OcrProcessor'), {
  ssr: false,
  loading: () => <div>Betöltés...</div>
});

const LandingPage = () => {
  return (
    <div className="relative h-screen w-full bg-black text-white overflow-hidden font-sans">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-80 transition-all duration-1000 ease-in-out" 
        style={{ 
          backgroundImage: 'url(/images/bg-image.jpg)', 
        }}>
      </div>

      <div className="relative z-10 flex flex-col h-full p-8 lg:p-12">
        <div className="flex justify-between items-center w-full">
          <OcrProcessor />
          <div className="flex items-center space-x-6 uppercase text-sm font-light">
            <span className="hover:text-gray-400 transition-colors duration-300 cursor-pointer">IN</span>
            <span className="hover:text-gray-400 transition-colors duration-300 cursor-pointer">TW</span>
            <span className="hover:text-gray-400 transition-colors duration-300 cursor-pointer">SV</span>
            <span className="ml-6 border px-4 py-2 hover:bg-white hover:text-black transition-colors duration-300 cursor-pointer">MENU</span>
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center">
            <div className="flex justify-center space-x-8 lg:space-x-12 items-center w-full">
                {/* Itt van az új Link komponens */}
                <Link href="/data" className="opacity-70 text-sm font-light text-right leading-tight hover:text-white transition-colors duration-300">
                  <p>SPONTEX LOGISTICS</p><br />
                  <p className="text-xs">Saved documents</p>
                </Link>
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
                  <span className="text-xs">00:09:22</span></p>
            </div>
        </div>

        <div className="flex justify-center items-end text-sm font-light pb-4">
          <p>A CREATIVE PRODUCTION BY SOLUTIONSS.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;