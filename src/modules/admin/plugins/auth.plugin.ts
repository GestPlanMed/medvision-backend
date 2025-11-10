import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'

const authPlugin: FastifyPluginAsync = async (fastify) => {
	fastify.decorate('authenticate', () => {
		return async (request: FastifyRequest, reply: FastifyReply) => {
			try {
				console.log(request.cookies)
			} catch (err) {
				return reply.status(401).send({ message: 'Unauthorized' })
			}
		}
	})
}

export const authPatient = fp(authPlugin, {
	name: 'authenticate-patient',
	dependencies: ['fastify-jwt', 'fastify-cookie'],
})
