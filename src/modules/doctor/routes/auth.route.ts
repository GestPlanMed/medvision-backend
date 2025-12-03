import type { FastifyInstance } from 'fastify'
import { authenticate } from '@/plugins/auth.plugin'
import { DoctorAuthController } from '../controllers/auth.controller'

export async function DoctorAuthRoutes(fastify: FastifyInstance) {
	const controller = new DoctorAuthController({ fastify })

	fastify.post('/signup', { preHandler: [authenticate] }, async (req, res) => controller.signup(req, res))
	fastify.post('/signin', async (req, res) => controller.signin(req, res))
	fastify.post('/recovery-password', async (req, res) => controller.recoveryPassword(req, res))
	fastify.post('/validate-code', async (req, res) => controller.validateCode(req, res))
	fastify.post('/reset-password', async (req, res) => controller.resetPassword(req, res))
	fastify.get('/me', { preHandler: [authenticate] }, async (req, res) => controller.getProfile(req, res))
}
