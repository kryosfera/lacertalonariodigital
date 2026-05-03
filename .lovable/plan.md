## Reset de datos para lanzamiento limpio

Voy a borrar los datos transaccionales de prueba conservando catálogo (productos, categorías, recomendaciones), perfiles profesionales, roles y cuentas de usuario.

### Datos a eliminar

| Tabla / Bucket | Registros actuales | Acción |
|---|---|---|
| `ticket_messages` | 1 | DELETE total |
| `tickets` | 1 | DELETE total |
| Storage `ticket-attachments` | — | Vaciado completo |
| `recipes` | 19 | DELETE total |
| `short_urls` | 43 | DELETE total |
| `patients` | 3 | DELETE total |

### Datos que se conservan

- `profiles` (datos de clínica, firma, logo)
- `user_roles` (admin se mantiene)
- `auth.users` (cuentas)
- `products`, `categories`, `recommendations`, `recipe_templates`

### Implementación técnica

1. Migración SQL en orden seguro respetando dependencias lógicas:
   ```sql
   DELETE FROM ticket_messages;
   DELETE FROM tickets;
   DELETE FROM short_urls;
   DELETE FROM recipes;
   DELETE FROM patients;
   ```
2. Vaciar bucket `ticket-attachments` con `DELETE FROM storage.objects WHERE bucket_id = 'ticket-attachments';`.

### Notas

- Operación irreversible. Los contadores del dashboard admin volverán a cero automáticamente.
- No se modifican esquemas ni RLS.
- Tras la migración, recomiendo refrescar la pestaña de admin para invalidar la caché de TanStack Query.
