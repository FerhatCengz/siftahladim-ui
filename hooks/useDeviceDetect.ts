
import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isAndroid: boolean;
  isIos: boolean;
  isWindows: boolean;
  isMac: boolean;
  isLinux: boolean;
  browser: string;
  osVersion: string;
  userAgent: string;
}

const useDeviceDetect = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isAndroid: false,
    isIos: false,
    isWindows: false,
    isMac: false,
    isLinux: false,
    browser: '',
    osVersion: '',
    userAgent: '',
  });

  useEffect(() => {
    const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    
    // Mobile Detection
    const isAndroid = Boolean(userAgent.match(/Android/i));
    const isIos = Boolean(userAgent.match(/iPhone|iPad|iPod/i));
    const isOperaMini = Boolean(userAgent.match(/Opera Mini/i));
    const isWindowsMobile = Boolean(userAgent.match(/IEMobile/i));
    const isMobile = Boolean(isAndroid || isIos || isOperaMini || isWindowsMobile);
    
    // Tablet Detection (Basic)
    const isTablet = Boolean(userAgent.match(/iPad/i) || (isAndroid && !Boolean(userAgent.match(/Mobile/i))));
    
    // Desktop (if not mobile and not tablet)
    const isDesktop = !isMobile && !isTablet;

    // OS Detection
    const isWindows = Boolean(userAgent.match(/IEMobile/i) || userAgent.match(/WPDesktop/i) || userAgent.match(/Windows NT/i));
    const isMac = Boolean(userAgent.match(/Macintosh/i));
    const isLinux = Boolean(userAgent.match(/Linux/i) && !isAndroid);

    // Browser Detection
    let browser = 'Unknown';
    if (userAgent.indexOf("Firefox") > -1) {
        browser = "Mozilla Firefox";
    } else if (userAgent.indexOf("SamsungBrowser") > -1) {
        browser = "Samsung Internet";
    } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
        browser = "Opera";
    } else if (userAgent.indexOf("Trident") > -1) {
        browser = "Microsoft Internet Explorer";
    } else if (userAgent.indexOf("Edge") > -1) {
        browser = "Microsoft Edge";
    } else if (userAgent.indexOf("Chrome") > -1) {
        browser = "Google Chrome";
    } else if (userAgent.indexOf("Safari") > -1) {
        browser = "Apple Safari";
    }

    setDeviceInfo({
      isMobile,
      isTablet,
      isDesktop,
      isAndroid,
      isIos,
      isWindows,
      isMac,
      isLinux,
      browser,
      osVersion: 'Unknown', // Parsing OS version typically requires a heavier library, keeping lightweight here.
      userAgent
    });

  }, []);

  return deviceInfo;
};

export default useDeviceDetect;
