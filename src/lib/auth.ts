import { createHmac, timingSafeEqual } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

export const NOMBRE_COOKIE_ADMIN = 'admin_sesion'

const MARCA_SESION = 'training4you-admin'

function limpiarValor(valor: string) {
	const limpio = valor.trim()
	if (
		(limpio.startsWith('"') && limpio.endsWith('"')) ||
		(limpio.startsWith("'") && limpio.endsWith("'"))
	) {
		return limpio.slice(1, -1)
	}
	return limpio
}

function leerDesdeArchivoEnv(nombre: string) {
	try {
		const texto = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8')
		for (const linea of texto.split(/\r?\n/)) {
			const limpia = linea.trim()
			if (!limpia || limpia.startsWith('#')) continue
			const sep = limpia.indexOf('=')
			if (sep === -1) continue
			if (limpia.slice(0, sep).trim() !== nombre) continue
			return limpiarValor(limpia.slice(sep + 1))
		}
	} catch {
		// En producción (Netlify) el .env local no existe; se usan variables del hosting.
	}
	return ''
}

function leerEnv(nombre: 'ADMIN_SECRET' | 'ADMIN_PASSWORD') {
	const desdeProceso = process.env[nombre]
	if (desdeProceso) return limpiarValor(desdeProceso)

	const desdeImport = import.meta.env[nombre]
	if (typeof desdeImport === 'string' && desdeImport) {
		return limpiarValor(desdeImport)
	}

	return leerDesdeArchivoEnv(nombre)
}

function secretoAdmin() {
	const secret = leerEnv('ADMIN_SECRET')
	if (!secret) {
		throw new Error('Falta ADMIN_SECRET en .env')
	}
	return secret
}

export function valorCookieSesion() {
	return createHmac('sha256', secretoAdmin()).update(MARCA_SESION).digest('hex')
}

export function sesionValida(token: string | undefined) {
	if (!token) return false
	const esperado = valorCookieSesion()
	const a = Buffer.from(token)
	const b = Buffer.from(esperado)
	if (a.length !== b.length) return false
	return timingSafeEqual(a, b)
}

export function passwordCorrecta(password: string) {
	const esperada = leerEnv('ADMIN_PASSWORD')
	if (!esperada) return false

	const a = Buffer.from(password)
	const b = Buffer.from(esperada)
	if (a.length !== b.length) return false
	return timingSafeEqual(a, b)
}

export function adminPasswordConfigurada() {
	return Boolean(leerEnv('ADMIN_PASSWORD'))
}
