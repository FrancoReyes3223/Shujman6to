// Detecta automáticamente si está corriendo en el servidor de clase o en local.
// En el servidor la URL base del sitio empieza con /~usuario/
export const API_BASE =
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/~")
    ? `/${window.location.pathname.split("/")[1]}/api/v1`
    : "http://localhost:3001/v1";
