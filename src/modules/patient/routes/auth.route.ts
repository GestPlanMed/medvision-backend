import type { FastifyInstance } from 'fastify'
import { PatientAuthController } from '../controllers/auth.controller'
import { authenticate } from '@/plugins/auth.plugin'

export async function PatientAuthRoutes(fastify: FastifyInstance) {
	const controller = new PatientAuthController({ fastify })

	fastify.post('/signup', { preHandler: [authenticate] }, async (req, res) => controller.signup(req, res))
	fastify.post('/signin', async (req, res) => controller.signin(req, res))
	fastify.post('/validate-code', async (req, res) => controller.validateCode(req, res))
	fastify.post('/resend-code', async (req, res) => controller.resendCode(req, res))
}
