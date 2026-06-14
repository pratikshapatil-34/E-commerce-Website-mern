import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Send email
export const sendEmail = async (options) => {
  const transporter = createTransporter();

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

// Email templates
export const getEmailTemplate = (type, data) => {
  const templates = {
    welcome: {
      subject: 'Welcome to ShopVerse!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to ShopVerse!</h1>
          <p>Hi ${data.name},</p>
          <p>Thank you for creating an account with us. We're excited to have you on board!</p>
          <p>Start shopping now and discover amazing products at great prices.</p>
          <a href="${process.env.CLIENT_URL}/products" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            Start Shopping
          </a>
          <p style="margin-top: 24px; color: #666;">Happy shopping!<br>The ShopVerse Team</p>
        </div>
      `,
    },
    resetPassword: {
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Reset Your Password</h1>
          <p>Hi ${data.name || 'there'},</p>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <a href="${data.resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            Reset Password
          </a>
          <p style="margin-top: 16px; color: #666;">This link will expire in 10 minutes.</p>
          <p style="color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    },
    orderConfirmation: {
      subject: `Order Confirmation - ${data.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Order Confirmed!</h1>
          <p>Hi ${data.name},</p>
          <p>Thank you for your order! We've received your order and will begin processing it soon.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p style="margin: 8px 0 0;"><strong>Total:</strong> $${data.total}</p>
          </div>
          <a href="${process.env.CLIENT_URL}/orders/${data.orderId}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px;">
            View Order Details
          </a>
        </div>
      `,
    },
    orderShipped: {
      subject: `Your Order Has Shipped - ${data.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Your Order Has Shipped!</h1>
          <p>Hi ${data.name},</p>
          <p>Great news! Your order is on its way.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p style="margin: 8px 0 0;"><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
          </div>
          <a href="${process.env.CLIENT_URL}/orders/${data.orderId}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px;">
            Track Your Order
          </a>
        </div>
      `,
    },
  };

  return templates[type];
};
