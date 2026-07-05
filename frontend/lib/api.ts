// Detecta automáticamente si está corriendo en el servidor de clase o en local.
// En el servidor la URL base del sitio empieza con /~usuario/
export const API_BASE =
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/~")
    ? `/${window.location.pathname.split("/")[1]}/api/v1`
    : "http://localhost:3001/v1";

// Base para archivos servidos estáticamente (uploads): API_BASE sin el sufijo /v1.
export const MEDIA_BASE = API_BASE.replace(/\/v1$/, "");
