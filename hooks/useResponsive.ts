import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

type DeviceType = 'mobile' | 'tablet' | 'desktop';

export const useResponsive = () => {
  const [device, setDevice] = useState<DeviceType>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < MOBILE_BREAKPOINT) {
        setDevice('mobile');
      } else if (width < TABLET_BREAKPOINT) {
        setDevice('tablet');
      } else {
        setDevice('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { device };
};
