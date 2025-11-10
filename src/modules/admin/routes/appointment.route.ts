import type { FastifyInstance } from 'fastify'
import { AppointmentController } from '../controllers/appointment.controller'
import { authAdmin } from '../plugins/auth.plugin'

const appointmentController = new AppointmentController()

export async function appointmentAdminRoutes(fastify: FastifyInstance) {
	await fastify.register(authAdmin)

	fastify.post('/', { onRequest: [fastify.authenticate] }, appointmentController.createAppointment.bind(appointmentController))
	fastify.get('/', { onRequest: [fastify.authenticate] }, appointmentController.listAppointments.bind(appointmentController))
	fastify.get('/:id', { onRequest: [fastify.authenticate] }, appointmentController.getAppointmentById.bind(appointmentController))
	fastify.patch('/:id', { onRequest: [fastify.authenticate] }, appointmentController.updateAppointment.bind(appointmentController))
	fastify.delete('/:id', { onRequest: [fastify.authenticate] }, appointmentController.deleteAppointment.bind(appointmentController))
}
