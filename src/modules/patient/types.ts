import { FastifyRequest } from 'fastify'

export interface AuthRequest extends FastifyRequest {
	user: {
		id: string
		email: string
		role: 'admin' | 'doctor' | 'patient'
		name: string
	}
	userId?: string
}

export interface PatientData {
	id: string
	name: string
	age: number
	cpf: string
	phone: string
	address?: string | null
	code?: string | null
	createdAt: string
	updatedAt: string
}
