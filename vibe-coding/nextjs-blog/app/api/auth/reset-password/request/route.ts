import { NextRequest } from "next/server";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { resetRequestSchema } from "@/lib/validations/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetRequestSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    // Always return 200 to prevent email enumeration
    const response = successResponse({
      message: "If the email exists, a reset link has been sent.",
    });

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user || !user.passwordHash) return response;

    // Clean up existing tokens
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const rawToken = randomBytes(32).toString("hex");
    const hashedToken = createHash("sha256").update(rawToken).digest("hex");

    await prisma.passwordResetToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${rawToken}`;

    await getResend().emails.send({
      from: process.env.EMAIL_FROM || "noreply@example.com",
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return response;
  } catch {
    return errorResponse("Failed to process reset request", 500);
  }
}
