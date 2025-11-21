import { fastify } from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import { fastifySwagger } from '@fastify/swagger'
import { fastifyCors } from '@fastify/cors'
import ScalarApiReference from '@scalar/fastify-api-reference'
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { PatientAuthRoutes } from './modules/patient/routes/auth.route'
import { AdminAuthRoutes } from './modules/admin/routes/auth.route'
import { PatientRoutes } from './modules/patient/routes/patient.routes'
import { DoctorAuthRoutes } from './modules/doctor/routes/auth.route'

const version = process.env.API_VERSION || '1'

const server = fastify().withTypeProvider<ZodTypeProvider>()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.register(fastifyCors, {
	origin: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	credentials: true,
})

server.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET,
	parseOptions: {},
})

server.register(fastifyJwt, {
	secret: process.env.JWT_SECRET || '',
	cookie: {
		cookieName: 'token',
		signed: false,
	},
	sign: {
		expiresIn: '24h',
	},
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
