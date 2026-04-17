import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

// Leer el .env
const envContent = readFileSync('/home/ubuntu/farmacompara/.env', 'utf8');
const dbUrl = envContent.match(/DATABASE_URL=(.+)/)?.[1]?.trim();

if (!dbUrl) {
  console.error('No se encontró DATABASE_URL');
  process.exit(1);
}

const conn = await mysql.createConnection(dbUrl);

// Ver los primeros productos de Farmacenter
const [rows] = await conn.execute(
  `SELECT p.nombre_normalizado, p.principio_activo, pr.nombre_en_farmacia 
   FROM precios pr 
   JOIN productos p ON pr.producto_id = p.id 
   JOIN farmacias f ON pr.farmacia_id = f.id 
   WHERE f.slug = 'farmacenter' 
   LIMIT 5`
);
console.log('Farmacenter productos:');
rows.forEach(r => console.log(`  nombre_normalizado: "${r.nombre_normalizado}", principio_activo: "${r.principio_activo}", nombre_farmacia: "${r.nombre_en_farmacia}"`));

// Contar por farmacia
const [counts] = await conn.execute(
  `SELECT f.nombre, COUNT(*) as total FROM precios pr 
   JOIN farmacias f ON pr.farmacia_id = f.id 
   GROUP BY f.nombre`
);
console.log('\nConteo por farmacia:', counts);

// Verificar si la búsqueda de ibuprofeno funciona
const [searchResult] = await conn.execute(
  `SELECT COUNT(*) as total FROM precios pr 
   JOIN productos p ON pr.producto_id = p.id 
   JOIN farmacias f ON pr.farmacia_id = f.id 
   WHERE f.slug = 'farmacenter' 
   AND (pr.nombre_en_farmacia LIKE '%ibuprofeno%' 
        OR p.nombre_normalizado LIKE '%ibuprofeno%'
        OR p.principio_activo LIKE '%ibuprofeno%')`
);
console.log('\nFarmacenter con búsqueda ibuprofeno:', searchResult[0].total);

await conn.end();
