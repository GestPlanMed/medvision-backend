import '@fastify/jwt'
import type { AuthUser } from '../plugins/auth.plugin'

declare module 'fastify' {
	interface FastifyRequest {
		user?: AuthUser
	}

	interface FastifyInstance {
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
	}
}

declare module '@fastify/jwt' {
	interface FastifyJWT {
		user: AuthUser
	}
}
