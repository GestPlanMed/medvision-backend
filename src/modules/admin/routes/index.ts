import type { FastifyInstance } from 'fastify'
import { authAdminRoutes } from './auth.route'
import { appointmentAdminRoutes } from './appointment.route'
import { doctorAdminRoutes } from './doctor.route'
import { patientAdminRoutes } from './patient.route'

export async function adminRoutes(fastify: FastifyInstance) {
	// Rotas de autenticação (públicas e protegidas)
	fastify.register(authAdminRoutes, { prefix: '/auth' })

	// Rotas protegidas de gerenciamento
	fastify.register(appointmentAdminRoutes, { prefix: '/appointments' })
	fastify.register(doctorAdminRoutes, { prefix: '/doctors' })
	fastify.register(patientAdminRoutes, { prefix: '/patients' })
}
