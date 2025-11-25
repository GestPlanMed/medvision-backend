import type { FastifyInstance } from 'fastify'
import { authenticate } from '@/plugins/auth.plugin'
import { DoctorController } from '../controllers/doctor.controller'

const controller = new DoctorController()

export function DoctorRoutes(fastify: FastifyInstance) {
	fastify.get('/doctors', { preHandler: [authenticate] }, async (req, res) => controller.getAllDoctors(req, res))
	fastify.get('/:id', { preHandler: [authenticate] }, async (req, res) => controller.getDoctorById(req, res))
	fastify.patch('/update', { preHandler: [authenticate] }, async (req, res) => controller.updateDoctor(req, res))
}
