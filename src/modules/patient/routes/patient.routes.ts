import type { FastifyInstance } from 'fastify'
import { PatientController } from '../controllers/patient.controller'
import { authenticate } from '@/plugins/auth.plugin'

const controller = new PatientController()

export async function PatientRoutes(fastify: FastifyInstance) {
	fastify.get('/profile', { preHandler: [authenticate] }, async (req, res) => controller.getPatientProfile(req, res))
}
