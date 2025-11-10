import type { FastifyInstance } from 'fastify'
import { AuthController } from '../controllers/auth.controller'
import { authDoctor } from '../plugins/auth.plugin'

const authController = new AuthController()

export async function authDoctorRoutes(fastify: FastifyInstance) {
	await fastify.register(authDoctor)

	fastify.post('/signup', authController.createDoctor.bind(authController))
	fastify.post('/signin', authController.signInDoctor.bind(authController))
	fastify.post('/forgot-password', authController.forgotPassword.bind(authController))
	fastify.post('/reset-password', authController.resetPassword.bind(authController))

	fastify.patch('/update', { onRequest: [fastify.authenticate] }, authController.updateDoctor.bind(authController))
	fastify.post('/logout', { onRequest: [fastify.authenticate] }, authController.logout.bind(authController))
	fastify.get('/me', { onRequest: [fastify.authenticate] }, authController.me.bind(authController))
}
