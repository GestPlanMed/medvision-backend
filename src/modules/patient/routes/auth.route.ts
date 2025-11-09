import { FastifyInstance } from 'fastify'
import { AuthController } from '../controllers/auth.controller'

const authController = new AuthController()

export function authPatientRoutes(fastify: FastifyInstance) {
	fastify.post('/signup', authController.createPatient.bind(authController))
	fastify.patch('/update', authController.updatePatient.bind(authController))
	fastify.post('/signin', authController.signInPatient.bind(authController))
	fastify.post('/validate-code', authController.validateCodePatient.bind(authController))
	fastify.post('/resend-code', authController.resendCodePatient.bind(authController))
}
