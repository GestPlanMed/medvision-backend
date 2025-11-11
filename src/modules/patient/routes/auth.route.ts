import type { FastifyInstance } from 'fastify'
import { AuthController } from '../controllers/auth.controller'

const authController = new AuthController()

export async function authPatientRoutes(fastify: FastifyInstance) {
	fastify.post('/signup', authController.createPatient.bind(authController))
	fastify.post('/signin', authController.signInPatient.bind(authController))
	fastify.post('/validate-code', authController.validateCodePatient.bind(authController))
	fastify.post('/resend-code', authController.resendCodePatient.bind(authController))

	fastify.patch('/update', { onRequest: [fastify.authenticate] }, authController.updatePatient.bind(authController))
	fastify.post('/logout', { onRequest: [fastify.authenticate] }, authController.logout.bind(authController))
	fastify.get('/me', { onRequest: [fastify.authenticate] }, authController.me.bind(authController))
}
