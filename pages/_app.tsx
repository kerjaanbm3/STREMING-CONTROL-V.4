import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isOverlay = router.pathname.startsWith('/overlay');

  if (isOverlay) {
    return (
      <div className="w-screen h-screen bg-transparent overflow-hidden selection:bg-transparent font-sans">
        <Component {...pageProps} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 antialiased selection:bg-blue-600 selection:text-white font-sans">
      <Component {...pageProps} />
    </div>
  );
}
