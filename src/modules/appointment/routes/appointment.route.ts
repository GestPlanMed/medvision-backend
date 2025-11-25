import type { FastifyInstance } from 'fastify'
import { authenticate } from '@/plugins/auth.plugin'
import { AppointmentController } from '../controllers/appointment.controller'

const appointmentController = new AppointmentController()

export function AppointmentRoutes(fastify: FastifyInstance) {
	fastify.post('/create', { preHandler: [authenticate] }, appointmentController.createAppointment.bind(appointmentController))
	fastify.patch('/update', { preHandler: [authenticate] }, appointmentController.updateAppointment.bind(appointmentController))
	fastify.get('/', { preHandler: [authenticate] }, appointmentController.getAppointments.bind(appointmentController))
}
