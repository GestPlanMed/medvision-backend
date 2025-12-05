import type { FastifyInstance } from 'fastify'
import { emailService } from '@/services'

/**
 * Rotas de teste para o serviço de email
 * Útil para desenvolvimento e testes
 * 
 * ATENÇÃO: Remover ou proteger estas rotas em produção!
 */
export async function emailTestRoutes(app: FastifyInstance) {
	/**
	 * Teste simples de envio de email
	 * GET /test/email/simple?to=email@example.com
	 */
	app.get('/test/email/simple', async (request, reply) => {
		try {
			const { to } = request.query as { to?: string }

			if (!to) {
				return reply.status(400).send({
					ok: false,
					message: 'Parâmetro "to" é obrigatório. Exemplo: ?to=email@example.com',
				})
			}

			await emailService.sendEmail({
				to,
				subject: 'Teste de Email - MedVision',
				html: '<h1>Email de Teste</h1><p>Este é um email de teste do sistema MedVision.</p>',
			})

			return reply.send({
				ok: true,
				message: `Email de teste enviado para ${to}`,
			})
		} catch (error) {
			console.error('Erro ao enviar email de teste:', error)
			return reply.status(500).send({
				ok: false,
				message: error instanceof Error ? error.message : 'Erro desconhecido',
			})
		}
	})

	/**
	 * Teste de email de boas-vindas para paciente
	 * POST /test/email/welcome-patient
	 */
	app.post('/test/email/welcome-patient', async (request, reply) => {
		try {
			const { email, name } = request.body as { email?: string; name?: string }

			if (!email || !name) {
				return reply.status(400).send({
					ok: false,
					message: 'Campos "email" e "name" são obrigatórios',
				})
			}

			await emailService.sendWelcomePatient(email, {
				name,
				email,
				loginUrl: process.env.FRONTEND_URL
					? `${process.env.FRONTEND_URL}/login`
					: 'http://localhost:5173/login',
			})

			return reply.send({
				ok: true,
				message: `Email de boas-vindas enviado para ${email}`,
			})
		} catch (error) {
			console.error('Erro ao enviar email:', error)
			return reply.status(500).send({
				ok: false,
				message: error instanceof Error ? error.message : 'Erro desconhecido',
			})
		}
	})

	/**
	 * Teste de email de confirmação de agendamento
	 * POST /test/email/appointment-confirmation
	 */
	app.post('/test/email/appointment-confirmation', async (request, reply) => {
		try {
			const body = request.body as {
				email?: string
				patientName?: string
				doctorName?: string
				date?: string
				time?: string
			}

			if (!body.email || !body.patientName || !body.doctorName || !body.date || !body.time) {
				return reply.status(400).send({
					ok: false,
					message: 'Campos obrigatórios: email, patientName, doctorName, date, time',
				})
			}

			await emailService.sendAppointmentConfirmation(body.email, {
				patientName: body.patientName,
				doctorName: body.doctorName,
				appointmentDate: body.date,
				appointmentTime: body.time,
				specialty: 'Cardiologia',
				meetingUrl: 'https://njsolutions.daily.co/consulta-teste',
			})

			return reply.send({
				ok: true,
				message: `Email de confirmação enviado para ${body.email}`,
			})
		} catch (error) {
			console.error('Erro ao enviar email:', error)
			return reply.status(500).send({
				ok: false,
				message: error instanceof Error ? error.message : 'Erro desconhecido',
			})
		}
	})

	/**
	 * Teste de email de prescrição
	 * POST /test/email/prescription
	 */
	app.post('/test/email/prescription', async (request, reply) => {
		try {
			const { email, patientName, doctorName } = request.body as {
				email?: string
				patientName?: string
				doctorName?: string
			}

			if (!email || !patientName || !doctorName) {
				return reply.status(400).send({
					ok: false,
					message: 'Campos obrigatórios: email, patientName, doctorName',
				})
			}

			await emailService.sendPrescriptionReady(email, {
				patientName,
				doctorName,
				prescriptionDate: new Date().toLocaleDateString('pt-BR'),
				medications: ['Aspirina 100mg - 1 comprimido ao dia', 'Losartana 50mg - 1 pela manhã'],
				instructions: 'Tomar os medicamentos após as refeições com água.',
			})

			return reply.send({
				ok: true,
				message: `Email de prescrição enviado para ${email}`,
			})
		} catch (error) {
			console.error('Erro ao enviar email:', error)
			return reply.status(500).send({
				ok: false,
				message: error instanceof Error ? error.message : 'Erro desconhecido',
			})
		}
	})

	/**
	 * Listar todos os templates disponíveis
	 * GET /test/email/templates
	 */
	app.get('/test/email/templates', async (request, reply) => {
		return reply.send({
			ok: true,
			templates: [
				{
					name: 'Confirmação de Agendamento',
					endpoint: 'POST /test/email/appointment-confirmation',
					fields: ['email', 'patientName', 'doctorName', 'date', 'time'],
				},
				{
					name: 'Lembrete de Consulta',
					description: 'Enviado 24h antes da consulta',
				},
				{
					name: 'Consulta Cancelada',
					description: 'Enviado quando consulta é cancelada',
				},
				{
					name: 'Consulta Reagendada',
					description: 'Enviado quando consulta é reagendada',
				},
				{
					name: 'Prescrição Pronta',
					endpoint: 'POST /test/email/prescription',
					fields: ['email', 'patientName', 'doctorName'],
				},
				{
					name: 'Boas-vindas Paciente',
					endpoint: 'POST /test/email/welcome-patient',
					fields: ['email', 'name'],
				},
				{
					name: 'Boas-vindas Médico',
					description: 'Enviado ao cadastrar médico',
				},
				{
					name: 'Recuperação de Senha',
					description: 'Enviado ao solicitar reset de senha',
				},
				{
					name: 'Verificação de Conta',
					description: 'Enviado para verificar email',
				},
			],
		})
	})

	console.log('✅ Rotas de teste de email registradas:')
	console.log('   GET  /test/email/simple')
	console.log('   POST /test/email/welcome-patient')
	console.log('   POST /test/email/appointment-confirmation')
	console.log('   POST /test/email/prescription')
	console.log('   GET  /test/email/templates')
}
