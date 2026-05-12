import { useState, useEffect } from 'react';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('axim_cookie_consent');
    if (!consent) setIsVisible(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('axim_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none flex justify-center md:justify-start">
      <div className="bg-black/90 backdrop-blur-md border border-white/10 p-4 rounded-lg shadow-2xl pointer-events-auto max-w-sm flex flex-col gap-3">
        <p className="text-xs text-zinc-400 leading-relaxed">
          We use cookies and basic analytics to improve your experience and secure our platform. By continuing to use this site, you consent to our use of cookies.
        </p>
        <div className="flex gap-2">
          <button onClick={acceptCookies} className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors text-white text-xs font-bold rounded">
            Got it
          </button>
          <a href="/privacy" className="px-4 py-2 text-zinc-500 hover:text-white transition-colors text-xs font-medium flex items-center">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
