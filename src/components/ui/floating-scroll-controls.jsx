import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/icon';

export function FloatingScrollControls() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const mainEl = document.querySelector('main');
      const scrollTop = mainEl ? mainEl.scrollTop : window.scrollY;
      setVisible(scrollTop > 80);
    };

    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll);

    return () => {
      if (mainEl) mainEl.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTo({ top: mainEl.scrollHeight, behavior: 'smooth' });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div
      className={`fixed bottom-24 right-4 z-50 flex flex-col gap-2 transition-all duration-300 md:hidden ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/80 text-slate-800 shadow-[0_8px_24px_rgba(15,23,42,0.15)] backdrop-blur-2xl transition active:scale-90 hover:bg-white"
        title="Ir hasta arriba"
        aria-label="Ir hasta arriba"
      >
        <Icon name="keyboard_arrow_up" size="24px" />
      </button>
      <button
        type="button"
        onClick={scrollToBottom}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/80 text-slate-800 shadow-[0_8px_24px_rgba(15,23,42,0.15)] backdrop-blur-2xl transition active:scale-90 hover:bg-white"
        title="Ir hasta abajo"
        aria-label="Ir hasta abajo"
      >
        <Icon name="keyboard_arrow_down" size="24px" />
      </button>
    </div>
  );
}
