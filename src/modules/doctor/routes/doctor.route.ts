import type { FastifyInstance } from 'fastify'
import { authenticate } from '@/plugins/auth.plugin'
import { DoctorController } from '../controllers/doctor.controller'

const controller = new DoctorController()

export function DoctorRoutes(fastify: FastifyInstance) {
	fastify.get('/doctors', { preHandler: [authenticate] }, async () => controller.getAllDoctors())
}
