import { SITE_NAME } from "@/lib/constants";
import type { Order } from "@/types";

export function renderOrderConfirmationHtml(order: Order): string {
  const itemsHtml = (order.items ?? [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4;">
          <p style="margin: 0; font-weight: 500; color: #1c1917;">${item.product_name}</p>
          <p style="margin: 4px 0 0; color: #78716c; font-size: 13px;">Size: ${item.size} × ${item.quantity}</p>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4; text-align: right; color: #1c1917; font-weight: 500;">
          Rs. ${(item.unit_price_pkr * item.quantity).toLocaleString()}
        </td>
      </tr>
    `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - ${order.order_number}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafaf9; margin: 0; padding: 40px 20px; color: #1c1917;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e7e5e4; padding: 40px;">
          <div style="text-align: center; border-bottom: 1px solid #e7e5e4; padding-bottom: 24px; margin-bottom: 32px;">
            <h1 style="font-family: Georgia, serif; font-size: 28px; letter-spacing: 2px; margin: 0; text-transform: uppercase; color: #1c1917;">${SITE_NAME}</h1>
            <p style="color: #78716c; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin: 8px 0 0;">Couture & Formal Wear</p>
          </div>

          <p style="font-size: 16px; margin: 0 0 16px;">Thank you for your order, <strong>${order.shipping_address.full_name}</strong>.</p>
          <p style="color: #78716c; font-size: 14px; margin: 0 0 24px; line-height: 1.5;">We have received your order <strong>#${order.order_number}</strong> and our team is preparing it for tailoring and fulfillment.</p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="border-bottom: 2px solid #1c1917;">
                <th style="text-align: left; padding-bottom: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #78716c;">Item</th>
                <th style="text-align: right; padding-bottom: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #78716c;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="background-color: #fafaf9; padding: 16px; margin-bottom: 24px; font-size: 14px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Subtotal:</span>
              <strong>Rs. ${order.subtotal_pkr.toLocaleString()}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Shipping:</span>
              <strong>Rs. ${order.shipping_pkr.toLocaleString()}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #e7e5e4; padding-top: 8px; font-size: 16px;">
              <span>Total:</span>
              <strong style="color: #1c1917;">Rs. ${order.total_pkr.toLocaleString()}</strong>
            </div>
            ${
              order.payment_option === "deposit"
                ? `
              <div style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed #d6d3d1; font-size: 13px; color: #a16207;">
                <div>Deposit Due Now (50%): <strong>Rs. ${order.deposit_amount_pkr.toLocaleString()}</strong></div>
                <div>Balance upon delivery: <strong>Rs. ${order.balance_amount_pkr.toLocaleString()}</strong></div>
              </div>
            `
                : ""
            }
          </div>

          <div style="margin-bottom: 32px; font-size: 14px; line-height: 1.6;">
            <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #78716c; margin-bottom: 8px;">Shipping Address</h3>
            <p style="margin: 0;">${order.shipping_address.full_name}</p>
            <p style="margin: 0;">${order.shipping_address.line1}${order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ""}</p>
            <p style="margin: 0;">${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}</p>
            <p style="margin: 0;">Phone: ${order.shipping_address.phone}</p>
          </div>

          <div style="text-align: center; border-top: 1px solid #e7e5e4; padding-top: 24px; color: #a8a29e; font-size: 12px;">
            <p style="margin: 0;">Questions? Reply directly to this email or reach us on WhatsApp.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function renderAdminNotificationHtml(order: Order): string {
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafaf9; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 24px; border: 1px solid #e7e5e4;">
          <h2 style="color: #1c1917; margin-top: 0;">New Order Placed: #${order.order_number}</h2>
          <p><strong>Customer:</strong> ${order.shipping_address.full_name} (${order.guest_email ?? "Registered Customer"})</p>
          <p><strong>Phone:</strong> ${order.shipping_address.phone}</p>
          <p><strong>Total:</strong> Rs. ${order.total_pkr.toLocaleString()} (${order.payment_option.toUpperCase()})</p>
          <p><strong>Payment Status:</strong> ${order.payment_status}</p>
          <p><strong>Destination:</strong> ${order.shipping_address.city}, ${order.shipping_address.country_code}</p>
          <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 16px 0;" />
          <p>Review and fulfill this order in the admin portal.</p>
        </div>
      </body>
    </html>
  `;
}
