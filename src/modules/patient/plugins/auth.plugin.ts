import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'

const authPlugin: FastifyPluginAsync = async (fastify) => {
	fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			// Verifica se existe o cookie de token
			const token = request.cookies.token

			if (!token) {
				return reply.status(401).send({ message: 'Token não encontrado. Faça login novamente.' })
			}

			// Verifica e decodifica o token
			const decoded = await request.jwtVerify()

			// Adiciona os dados do usuário ao request para uso posterior
			request.user = decoded
		} catch {
			return reply.status(401).send({ message: 'Token inválido ou expirado.' })
		}
	})
}

export const authPatient = fp(authPlugin, {
	name: 'authenticate-patient',
	dependencies: ['@fastify/jwt', '@fastify/cookie'],
})
