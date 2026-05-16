"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LandingPage() {
  const [showModal, setShowModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Body scroll lock
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
      router.replace("/login");
    }
  }, [router]);

  if (isStandalone) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#20E070] opacity-[0.08] blur-[140px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#0dbf58] opacity-[0.08] blur-[140px] rounded-full"></div>

      <div className="z-10 text-center max-w-md w-full">
        {/* App Icon / Logo */}
        <div className="w-28 h-28 bg-gradient-to-br from-[#20E070] to-[#0dbf58] rounded-[2.5rem] mx-auto mb-10 flex items-center justify-center shadow-[0_20px_50px_rgba(32,224,112,0.4)] transform hover:scale-105 transition-all duration-500 ease-out border border-white/10">
          <span className="text-5xl">⚽</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter leading-none">
          Football <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20E070] to-[#0dbf58]">Training</span>
        </h1>
        
        <p className="text-gray-400 text-xl mb-12 leading-relaxed font-medium">
          The elite platform for football excellence. Install the app to begin your journey.
        </p>

        <div className="space-y-6 w-full">
          <button
            onClick={() => setShowModal(true)}
            className="group w-full bg-gradient-to-r from-[#20E070] to-[#18b058] text-black font-black py-6 px-8 rounded-[2rem] text-xl shadow-[0_15px_40px_rgba(32,224,112,0.4)] hover:shadow-[0_20px_50px_rgba(32,224,112,0.6)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-4"
          >
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" className="group-hover:animate-bounce">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14v-4H8l4-4 4 4h-3v4h-2z" />
            </svg>
            Install Rhythm App
          </button>

          {/* <div className="pt-12 border-t border-white/5 flex justify-center gap-8">
            <Link 
              href="/privacy-policy" 
              className="text-gray-600 hover:text-[#20E070] text-xs font-bold transition-colors uppercase tracking-widest"
            >
              Privacy Policy
            </Link>
          </div> */}
        </div>
      </div>

      {/* Installation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#121212] w-full max-w-lg rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-2xl font-black text-white">How to Install</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[70vh] hide-scrollbar">
              <div className="space-y-10">
                {/* iOS Safari */}
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                    </div>
                    <h3 className="text-lg font-bold">iOS Safari (iPhone/iPad)</h3>
                  </div>
                  <ul className="space-y-4 text-gray-400">
                    <li className="flex items-start gap-3">
                      <span className="text-[#20E070] font-bold">1.</span>
                      <span>Tap the <strong className="text-white">Share</strong> button at the bottom of Safari.</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#20E070" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#20E070] font-bold">2.</span>
                      <span>Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#20E070] font-bold">3.</span>
                      <span>Tap <strong className="text-white">"Add"</strong> in the top right corner.</span>
                    </li>
                  </ul>
                </section>

                {/* Android Chrome */}
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#20E070]/10 rounded-xl flex items-center justify-center text-[#20E070]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="21.17" y1="8" x2="12" y2="8"></line><line x1="3.95" y1="6.06" x2="8.54" y2="14"></line><line x1="10.88" y1="21.94" x2="15.46" y2="14"></line></svg>
                    </div>
                    <h3 className="text-lg font-bold">Android Chrome</h3>
                  </div>
                  <ul className="space-y-4 text-gray-400">
                    <li className="flex items-start gap-3">
                      <span className="text-[#20E070] font-bold">1.</span>
                      <span>Tap the <strong className="text-white">Three Dots</strong> menu in the top right.</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#20E070" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#20E070] font-bold">2.</span>
                      <span>Select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.</span>
                    </li>
                  </ul>
                </section>

                {/* iOS Chrome */}
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-500/10 rounded-xl flex items-center justify-center text-gray-400">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </div>
                    <h3 className="text-lg font-bold">iOS Chrome</h3>
                  </div>
                  <ul className="space-y-4 text-gray-400">
                    <li className="flex items-start gap-3">
                      <span className="text-[#20E070] font-bold">1.</span>
                      <span>Tap the <strong className="text-white">Share</strong> icon in the address bar.</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#20E070" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#20E070] font-bold">2.</span>
                      <span>Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.</span>
                    </li>
                  </ul>
                </section>
              </div>
            </div>

            <div className="p-8 bg-white/5 border-t border-white/5 text-center">
              <button 
                onClick={() => setShowModal(false)}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition-all"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        h1 {
          font-family: 'Inter', sans-serif;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .hide-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        :global(body.modal-open) {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
