import { FastifyInstance } from 'fastify'
import { AuthController } from '../controllers/auth.controller'

const authController = new AuthController()

export function authAdminRoutes(fastify: FastifyInstance) {
	fastify.post('/signup', authController.createAdmin.bind(authController))
	fastify.post('/signin', authController.signInAdmin.bind(authController))
	fastify.patch('/update', authController.updateAdmin.bind(authController))
	fastify.post('/forgot-password', authController.forgotPassword.bind(authController))
	fastify.post('/reset-password', authController.resetPassword.bind(authController))
}
