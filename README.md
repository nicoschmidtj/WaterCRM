# WaterCRM (local)
Minimal CRM para **Dashboard / Clientes / Gestiones** con Next.js 14 + Prisma (SQLite) + Tailwind.
## Uso local recomendado

La aplicación está pensada para ejecutarse **en tu máquina local**. Usa GitHub solo para revisar cambios y abrir Pull Requests.

### Preparación
```bash
npm install
npx prisma generate
# si es la primera vez con la base:
npx prisma migrate dev --name init
```

### Scripts de DX
```bash
npm run lint
npm run typecheck
npm run check   # lint + typecheck
```

### Ejecutar
```bash
npm run dev
```
Visita http://localhost:3000

### Notas para Windows/OneDrive
Si la carpeta del proyecto está dentro de rutas con espacios, usa comillas en los comandos (`"C:\\ruta con espacios\\WaterCRM"`). Evita sincronizar la carpeta con OneDrive para prevenir bloqueos de archivos.

### Troubleshooting
- Reinstala dependencias si aparece un error de módulo faltante (`rm -rf node_modules && npm install`).
- Asegúrate de tener Node 20+. 
- Si Prisma no encuentra la base, revisa `DATABASE_URL` en `.env`.
