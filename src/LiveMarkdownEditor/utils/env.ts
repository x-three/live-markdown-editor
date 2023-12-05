const { userAgent } = window.navigator;

export const isWindows = userAgent.indexOf('Windows') !== -1;

export const isLinux = navigator.platform.indexOf('Linux') !== -1;

export const isMac = window.navigator.userAgent.indexOf('Macintosh') !== -1;

export const isIOS = userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1;

export const isAndroid = userAgent.indexOf('Android') !== -1;

export const isMobile = isIOS || isAndroid;
