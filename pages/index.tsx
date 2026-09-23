import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#070a10] flex items-center justify-center text-white">
      <div className="text-sm font-mono font-bold animate-pulse text-blue-400">
        REDIRECTING TO BROADCAST CONTROLLER...
      </div>
    </div>
  );
}
