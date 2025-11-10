import type { FastifyInstance } from 'fastify'
import { AuthController } from '../controllers/auth.controller'

const authController = new AuthController()

export function authDoctorRoutes(fastify: FastifyInstance) {
	fastify.post('/signup', authController.createDoctor.bind(authController))
	fastify.post('/signin', authController.signInDoctor.bind(authController))
	fastify.patch('/update', authController.updateDoctor.bind(authController))
	fastify.post('/forgot-password', authController.forgotPassword.bind(authController))
	fastify.post('/reset-password', authController.resetPassword.bind(authController))
}
