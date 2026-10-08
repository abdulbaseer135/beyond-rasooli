import type { EmailAdapter } from "payload";
import { APIError } from "payload";
export const cmsEmail: EmailAdapter = () => ({
  name: "resend", defaultFromAddress: process.env.CONTACT_FROM_EMAIL || "notifications@beyondrasooli.com", defaultFromName: "Beyond Rasooli",
  async sendEmail(message) {
    if (process.env.BEYOND_QA === "true" && process.env.DATABASE_URI?.startsWith("file:") && process.env.QA_EMAIL_CAPTURE === "true") { const {writeFile,mkdir}=await import("node:fs/promises");await mkdir(".qa",{recursive:true});await writeFile(".qa/founder-email.json",JSON.stringify({to:message.to,subject:message.subject,html:message.html}));return {id:"isolated-email"}; }
    if(!process.env.RESEND_API_KEY)throw new APIError("Email delivery is not configured.",503);
    const to=typeof message.to === "string" ? [message.to] : message.to;
    const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:message.from,to,subject:message.subject,html:message.html,text:message.text}),signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw new APIError("Email delivery is unavailable.",503);return {sent:true};
  },
});
