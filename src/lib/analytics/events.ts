export type AnalyticsEventName =
  | 'video_play'
  | 'video_to_article_click'
  | 'article_to_video_click'
  | 'related_content_click'
  | 'article_read_25'
  | 'article_read_50'
  | 'article_read_75'
  | 'article_read_100'
  | 'article_engaged_30s'
  | 'search_used'
  | 'filter_used'
  | 'language_switch'
  | 'contact_submit_success';

export interface AnalyticsEventProps {
  locale?: string;
  slug?: string;
  topic?: string;
  duration?: number;
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(name: AnalyticsEventName, props?: AnalyticsEventProps) {
  if (typeof window === 'undefined') return;

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Beyond Rasooli Analytics] ${name}`, props);
  }

  const browser=window as Window & {plausible?:(name:string,options:{props?:AnalyticsEventProps})=>void;umami?:{track:(name:string,props?:AnalyticsEventProps)=>void}};
  if(typeof browser.plausible==='function')browser.plausible(name,{props});
  else if(typeof browser.umami?.track==='function')browser.umami.track(name,props);
}
