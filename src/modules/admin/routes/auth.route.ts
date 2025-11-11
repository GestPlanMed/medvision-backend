import type { FastifyInstance } from 'fastify'

import { AuthController } from '../controllers/auth.controller'

const authController = new AuthController()

export async function authAdminRoutes(fastify: FastifyInstance) {
	fastify.post('/signin', authController.signInAdmin.bind(authController))
	fastify.post('/forgot-password', authController.forgotPassword.bind(authController))
	fastify.post('/reset-password', authController.resetPassword.bind(authController))
	
	fastify.post('/signup', { onRequest: [fastify.authenticate] },authController.createAdmin.bind(authController))
	fastify.patch('/update', { onRequest: [fastify.authenticate] }, authController.updateAdmin.bind(authController))
	fastify.post('/logout', { onRequest: [fastify.authenticate] }, authController.logout.bind(authController))
	fastify.get('/me', { onRequest: [fastify.authenticate] }, authController.me.bind(authController))
}
