# Mejoras y Plan de Versionado para el Administrador de Finanzas

Este documento contiene sugerencias para futuras funcionalidades y una guía sobre cómo versionar la aplicación.

## Sugerencias de Nuevas Funcionalidades

### 1. Categorización de Transacciones
*   **Descripción:** Permitir a los usuarios asignar categorías (ej. "Comida", "Transporte", "Ocio") y subcategorías a cada gasto o ingreso.
*   **Impacto:** Facilita la creación de presupuestos y reportes visuales más útiles.

### 2. Módulo de Presupuestos (Budgeting)
*   **Descripción:** Una sección donde los usuarios puedan definir límites de gasto mensuales por categoría. La aplicación podría mostrar el progreso en tiempo real.
*   **Impacto:** Ayuda a los usuarios a ser proactivos en su control de gastos. Se podrían enviar notificaciones al acercarse a los límites.

### 3. Reportes y Analíticas Avanzadas
*   **Descripción:** Usar librerías como `Chart.js` o `Recharts` para crear:
    *   **Gráficos de Pastel:** Para visualizar la distribución de gastos.
    *   **Gráficos de Barras/Líneas:** Para comparar ingresos vs. gastos a lo largo del tiempo.
    *   **Análisis de Flujo de Efectivo:** Resumen de ingresos, gastos y ahorro neto del mes.
*   **Impacto:** Ofrece una visión clara y rápida de la salud financiera del usuario.

### 4. Exportación de Datos
*   **Descripción:** Permitir a los usuarios descargar su historial de transacciones o reportes en formatos como CSV o PDF.
*   **Impacto:** Da a los usuarios control y portabilidad sobre su información.

### 5. Mejoras en Metas de Ahorro (Goals)
*   **Descripción:** Permitir asociar transacciones de ahorro específicas a una meta.
*   **Impacto:** Hace que el seguimiento del progreso hacia una meta sea más tangible y motivador.

---

## Guía de Versionado de la Aplicación (Versionado Semántico - SemVer)

La estructura es `MAJOR.MINOR.PATCH` (ej. `1.0.0`).

### `PATCH` (ej. `1.0.1`)
*   **Cuándo usarlo:** Para correcciones de errores que no rompen la compatibilidad (`bug fixes`).

### `MINOR` (ej. `1.1.0`)
*   **Cuándo usarlo:** Para añadir nuevas funcionalidades que son compatibles con versiones anteriores.
*   **Acción recomendada:** Al implementar una de las funcionalidades sugeridas (ej. presupuestos), la versión debería pasar a `1.1.0`.

### `MAJOR` (ej. `2.0.0`)
*   **Cuándo usarlo:** Para cambios que rompen la compatibilidad con versiones anteriores (`breaking changes`). Por ejemplo, un cambio grande en la base de datos o la API.
