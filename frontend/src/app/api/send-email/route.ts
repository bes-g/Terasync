import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER || "besufkadtekalign@gmail.com";
const SMTP_PASS = process.env.SMTP_PASS || "taia oqzb trsa opvy";
const INTERNAL_SECRET = process.env.INTERNAL_EMAIL_SECRET || "terasync_internal_dispatch_secret_2026";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  connectionTimeout: 12000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
} as any);

export async function POST(req: Request) {
  try {
    const authSecret = req.headers.get("x-internal-secret");
    if (authSecret !== INTERNAL_SECRET) {
      return NextResponse.json({ error: "Unauthorized dispatcher call" }, { status: 401 });
    }

    const body = await req.json();
    const { to, subject, html, text } = body;

    if (!to || !subject) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const info = await transporter.sendMail({
      from: '"TeraSync" <' + SMTP_USER + '>',
      to,
      subject,
      html: html || undefined,
      text: text || undefined,
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      deliveredTo: to,
    });
  } catch (err: any) {
    console.error("Vercel email dispatcher error:", err);
    return NextResponse.json(
      { error: err.message || "Email dispatch failed" },
      { status: 500 }
    );
  }
}
