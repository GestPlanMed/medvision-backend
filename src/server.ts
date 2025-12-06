import fastifyCookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import { fastify } from 'fastify'
import { fastifySwagger } from '@fastify/swagger'
import { fastifyCors } from '@fastify/cors'
import ScalarApiReference from '@scalar/fastify-api-reference'
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { PatientAuthRoutes } from './modules/patient/routes/auth.route'
import { AdminAuthRoutes } from './modules/admin/routes/auth.route'
import { PatientRoutes } from './modules/patient/routes/patient.routes'
import { DoctorAuthRoutes } from './modules/doctor/routes/auth.route'
import { DoctorRoutes } from './modules/doctor/routes/doctor.route'
import { AppointmentRoutes } from './modules/appointment/routes/appointment.route'

const version = process.env.API_VERSION || '1'

const server = fastify({
	trustProxy: true, // Importante para reconhecer HTTPS via proxy (Traefik)
}).withTypeProvider<ZodTypeProvider>()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

// Cookie ANTES do CORS para garantir que Set-Cookie seja processado corretamente
server.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET,
	parseOptions: {},
})

server.register(fastifyCors, {
	origin: [
		'http://localhost:5173',
		'https://medvision-frontend.vercel.app',
		'https://medvision.njsolutions.com.br'
	],
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
	exposedHeaders: ['Set-Cookie'],
})

// Hook para debug apenas de login
server.addHook('onRequest', async (request) => {
	if (request.url.includes('/auth/signin') || request.url.includes('/auth/verify-code')) {
		console.log('🔐 Login Request:', {
			method: request.method,
			url: request.url,
			origin: request.headers.origin,
			hostname: request.hostname,
		})
	}
})

server.addHook('onSend', async (request, reply) => {
	if (request.url.includes('/auth/signin') || request.url.includes('/auth/verify-code')) {
		const setCookieHeader = reply.getHeader('set-cookie')
		if (setCookieHeader) {
			console.log('🍪 Cookie configurado:', setCookieHeader)
		}
	}
})

server.register(fastifyJwt, {
	secret: process.env.JWT_SECRET || '',
	cookie: {
		cookieName: 'token',
		signed: false,
	},
	sign: {
		expiresIn: '24h',
	}
})

server.register(fastifySwagger, {
	openapi: {
		info: {
			title: `MedVision API v${version}`,
			version: version,
			description: 'API documentation',
		},
	},
	transform: jsonSchemaTransform,
})

server.register(ScalarApiReference, { routePrefix: `/v${version}/docs` })

server.register(AdminAuthRoutes, { prefix: `/v${version}/admin/auth` })
server.register(DoctorAuthRoutes, { prefix: `/v${version}/doctor/auth` })
server.register(PatientAuthRoutes, { prefix: `/v${version}/patient/auth` })

server.register(PatientRoutes, { prefix: `/v${version}/patient` })
server.register(DoctorRoutes, { prefix: `/v${version}/doctor` })
server.register(AppointmentRoutes, { prefix: `/v${version}/appointment` })

async function start() {
	try {
		await server.ready()
		await server.listen({ port: Number(process.env.PORT) || 3333, host: '0.0.0.0' })
		console.log(`Server listening at http://localhost:${Number(process.env.PORT) || 3333}`)
		console.log(`Docs listening at http://localhost:${Number(process.env.PORT) || 3333}/v${version}/docs`)
	} catch (err) {
		console.error('Error starting server:', err)
		server.log.error(err)
		process.exit(1)
	}
}

start()
