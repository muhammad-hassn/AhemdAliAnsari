import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";
import { reportError } from "@/lib/report-error";
import { SITE_NAME } from "@/lib/constants";
import type { Order } from "@/types";
import {
  renderOrderConfirmationHtml,
  renderAdminNotificationHtml,
} from "./templates";

function getResendClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  return new Resend(env.RESEND_API_KEY);
}

export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  const recipient = order.guest_email;
  if (!recipient) return;

  try {
    const resend = getResendClient();
    if (!resend || !env.EMAIL_FROM) {
      return;
    }

    await resend.emails.send({
      from: `${SITE_NAME} <${env.EMAIL_FROM}>`,
      to: recipient,
      subject: `Order Confirmation #${order.order_number} - ${SITE_NAME}`,
      html: renderOrderConfirmationHtml(order),
    });
  } catch (error) {
    reportError(error, "sendOrderConfirmationEmail");
  }
}

export async function sendAdminOrderNotificationEmail(
  order: Order,
): Promise<void> {
  try {
    const resend = getResendClient();
    if (!resend || !env.EMAIL_FROM || !env.ADMIN_NOTIFY_EMAIL) {
      return;
    }

    await resend.emails.send({
      from: `${SITE_NAME} <${env.EMAIL_FROM}>`,
      to: env.ADMIN_NOTIFY_EMAIL,
      subject: `[New Order] #${order.order_number} - Rs. ${order.total_pkr.toLocaleString()}`,
      html: renderAdminNotificationHtml(order),
    });
  } catch (error) {
    reportError(error, "sendAdminOrderNotificationEmail");
  }
}
