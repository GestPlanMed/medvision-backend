import type { FastifyInstance } from 'fastify'
import { PatientController } from '../controllers/patient.controller'

const patientController = new PatientController()

export async function patientAdminRoutes(fastify: FastifyInstance) {
	fastify.get('/', { onRequest: [fastify.authenticate] }, patientController.list.bind(patientController))

	fastify.get('/:id', { onRequest: [fastify.authenticate] }, patientController.getById.bind(patientController))

	fastify.delete('/:id', { onRequest: [fastify.authenticate] }, patientController.delete.bind(patientController))
}
