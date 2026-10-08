import localFont from 'next/font/local';
export const newsreader=localFont({src:[{path:'../../public/fonts/Newsreader.woff2',weight:'400 700',style:'normal'},{path:'../../public/fonts/Newsreader-Italic.woff2',weight:'400 700',style:'italic'}],display:'swap',preload:false,variable:'--font-serif-latin'});
export const inter=localFont({src:'../../public/fonts/Inter.woff2',weight:'400 600',display:'swap',preload:false,variable:'--font-sans-latin'});
export const notoNaskhArabic=localFont({src:'../../public/fonts/NotoNaskhArabic.woff2',weight:'400 700',display:'swap',preload:false,variable:'--font-serif-arabic'});
export const notoSansArabic=localFont({src:'../../public/fonts/NotoSansArabic.woff2',weight:'400 600',display:'swap',preload:false,variable:'--font-sans-arabic'});
