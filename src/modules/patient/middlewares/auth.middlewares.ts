import { FastifyReply } from 'fastify'
import { AuthRequest } from '../types'

export const authMiddleware = async (req: AuthRequest, reply: FastifyReply) => {
	try {
		await req.jwtVerify()
		req.userId = req.user.userId || req.user.id
	} catch (error) {
		return reply.status(401).send({ message: 'Token inválido ou expirado' })
	}
}
