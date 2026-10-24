export interface TemplateResult {
  subject: string;
  text: string;
  html: string;
}

function renderHtml(title: string, amharicTitle: string, code: string, message: string, amharicMessage: string, expiresMinutes: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 540px; margin: 0 auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4); }
    .logo { font-size: 24px; font-weight: 700; color: #38bdf8; margin-bottom: 24px; text-align: center; }
    .title { font-size: 20px; font-weight: 600; color: #ffffff; margin-bottom: 8px; text-align: center; }
    .subtitle { font-size: 14px; color: #94a3b8; margin-bottom: 24px; text-align: center; }
    .code-box { background-color: #0f172a; border: 2px dashed #38bdf8; border-radius: 8px; padding: 20px; text-align: center; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #38bdf8; margin: 24px 0; font-family: monospace; }
    .message { font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 12px; }
    .warning { font-size: 13px; color: #fbbf24; background-color: rgba(251, 191, 36, 0.1); border-left: 4px solid #fbbf24; padding: 12px; margin: 20px 0; border-radius: 4px; }
    .footer { font-size: 12px; color: #64748b; text-align: center; margin-top: 32px; border-top: 1px solid #334155; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">TeraSync | ቴራሲንክ</div>
    <div class="title">${title} / ${amharicTitle}</div>
    <div class="subtitle">Secure Automotive &amp; Industrial Marketplace</div>
    
    <p class="message">${message}</p>
    <p class="message">${amharicMessage}</p>

    <div class="code-box">${code}</div>

    <p class="message" style="text-align: center; font-size: 14px;">Valid for <strong>${expiresMinutes} minutes</strong> / ለ <strong>${expiresMinutes} ደቂቃዎች</strong> ብቻ ያገለግላል።</p>

    <div class="warning">
      <strong>Security Notice / የደህንነት ማስጠንቀቂያ:</strong><br>
      Never share this code with anyone. TeraSync staff will never ask for your verification code.<br>
      ይህንን ኮድ ለማንም አያጋሩ። የቴራሲንክ ሰራተኞች የማረጋገጫ ኮድዎን ፈጽሞ አይጠይቁም።
    </div>

    <div class="footer">
      &copy; 2026 TeraSync Marketplace. If you did not request this code, please safely ignore this email.
    </div>
  </div>
</body>
</html>`;
}

export function getVerifyEmailTemplate(code: string, expiresInMinutes = 15): TemplateResult {
  const subject = `Your TeraSync Verification Code: ${code} | የማረጋገጫ ኮድ`;
  const message = `Thank you for signing up with TeraSync. Please use the verification code below to confirm your email address and activate your account.`;
  const amharicMessage = `ስለተመዘገቡ እናመሰግናለን። የኢሜይል አድራሻዎን ለማረጋገጥ እና መለያዎን ለማስጀመር እባክዎ ከታች ያለውን ኮድ ይጠቀሙ።`;
  
  const text = `TeraSync Email Verification\n\nYour 6-digit verification code is: ${code}\n\nThis code expires in ${expiresInMinutes} minutes.\nNever share this code with anyone. TeraSync staff will never ask for your code.\n\n---\nይህንን ኮድ ለማንም አያጋሩ። ኮዱ በ${expiresInMinutes} ደቂቃዎች ውስጥ ጊዜው ያልፋል።`;

  return {
    subject,
    text,
    html: renderHtml("Verify Your Email", "ኢሜይልዎን ያረጋግጡ", code, message, amharicMessage, expiresInMinutes),
  };
}

export function getLoginCodeTemplate(code: string, expiresInMinutes = 10): TemplateResult {
  const subject = `Your TeraSync Login Code: ${code} | የመግቢያ ኮድ`;
  const message = `A login request was initiated for your TeraSync account. Enter the 6-digit code below to securely sign in.`;
  const amharicMessage = `ወደ ቴራሲንክ መለያዎ ለመግባት ጥያቄ ቀርቧል። ደህንነቱ በተጠበቀ ሁኔታ ለመግባት ከታች ያለውን ባለ 6 አሃዝ ኮድ ያስገቡ።`;

  const text = `TeraSync Login Verification\n\nYour 6-digit login code is: ${code}\n\nThis code expires in ${expiresInMinutes} minutes.\nNever share this code with anyone. TeraSync staff will never ask for your code.\n\n---\nወደ መለያዎ ለመግባት ይህንን ኮድ ይጠቀሙ። ኮዱ በ${expiresInMinutes} ደቂቃዎች ውስጥ ጊዜው ያልፋል።`;

  return {
    subject,
    text,
    html: renderHtml("Two-Factor Login Code", "የመግቢያ ባለሁለት ደረጃ ኮድ", code, message, amharicMessage, expiresInMinutes),
  };
}

export function getPasswordResetTemplate(code: string, expiresInMinutes = 15): TemplateResult {
  const subject = `TeraSync Password Reset Code: ${code} | የይለፍ ቃል መቀየሪያ`;
  const message = `We received a request to reset your TeraSync account password. Use the verification code below to set your new password.`;
  const amharicMessage = `የቴራሲንክ መለያዎን የይለፍ ቃል ለመቀየር ጥያቄ ቀርቧል። አዲስ የይለፍ ቃል ለማዘጋጀት ከታች ያለውን የማረጋገጫ ኮድ ይጠቀሙ።`;

  const text = `TeraSync Password Reset\n\nYour password reset code is: ${code}\n\nThis code expires in ${expiresInMinutes} minutes.\nIf you did not request a password reset, please change your password immediately or contact support.\n\n---\nየይለፍ ቃል መቀየሪያ ኮድ: ${code}`;

  return {
    subject,
    text,
    html: renderHtml("Reset Your Password", "የይለፍ ቃልዎን ይቀይሩ", code, message, amharicMessage, expiresInMinutes),
  };
}