export type Publication={status?:string;publishedAt?:string|null;translationStatus?:string|null};
export function eligible(doc:Publication,requireReview=false,now=Date.now()){
 return doc.status==='published'&&(!doc.publishedAt||(Number.isFinite(Date.parse(doc.publishedAt))&&Date.parse(doc.publishedAt)<=now))&&(!requireReview||doc.translationStatus!=='machine_draft');
}
