import type { FastifyInstance } from 'fastify'
import { AdminAuthController } from '../controllers/auth.controller'
import { authenticate } from '@/plugins/auth.plugin'

export async function adminRoutes(fastify: FastifyInstance) {
	const controller = new AdminAuthController({ fastify })

	fastify.post('/signup', { preHandler: [authenticate] }, async (req, res) => controller.signup(req, res))
	fastify.post('/signin', async (req, res) => controller.signin(req, res))
	fastify.post('/recovery-password', async (req, res) => controller.recoveryPassword(req, res))
	fastify.post('/validate-code', async (req, res) => controller.validateCode(req, res))
}
