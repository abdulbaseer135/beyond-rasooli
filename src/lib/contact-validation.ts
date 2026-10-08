export const contactReasons = ['collaboration', 'speaking', 'media', 'correction', 'general'] as const;
export function validateContact(body: Record<string, unknown>) {
 const fields: Record<string,string> = {};
 if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 160) fields.name = 'required';
 if (typeof body.email !== 'string' || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) fields.email = 'email_invalid';
 if (typeof body.message !== 'string' || body.message.trim().length < 10 || body.message.length > 10000) fields.message = 'message_too_short';
 if (!contactReasons.includes(body.reason as typeof contactReasons[number])) fields.reason = 'required';
 return fields;
}
