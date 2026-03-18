import twilio from "twilio";

export async function sendWhatsApp(
  toPhone: string | null | undefined,
  studentName: string,
  companyName: string,
  dateStr: string,
  timeStr: string
): Promise<{ ok: boolean; error?: string }> {
  const sid = (process.env.TWILIO_ACCOUNT_SID || "").trim();
  const token = (process.env.TWILIO_AUTH_TOKEN || "").trim();
  const fromNum = (process.env.TWILIO_WHATSAPP_FROM || "").trim();
  if (!sid || !token || !fromNum) {
    return { ok: false, error: "Twilio credentials not set" };
  }
  if (!toPhone || !String(toPhone).trim()) {
    return { ok: false, error: "Student has no phone number" };
  }
  try {
    const client = twilio(sid, token);
    let to = String(toPhone).trim();
    if (!to.startsWith("+")) to = "+91" + to.replace(/^0+/, "");
    const toWhatsApp = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
    const from = fromNum.startsWith("whatsapp:") ? fromNum : `whatsapp:${fromNum}`;
    const body = [
      `Hello ${studentName},`,
      `Your interview with ${companyName} is scheduled.`,
      "",
      `Date: ${dateStr}`,
      `Time: ${timeStr}`,
      "",
      "Best of luck!",
      "Placement Cell",
    ].join("\n");
    await client.messages.create({ body, from, to: toWhatsApp });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** Normalize phone to E.164 format: +91XXXXXXXXXX for Indian numbers */
function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.startsWith("91") && digits.length >= 12) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+91${digits.slice(1)}`;
  }
  return `+91${digits}`;
}

/** Extract readable error from Twilio/unknown errors */
function getErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    const twilioErr = e as { code?: number; moreInfo?: string; status?: number };
    if (twilioErr.moreInfo) return twilioErr.moreInfo;
    if (twilioErr.code) return `Twilio error ${twilioErr.code}: ${e.message}`;
    return e.message;
  }
  return String(e);
}

export type SendCustomWhatsAppResult = {
  ok: boolean;
  error?: string;
  sid?: string;
  status?: string;
  to?: string;
};

/** Send a custom WhatsApp message to a phone number */
export async function sendCustomWhatsApp(
  toPhone: string | null | undefined,
  message: string
): Promise<SendCustomWhatsAppResult> {
  const sid = (process.env.TWILIO_ACCOUNT_SID || "").trim();
  const token = (process.env.TWILIO_AUTH_TOKEN || "").trim();
  const fromNum = (
    process.env.TWILIO_WHATSAPP_FROM ||
    process.env.TWILIO_WHATSAPP_NUMBER ||
    ""
  ).trim();
  if (!sid || !token || !fromNum) {
    return {
      ok: false,
      error: "Twilio credentials not set (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM)",
    };
  }
  if (!toPhone || !String(toPhone).trim()) {
    return { ok: false, error: "Student has no phone number" };
  }
  if (!message || !String(message).trim()) {
    return { ok: false, error: "Message is required" };
  }
  try {
    const client = twilio(sid, token);
    const normalized = normalizePhone(String(toPhone).trim());
    const toWhatsApp = `whatsapp:${normalized}`;
    const from = fromNum.startsWith("whatsapp:") ? fromNum : `whatsapp:${fromNum}`;

    const twilioMessage = await client.messages.create({
      body: String(message).trim(),
      from,
      to: toWhatsApp,
    });

    return {
      ok: true,
      sid: twilioMessage.sid,
      status: twilioMessage.status,
      to: normalized,
    };
  } catch (e) {
    return {
      ok: false,
      error: getErrorMessage(e),
    };
  }
}
