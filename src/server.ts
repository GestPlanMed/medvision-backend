import { fastify } from 'fastify'

import {
	serializerCompiler,
	validatorCompiler,
	jsonSchemaTransform,
} from 'fastify-type-provider-zod'

import { fastifySwagger } from '@fastify/swagger'
import { fastifyCors } from '@fastify/cors'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import ScalarApiReference from '@scalar/fastify-api-reference'

const version = process.env.API_VERSION || '1'

const server = fastify().withTypeProvider<ZodTypeProvider>()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.register(fastifyCors, {
	origin: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	credentials: true,
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

server.register(ScalarApiReference, {
	routePrefix: `/v${version}/docs`,
})

server.listen({ port: 3333, host: '0.0.0.0' }, (err, address) => {
	if (err) {
		server.log.error(err)
		process.exit(1)
	}
	console.log(`Server listening at ${address}`)
	console.log(`Docs listening at ${address}/v${version}/docs`)
})
