import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
// If your Prisma file is located elsewhere, you can change the path
import nodemailer from "nodemailer";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.APP_URL! || "http://localhost:4000"],
  baseURL: process.env.BETTER_AUTH_URL!,
  socialProviders: {
    google: {
      prompt: "select_account consent", // Always prompt the user to select an account and consent to permissions
      accessType: "offline", // Request a refresh token for long-term access
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log("Send verification email to:", user.email);
      const verificationURL = `${process.env.APP_URL}/verify-email?token=${token}`;
      console.log("Verification URL:", verificationURL);
      // Here you would integrate with your email service to send the email
      try {
        const info = await transporter.sendMail({
          from: `"Blog App" <${process.env.APP_USER}>`,
          to: user.email,
          subject: "Verify your email",
          text: `Please verify your email by clicking the following link: ${url}`,
          html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verify Email</title>
        </head>

        <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">

          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background-color:#f3f4f6;">
            <tr>
              <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                  style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td align="center"
                      style="background:#111827;padding:32px;">
                      
                      <h1 style="margin:0;color:#ffffff;font-size:30px;">
                        Verify Your Email
                      </h1>

                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 35px;color:#374151;">

                      <h2 style="margin-top:0;color:#111827;font-size:24px;">
                        Hello ${user.name},
                      </h2>

                      <p style="font-size:16px;line-height:1.8;margin:20px 0;">
                        Thank you for creating an account. Please verify your email
                        address to complete your registration and access all features.
                      </p>

                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin:35px 0;">
                        <tr>
                          <td align="center">

                            <a
                              href="${url}"
                              style="
                                background-color:#2563eb;
                                color:#ffffff;
                                text-decoration:none;
                                padding:15px 32px;
                                border-radius:10px;
                                font-size:16px;
                                font-weight:bold;
                                display:inline-block;
                              "
                            >
                              Verify Email
                            </a>

                          </td>
                        </tr>
                      </table>

                      <p style="font-size:15px;line-height:1.7;color:#6b7280;">
                        If the button above does not work, copy and paste the link
                        below into your browser:
                      </p>

                      <p style="word-break:break-all;">
                        <a
                          href="${url}"
                          style="color:#2563eb;text-decoration:none;"
                        >
                          ${url}
                        </a>
                      </p>

                      <hr style="border:none;border-top:1px solid #e5e7eb;margin:35px 0;" />

                      <p style="font-size:14px;color:#9ca3af;line-height:1.7;">
                        This verification link may expire after some time for security reasons.
                        If you did not create this account, you can safely ignore this email.
                      </p>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td
                      align="center"
                      style="
                        background:#f9fafb;
                        padding:24px;
                        color:#9ca3af;
                        font-size:13px;
                      "
                    >
                      © ${new Date().getFullYear()} Blog App. All rights reserved.
                    </td>
                  </tr>

                </table>

              </td>
            </tr>
          </table>

        </body>
        </html>
        `,
        });
        console.log("Email sent:", info.messageId);
      } catch (error) {
        console.error("Error sending verification email:", error);
      }
    },
  },
});
