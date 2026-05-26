import nodemailer from "nodemailer";

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const runEtherealFallback = async (reason: string) => {
    console.warn(`⚠️ ${reason} - Falling back to Ethereal Email for live testing...`);
    try {
      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const testInfo = await testTransporter.sendMail({
        from: `"SaganFG Workspace" <no-reply@saganfg.com>`,
        to,
        subject,
        text,
        html,
      });

      const previewUrl = nodemailer.getTestMessageUrl(testInfo);
      console.log("\n========================================================");
      console.log("📧 SAGANFG TEST EMAIL DISPATCHED (ETHEREAL MAIL)");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Preview Link: ${previewUrl}`);
      console.log("========================================================\n");
      return { success: true, messageId: testInfo.messageId, previewUrl };
    } catch (etherealErr) {
      console.error("❌ Ethereal fallback failed:", etherealErr);
      return { success: false, error: etherealErr };
    }
  };

  if (host && user && pass && !user.includes("your-aws") && !pass.includes("saburmum33-invalid")) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"SaganFG Tax Portal" <${user}>`,
        to,
        subject,
        text,
        html,
      });
      console.log("Email dispatched successfully via SMTP:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      return await runEtherealFallback(`SMTP authentication/transmission failure: ${err}`);
    }
  } else {
    return await runEtherealFallback("SMTP credentials missing or incomplete");
  }
}
