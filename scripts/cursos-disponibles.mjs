import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const proyecto = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const texto = fs.readFileSync(path.join(proyecto, '.env'), 'utf8')
for (const linea of texto.split(/\r?\n/)) {
	const limpia = linea.trim()
	if (!limpia || limpia.startsWith('#')) continue
	const sep = limpia.indexOf('=')
	if (sep === -1) continue
	const clave = limpia.slice(0, sep).trim()
	let valor = limpia.slice(sep + 1).trim()
	if (
		(valor.startsWith('"') && valor.endsWith('"')) ||
		(valor.startsWith("'") && valor.endsWith("'"))
	) {
		valor = valor.slice(1, -1)
	}
	if (!process.env[clave]) process.env[clave] = valor
}

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
})

const { rowCount } = await pool.query(
	`UPDATE cursos SET estado = 'confirmado', actualizado_en = now() WHERE estado IS DISTINCT FROM 'confirmado'`,
)
console.log('cursos actualizados a disponible:', rowCount)
await pool.end()
