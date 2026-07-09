const emailVerificationTemplate = (name, verificationUrl) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FFF8F0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:30px;">
    <h1 style="color:#E63946;font-size:28px;margin:0;">🍕 PizzaCraft</h1>
  </div>
  <div style="background:#fff;border-radius:16px;padding:40px;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
    <h2 style="color:#1A1A1A;font-size:22px;margin:0 0 16px;">Welcome, ${name}!</h2>
    <p style="color:#666;font-size:16px;line-height:1.6;margin:0 0 24px;">
      Thanks for joining PizzaCraft! Please verify your email address to get started.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${verificationUrl}" style="background:#E63946;color:#fff;padding:14px 40px;border-radius:12px;text-decoration:none;font-size:16px;font-weight:600;display:inline-block;">
        Verify Email
      </a>
    </div>
    <p style="color:#999;font-size:13px;text-align:center;">This link expires in 24 hours.</p>
  </div>
</div>
</body>
</html>`;

const passwordResetTemplate = (name, resetUrl) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FFF8F0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:30px;">
    <h1 style="color:#E63946;font-size:28px;margin:0;">🍕 PizzaCraft</h1>
  </div>
  <div style="background:#fff;border-radius:16px;padding:40px;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
    <h2 style="color:#1A1A1A;font-size:22px;margin:0 0 16px;">Password Reset</h2>
    <p style="color:#666;font-size:16px;line-height:1.6;">Hi ${name}, click the button below to reset your password.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${resetUrl}" style="background:#E63946;color:#fff;padding:14px 40px;border-radius:12px;text-decoration:none;font-size:16px;font-weight:600;display:inline-block;">
        Reset Password
      </a>
    </div>
    <p style="color:#999;font-size:13px;text-align:center;">If you didn't request this, please ignore this email.</p>
  </div>
</div>
</body>
</html>`;

const orderConfirmationTemplate = (name, orderNumber, total, items) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FFF8F0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:30px;">
    <h1 style="color:#E63946;font-size:28px;margin:0;">🍕 PizzaCraft</h1>
  </div>
  <div style="background:#fff;border-radius:16px;padding:40px;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
    <h2 style="color:#1A1A1A;font-size:22px;margin:0 0 8px;">Order Confirmed! 🎉</h2>
    <p style="color:#666;font-size:16px;line-height:1.6;">Hi ${name}, your order <strong>#${orderNumber}</strong> has been placed successfully.</p>
    <div style="background:#FFF8F0;border-radius:12px;padding:20px;margin:24px 0;">
      ${items.map((item) => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0e6d9;"><span style="color:#1A1A1A;">${item.name} x${item.quantity}</span><span style="color:#E63946;font-weight:600;">₹${item.price}</span></div>`).join('')}
      <div style="display:flex;justify-content:space-between;padding:12px 0 0;"><strong style="color:#1A1A1A;">Total</strong><strong style="color:#E63946;font-size:18px;">₹${total}</strong></div>
    </div>
    <p style="color:#999;font-size:13px;text-align:center;">You can track your order in real-time from your dashboard.</p>
  </div>
</div>
</body>
</html>`;

const lowStockTemplate = (items) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FFF8F0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:30px;">
    <h1 style="color:#E63946;font-size:28px;margin:0;">🍕 PizzaCraft Admin</h1>
  </div>
  <div style="background:#fff;border-radius:16px;padding:40px;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
    <h2 style="color:#E63946;font-size:22px;margin:0 0 16px;">⚠️ Inventory Running Low</h2>
    <p style="color:#666;font-size:16px;line-height:1.6;">The following items are running low on stock:</p>
    <div style="margin:24px 0;">
      ${items.map((item) => `<div style="background:#FFF5F5;border-left:4px solid #E63946;padding:12px 16px;margin:8px 0;border-radius:0 8px 8px 0;"><strong style="color:#1A1A1A;">${item.name}</strong> <span style="color:#E63946;">(${item.quantity} ${item.unit} remaining)</span></div>`).join('')}
    </div>
    <p style="color:#999;font-size:13px;">Please restock these items to avoid service disruption.</p>
  </div>
</div>
</body>
</html>`;

module.exports = {
    emailVerificationTemplate,
    passwordResetTemplate,
    orderConfirmationTemplate,
    lowStockTemplate,
};
