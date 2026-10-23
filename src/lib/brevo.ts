export type SolicitudEmail = {
	nombre: string
	apellidos: string
	email: string
	whatsapp: string
	motivo: string
	area: string
	mensaje: string | null
}

function escapeHtml(texto: string) {
	return texto
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
}

function apiKeyBrevo() {
	const apiKey = import.meta.env.BREVO_API_KEY
	if (!apiKey) {
		throw new Error('Falta BREVO_API_KEY en .env')
	}
	return apiKey
}

/** Crea o actualiza el contacto en Brevo (lista Contactos). */
export async function guardarContactoBrevo(solicitud: SolicitudEmail) {
	const apiKey = apiKeyBrevo()

	const respuesta = await fetch('https://api.brevo.com/v3/contacts', {
		method: 'POST',
		headers: {
			accept: 'application/json',
			'content-type': 'application/json',
			'api-key': apiKey,
		},
		body: JSON.stringify({
			email: solicitud.email,
			updateEnabled: true,
			attributes: {
				FIRSTNAME: solicitud.nombre,
				LASTNAME: solicitud.apellidos,
			},
		}),
	})

	// 201 creado; con updateEnabled también puede devolver 204
	if (!respuesta.ok && respuesta.status !== 204) {
		const detalle = await respuesta.text()
		throw new Error(`Brevo contactos ${respuesta.status}: ${detalle}`)
	}
}

export async function avisarNuevaSolicitud(solicitud: SolicitudEmail) {
	const apiKey = apiKeyBrevo()
	const remitente = import.meta.env.BREVO_REMITENTE
	const destino = import.meta.env.BREVO_DESTINO

	if (!remitente || !destino) {
		throw new Error('Faltan BREVO_REMITENTE o BREVO_DESTINO en .env')
	}

	const nombreCompleto = `${solicitud.nombre} ${solicitud.apellidos}`.trim()
	const asunto = `Nueva solicitud · ${solicitud.motivo} · ${solicitud.area}`
	const mensajeHtml = solicitud.mensaje
		? escapeHtml(solicitud.mensaje)
		: '<em>(sin mensaje)</em>'

	const htmlContent = `
		<p>Nueva solicitud en Training 4 You.</p>
		<ul>
			<li><strong>Nombre:</strong> ${escapeHtml(nombreCompleto)}</li>
			<li><strong>Email:</strong> ${escapeHtml(solicitud.email)}</li>
			<li><strong>WhatsApp:</strong> ${escapeHtml(solicitud.whatsapp)}</li>
			<li><strong>Motivo:</strong> ${escapeHtml(solicitud.motivo)}</li>
			<li><strong>Área:</strong> ${escapeHtml(solicitud.area)}</li>
			<li><strong>Mensaje:</strong> ${mensajeHtml}</li>
		</ul>
	`

	const respuesta = await fetch('https://api.brevo.com/v3/smtp/email', {
		method: 'POST',
		headers: {
			accept: 'application/json',
			'content-type': 'application/json',
			'api-key': apiKey,
		},
		body: JSON.stringify({
			sender: {
				name: 'Training 4 You',
				email: remitente,
			},
			to: [{ email: destino }],
			replyTo: {
				email: solicitud.email,
				name: nombreCompleto,
			},
			subject: asunto,
			htmlContent,
		}),
	})

	if (!respuesta.ok) {
		const detalle = await respuesta.text()
		throw new Error(`Brevo ${respuesta.status}: ${detalle}`)
	}
}
