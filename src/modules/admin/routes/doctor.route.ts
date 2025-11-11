import type { FastifyInstance } from 'fastify'
import { DoctorController } from '../controllers/doctor.controller'

const doctorController = new DoctorController()

export async function doctorAdminRoutes(fastify: FastifyInstance) {
	fastify.get('/', { onRequest: [fastify.authenticate] }, doctorController.list.bind(doctorController))

	fastify.get('/:id', { onRequest: [fastify.authenticate] }, doctorController.getById.bind(doctorController))

	fastify.post('/', { onRequest: [fastify.authenticate] }, doctorController.create.bind(doctorController))

	fastify.put('/:id', { onRequest: [fastify.authenticate] }, doctorController.update.bind(doctorController))

	fastify.delete('/:id', { onRequest: [fastify.authenticate] }, doctorController.delete.bind(doctorController))
}
