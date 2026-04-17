# CineSwipe 🎬

CineSwipe es una aplicación web de descubrimiento de películas construida con React, TypeScript y Vite, con persistencia en tiempo real mediante Supabase.

## 🚀 Tecnologías Principales

- **React 18** + Vite
- **TypeScript** para seguridad de tipos
- **Tailwind CSS** para un diseño premium y responsive
- **Supabase** como Backend-as-a-Service (Persistencia de Swipes)
- **Vitest** + React Testing Library para calidad de software
- **GitHub Actions** para CI/CD automatizado

## 🛠️ Configuración

Para ejecutar este proyecto, necesitas configurar las siguientes variables de entorno en un archivo `.env`:

```env
VITE_TMDB_KEY=tu_llave_de_tmdb
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

## 📜 Comandos Disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run test`: Ejecuta la suite de pruebas unitarias.
- `npm run lint`: Verifica la calidad del código con ESLint 9.
- `npm run build`: Genera el paquete de producción optimizado.

## 🧪 Calidad y despliegue

Este proyecto incluye un flujo de **Integración Continua (CI)** en GitHub Actions que valida cada cambio mediante:
1. **Linting**: Verificación de reglas de código.
2. **Testing**: Ejecución de tests de regresión.
3. **Building**: Validación de que el código compila para producción.

---
*Desarrollado con arquitectura modular y escalable.*
