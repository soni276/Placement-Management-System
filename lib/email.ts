import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail({ to, subject, body }: SendEmailParams): Promise<{ ok: boolean; error?: string }> {
  const user = (process.env.GMAIL_USER || "").trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || "").trim();
  if (!user || !pass) {
    return { ok: false, error: "GMAIL_USER or GMAIL_APP_PASSWORD not set" };
  }
  if (!to || !String(to).trim()) {
    return { ok: false, error: "No recipient email" };
  }
  try {
    await transporter.sendMail({
      from: user,
      to: to.trim(),
      subject,
      text: body,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export function buildInterviewEmailBody(
  studentName: string,
  companyName: string,
  dateStr: string,
  timeStr: string,
  mode: string,
  meetingLink?: string | null
): string {
  const lines = [
    `Dear ${studentName},`,
    "",
    "Your interview has been scheduled.",
    "",
    `Company: ${companyName}`,
    `Date: ${dateStr}`,
    `Time: ${timeStr}`,
    `Mode: ${mode}`,
  ];
  if (meetingLink && String(meetingLink).trim()) {
    lines.push("", `Meeting Link: ${meetingLink.trim()}`);
  }
  lines.push("", "Best of luck!", "Placement Cell");
  return lines.join("\n");
}
