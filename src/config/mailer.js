import nodemailer from "nodemailer";
import { lookup } from "node:dns/promises";

const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 587;

// Nodemailer resuelve el host por su cuenta y elige AL AZAR entre las direcciones A (IPv4) y
// AAAA (IPv6) que devuelve el DNS. El contenedor de producción levanta interfaz IPv6 pero no
// tiene ruta de salida, así que cuando el sorteo caía en una AAAA la conexión moría con
// ENETUNREACH (en local nunca pasa: sin interfaz IPv6, nodemailer ni consulta los AAAA).
// Le pasamos la IPv4 ya resuelta; servername es obligatorio porque el host ahora es una IP y
// el certificado TLS debe validarse contra el nombre, no contra la dirección.
// No usar service: "gmail" — su preset se aplica al final del merge y pisa host y port.
const { address: ipv4Address } = await lookup(SMTP_HOST, { family: 4 });

const transporter = nodemailer.createTransport({
  host: ipv4Address,
  port: SMTP_PORT,
  servername: SMTP_HOST,
  requireTLS: true, // el puerto 587 negocia TLS con STARTTLS — nunca enviar en claro

  // Sin estos límites, una red caída tarda 2 minutos en fallar y Stripe corta el webhook a los 20 s
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,

  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export { transporter };
