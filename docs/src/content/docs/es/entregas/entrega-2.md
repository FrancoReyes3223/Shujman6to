---
title: Entrega 2 — Dashboard, Documentación e Internacionalización
description: Panel de control con gestión de empleados y productos, sitio de documentación y sistema de traducción ES/EN.
---

## ¿Qué se hizo en esta entrega?

Se agregó el dashboard completo con tres vistas funcionales (Resumen, Empleados y Productos), el sitio de documentación con Astro/Starlight, y el sistema de internacionalización que permite usar la app en español e inglés.

---

## Dashboard

El dashboard es la pantalla principal a la que accede el usuario después de iniciar sesión. Está protegida por JWT: si no hay token válido, redirige automáticamente al login.

### Estructura del layout

```
DashboardPage
├── Sidebar          # Navegación lateral con tabs y logout
└── main
    ├── OverviewView    # Tab: Resumen
    ├── EmployeesView   # Tab: Empleados
    └── ProductsView    # Tab: Productos
```

El sidebar es colapsable: tiene un botón de toggle que permite ocultarlo para ganar espacio en pantalla.

---

### Resumen (Overview)

Muestra tres métricas en tiempo real calculadas a partir de los datos en memoria:

| Métrica            | Descripción                                      |
|--------------------|--------------------------------------------------|
| Total Empleados    | Cantidad de empleados en la lista                |
| Productos en Catálogo | Total de productos registrados                |
| Alertas de Stock   | Productos con estado `Low` o `Out of Stock`      |

Las alertas se muestran en rojo si hay al menos una, y en dorado si no hay ninguna.

---

### Empleados

Lista de personal de la empresa con operaciones CRUD:

| Columna      | Descripción                               |
|--------------|-------------------------------------------|
| Nombre       | Nombre completo del empleado              |
| Cargo        | Puesto que ocupa                          |
| Departamento | Área a la que pertenece                   |
| Estado       | `Activo`, `Vacaciones` o `Inactivo`       |
| Acciones     | Botones de editar y eliminar              |

**Agregar empleado** — botón `+ Nuevo Empleado` abre un modal con formulario.  
**Editar** — ícono de lápiz abre el mismo modal precargado con los datos actuales.  
**Eliminar** — ícono de papelera abre un modal de confirmación antes de borrar.

Los datos iniciales son de ejemplo y viven en memoria del navegador (no se persisten en la base de datos todavía).

---

### Productos

Catálogo de productos y servicios con operaciones CRUD:

| Columna           | Descripción                                    |
|-------------------|------------------------------------------------|
| Nombre            | Nombre del producto o servicio                 |
| Categoría         | Tipo (ej: Hardware, Servicios)                 |
| Precio            | Precio con formato `$0.00`                     |
| Stock             | Cantidad disponible o `Ilimitado`              |
| Estado            | `Normal`, `Low` o `Out of Stock`               |
| Acciones          | Botones de editar y eliminar                   |

El estado `Out of Stock` y `Low` disparan alertas en el Resumen. El precio se normaliza automáticamente para incluir el símbolo `$` si no se lo escribe.

---

## Documentación

El sitio de documentación está construido con **Astro** y el tema **Starlight**. Se publica junto al frontend en el servidor de la facu.

### Estructura

```
docs/
├── src/
│   ├── components/        # Componentes Astro custom
│   │   ├── SiteTitle.astro    # Logo/nombre en la top bar
│   │   ├── ThemeSelect.astro  # Toggle de tema claro/oscuro
│   │   └── LanguageSelect.astro # Selector de idioma
│   ├── content/docs/
│   │   ├── es/            # Documentación en español
│   │   └── en/            # Documentación en inglés
│   └── styles/custom.css  # Tema azul que coincide con el frontend
└── astro.config.mjs       # Configuración de Starlight
```

### Cómo levantar el sitio de docs

```bash
cd docs
npm install
npm run dev   # Puerto 4321
```

Para construir y publicar:

```bash
USUARIO=tuusuario npm run build
```

---

## Internacionalización (i18n)

La app soporta **español** e **inglés** usando `i18next` con `react-i18next`.

### Cómo funciona

Las traducciones están definidas en `frontend/lib/i18n.ts` como dos objetos (`en` y `es`) con claves en común. Al iniciar, i18next toma el idioma del `localStorage`; si no hay preferencia guardada, usa **español** por defecto.

```ts
// frontend/lib/i18n.ts
const en = {
  sign_in: "Sign In",
  emp_title: "Employee Directory",
  // ...
};

const es = {
  sign_in: "Iniciar Sesión",
  emp_title: "Directorio de Empleados",
  // ...
};
```

### Cómo usar una traducción en un componente

```tsx
import { useTranslation } from "react-i18next";

function MiComponente() {
  const { t } = useTranslation();
  return <h1>{t("emp_title", "Employee Directory")}</h1>;
}
```

El segundo argumento de `t()` es el fallback en caso de que la clave no exista.

### Cambiar de idioma

El componente `LanguageSwitcher` (visible en la esquina superior derecha del dashboard) permite cambiar entre ES e EN en tiempo real. Guarda la preferencia en `localStorage`.

### Claves disponibles

Las claves están agrupadas por sección en `lib/i18n.ts`:

| Grupo        | Ejemplos de claves                                       |
|--------------|----------------------------------------------------------|
| Auth         | `sign_in`, `password_label`, `email_label`               |
| Sidebar      | `sidebar_employees`, `sidebar_overview`, `logout`        |
| Overview     | `overview_title`, `overview_total_emp`, `overview_stock_alerts` |
| Empleados    | `emp_title`, `emp_btn_new`, `emp_col_role`, `emp_delete_confirm` |
| Productos    | `prod_title`, `prod_btn_new`, `prod_col_price`, `status_out` |
| General      | `btn_save`, `btn_cancel`, `btn_delete`, `docs_button`    |
