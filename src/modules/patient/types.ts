import { FastifyRequest } from 'fastify'

export interface AuthRequest extends FastifyRequest {
	user: {
        userId?: string
        id?: string
    }
    userId?: string
}
