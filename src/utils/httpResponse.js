export const ok = (res, data) => res.status(200).json(data);

export const created = (res, data) => res.status(201).json(data);

export const noContent = (res) => res.status(204).send();

export const badRequestException = (res, message = "Solicitud inválida") =>
  res.status(400).json({ message });

export const unauthorizedException = (res, message = "No autenticado") =>
  res.status(401).json({ message });

export const forbiddenException = (res, message = "Acceso denegado") =>
  res.status(403).json({ message });

export const notFoundException = (res, message = "Recurso no encontrado") =>
  res.status(404).json({ message });

export const conflictException = (
  res,
  message = "Conflicto con el estado actual",
) => res.status(409).json({ message });

export const unprocessableException = (res, message = "Datos inválidos") =>
  res.status(422).json({ message });

export const internalException = (
  res,
  err,
  message = "Error interno del servidor",
) => {
  console.error(err);
  if (process.env.NODE_ENV === "development") {
    return res
      .status(500)
      .json({ message, error: err.message, stack: err.stack });
  }
  return res.status(500).json({ message });
};
