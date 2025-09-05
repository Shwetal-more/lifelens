// src/services/sms.ts
import Twilio from 'twilio';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function normalizePhone(raw: string): string | null {
  const pn = parsePhoneNumberFromString(raw);
  if (!pn || !pn.isValid()) return null;
  return pn.number;
}


export async function sendSms(toRaw: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER!;

  const client = Twilio(accountSid, authToken);

  const to = normalizePhone(toRaw);
  if (!to) throw new Error('Invalid phone number');
  if (to === twilioNumber) throw new Error('Recipient cannot be same as sender');

  return client.messages.create({ from: twilioNumber, to, body });
}