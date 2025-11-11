import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'

export interface AuthUser {
	id: string
	email: string
	role: 'admin' | 'doctor' | 'patient'
	name: string
}

declare module 'fastify' {
	interface FastifyRequest {
		user?: AuthUser
	}

	interface FastifyInstance {
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
	}
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
	fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			const token = request.cookies.token

			if (!token) {
				return reply.status(401).send({
					message: 'Token não encontrado. Faça login novamente.',
				})
			}

			const decoded = (await request.jwtVerify()) as AuthUser
			request.user = decoded
		} catch {
			return reply.status(401).send({
				message: 'Token inválido ou expirado.',
			})
		}
	})
}

export const authenticate = fp(authPlugin, {
	name: 'authenticate',
	dependencies: ['@fastify/jwt', '@fastify/cookie'],
})
