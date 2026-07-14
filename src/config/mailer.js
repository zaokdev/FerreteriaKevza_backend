import nodemailer from "nodemailer";
import { lookup } from "node:dns/promises";

const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 587;
const { address: ipv4Address } = await lookup(SMTP_HOST, { family: 4 });

const transporter = nodemailer.createTransport({
  host: ipv4Address,
  port: SMTP_PORT,
  servername: SMTP_HOST,

  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export { transporter };
