import type { FastifyInstance } from 'fastify'
import { PrescriptionController } from '../controllers/prescription.controller'
import { authenticate } from '@/plugins/auth.plugin'

const controller = new PrescriptionController()

export async function PrescriptionRoutes(fastify: FastifyInstance) {
	// Get all prescriptions (paginated with filters)
	fastify.get('/', { preHandler: [authenticate] }, async (req, res) => controller.getAllPrescriptions(req, res))

	// Get prescription by ID
	fastify.get('/:id', { preHandler: [authenticate] }, async (req, res) => controller.getPrescriptionById(req, res))

	// Get prescriptions by patient ID
	fastify.get('/patient/:patientId', { preHandler: [authenticate] }, async (req, res) =>
		controller.getPrescriptionsByPatient(req, res),
	)

	// Get prescriptions by doctor ID
	fastify.get('/doctor/:doctorId', { preHandler: [authenticate] }, async (req, res) =>
		controller.getPrescriptionsByDoctor(req, res),
	)

	// Create new prescription
	fastify.post('/', { preHandler: [authenticate] }, async (req, res) => controller.createPrescription(req, res))

	// Update prescription
	fastify.put('/', { preHandler: [authenticate] }, async (req, res) => controller.updatePrescription(req, res))

	// Delete prescription
	fastify.delete('/:id', { preHandler: [authenticate] }, async (req, res) => controller.deletePrescription(req, res))
}
