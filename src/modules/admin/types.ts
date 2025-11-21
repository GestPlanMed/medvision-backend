import type { FastifyRequest } from 'fastify'

export interface AuthRequest extends FastifyRequest {
	user: {
		userId?: string
		id?: string
	}
	userId?: string
}

export interface AdminData {
	id: string
	name: string
	email: string
	password: string
	resetCode?: string | null
	createdAt: string
	updatedAt: string
}
