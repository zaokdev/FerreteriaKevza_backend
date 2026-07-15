const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const SENDER_NAME = "Ferretería Kevza";

// Render bloquea los puertos SMTP salientes (25/465/587) como política antispam, así que
// Gmail por SMTP es inalcanzable desde producción por más que el código sea correcto.
// Brevo envía por HTTPS (puerto 443), que nunca está bloqueado. El remitente sigue siendo la
// misma cuenta de Gmail, verificada en Brevo como sender (MAIL_FROM).
//
// Único punto de envío de correos — el remitente se inyecta acá, no en cada llamada.
export async function sendMail({ to, subject, html }) {
  const response = await fetch(BREVO_ENDPOINT, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: process.env.MAIL_FROM, name: SENDER_NAME },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
    // Fallar rápido: nunca dejar colgado un webhook esperando al proveedor de correo
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Brevo respondió ${response.status} — ${await response.text()}`);
  }

  return response.json();
}
