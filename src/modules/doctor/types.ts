import type { FastifyRequest } from 'fastify'

export interface AuthRequest extends FastifyRequest {
	user: {
		userId?: string
		id?: string
	}
	userId?: string
}

export interface DoctorData {
	id: string
	name: string
	email: string
	phone: string
	crm: string
	specialty: string
	code?: string | null
	password: string
	resetCode?: string | null
	createdAt: string
	updatedAt: string
}
