# CarpinChords - Backend 🎸

Este repositorio contiene el desarrollo del lado del servidor para **CarpinChords**, un marketplace integral de instrumentos y accesorios musicales. El proyecto fue presentado y aprobado como el **Trabajo Final Integrador (TFI)** de la Tecnicatura Universitaria en Programación de la **UTN FRRo**.

## 🚀 Despliegue y Enlaces
> **Nota:** En caso de alertas preventivas en el dominio principal por parte del navegador, utilizar el enlace de acceso directo.

- **API URL (Railway):** [https://carpinchords-backend.up.railway.app](https://carpinchords-backend.up.railway.app)
- **Frontend URL:** [https://carpinchords.pages.dev](https://carpinchords.pages.dev)
- **Acceso directo Frontend:** [https://carpinchords.pages.dev/home](https://carpinchords.pages.dev/home)
- **Repositorio Backend:** [https://github.com/Facu-Team-TFI/backend](https://github.com/Facu-Team-TFI/backend)
- **Repositorio Frontend:** [https://github.com/Facu-Team-TFI/frontend](https://github.com/Facu-Team-TFI/frontend)

## 🛠️ Tecnologías y Herramientas
- **Runtime:** Node.js con Express.js.
- **Base de Datos:** MySQL (desplegada en **Aiven**).
- **Hosting de Imágenes:** Cloudinary.
- **Comunicación en Tiempo Real:** Socket.io para la gestión de chat y notificaciones.
- **Seguridad:** Autenticación mediante JSON Web Tokens (JWT) y encriptación con bcrypt.
- **Gestión de Configuración:** Uso de variables de entorno mediante archivos **.env**.
- **Servicio de Email:** Nodemailer para la funcionalidad de recuperación de contraseñas.

> **Nota sobre el transporte SMTP:** La funcionalidad de recuperación de contraseña por email está desarrollada pero no operativa en el despliegue de Railway, debido a que su plan gratuito restringe el tráfico de salida por los puertos SMTP.

## 👥 Roles de Usuario
El acceso al sistema requiere registro obligatorio. Se definen tres tipos de perfiles:
1. **Comprador:** Rol inicial tras el registro. Permite navegar por el catálogo y realizar transacciones.
2. **Vendedor:** Los compradores pueden adquirir este rol aceptando las políticas correspondientes para publicar y gestionar sus propios artículos.
3. **Administrador:** Perfil de gestión interna; el registro de nuevos administradores solo puede ser efectuado por un administrador ya existente.

## ⚙️ Configuración de Variables de Entorno (.env)
El proyecto requiere un archivo `.env` en la raíz para su correcto funcionamiento. Se adjunta una plantilla de las variables necesarias en `.env.template`
