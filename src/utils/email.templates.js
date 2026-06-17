export const orderConfirmationClient = ({ order, items }) => ({
  subject: `Confirmación de orden #${order.id} — Ferretería Kevza`,
  html: `
    <h2>¡Gracias por tu compra!</h2>
    <p>Tu orden <strong>#${order.id}</strong> fue recibida y está siendo procesada.</p>
    <h3>Productos</h3>
    <ul>
      ${items.map((item) => `<li>${item.name} × ${item.quantity} — $${item.unitPrice}</li>`).join("")}
    </ul>
    <p><strong>Total: $${order.total}</strong></p>
  `,
});

export const orderConfirmationOwner = ({ order, items }) => ({
  subject: `Nueva orden #${order.id} recibida`,
  html: `
    <h2>Nueva orden recibida</h2>
    <p>El cliente <strong>${order.user?.username}</strong> realizó una compra.</p>
    <h3>Productos</h3>
    <ul>
      ${items.map((item) => `<li>${item.name} × ${item.quantity} — $${item.unitPrice}</li>`).join("")}
    </ul>
    <p><strong>Total: $${order.total}</strong></p>
  `,
});

export const orderStatusChanged = ({ order, newStatus }) => ({
  subject: `Tu orden #${order.id} fue actualizada`,
  html: `
    <h2>Estado de tu orden actualizado</h2>
    <p>Tu orden <strong>#${order.id}</strong> cambió a estado: <strong>${newStatus}</strong>.</p>
  `,
});

export const passwordResetEmail = ({ resetUrl }) => ({
  subject: "Restablecer contraseña — Ferretería Kevza",
  html: `
    <h2>Restablecer contraseña</h2>
    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
    <p>Haz clic en el siguiente enlace para continuar. Este enlace expira en <strong>15 minutos</strong>.</p>
    <p><a href="${resetUrl}" style="background:#e63946;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;">Restablecer contraseña</a></p>
    <p>Si no solicitaste esto, ignora este correo.</p>
  `,
});
