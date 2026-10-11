export function extractYouTubeId(value:string):string|null {
 try{const u=new URL(value);let id:string|null=null;if(u.protocol!=='https:'&&u.protocol!=='http:')return null;if(u.hostname==='youtu.be')id=u.pathname.slice(1);else if(['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(u.hostname)){id=u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed|v)\/([^/]+)/)?.[1]||null;}return id&&/^[A-Za-z0-9_-]{11}$/.test(id)?id:null;}catch{return null;}
}

export async function fetchYouTubeMetadata(url:string){
 const id=extractYouTubeId(url);if(!id)return null;
 const canonical=`https://www.youtube.com/watch?v=${id}`;
 const response=await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(canonical)}&format=json`,{signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error('youtube_metadata_unavailable');
 const data=await response.json() as {title?:string;author_name?:string;thumbnail_url?:string};
 let durationSeconds: number | undefined;
 if(process.env.YOUTUBE_API_KEY){try{const r=await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${id}&key=${encodeURIComponent(process.env.YOUTUBE_API_KEY)}`,{signal:AbortSignal.timeout(10000)});if(r.ok){const json=await r.json();const match=json.items?.[0]?.contentDetails?.duration?.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);if(match)durationSeconds=Number(match[1]||0)*3600+Number(match[2]||0)*60+Number(match[3]||0);}}catch{/* Thumbnail fallback remains available. */}}
 const duration=durationSeconds?`${Math.floor(durationSeconds/60)}:${String(durationSeconds%60).padStart(2,'0')}`:undefined;
 return {durationSeconds,duration,youtubeId:id,title:data.title||'',authorName:data.author_name||'',thumbnailUrl:data.thumbnail_url||`https://i.ytimg.com/vi/${id}/hqdefault.jpg`,youtubeUrl:canonical};
}

export function isVerticalVideo(youtubeUrl?: string | null, videoFormat?: string | null): boolean {
  if (videoFormat === "vertical") return true;
  if (videoFormat === "landscape") return false;
  if (!youtubeUrl) return false;
  return youtubeUrl.includes("/shorts/");
}
