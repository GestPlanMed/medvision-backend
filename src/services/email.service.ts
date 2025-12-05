import { Resend } from 'resend'
import type {
	EmailOptions,
	SendEmailResponse,
	AppointmentEmailData,
	PrescriptionEmailData,
	WelcomeEmailData,
	PasswordResetEmailData,
	VerificationEmailData,
	SecurityCodeEmailData,
	PasswordRecoveryCodeEmailData,
} from '../types/email.types'
import { EmailTemplates } from './templates/email.templates'

export class EmailService {
	private resend: Resend | null = null
	private defaultFrom: string
	private isEnabled: boolean

	constructor() {
		const apiKey = process.env.RESEND_API_KEY
		
		if (!apiKey) {
			console.warn('⚠️  RESEND_API_KEY não configurada. Serviço de email desabilitado.')
			this.isEnabled = false
		} else {
			this.resend = new Resend(apiKey)
			this.isEnabled = true
		}

		this.defaultFrom = process.env.EMAIL_FROM || 'MedVision <noreply@medvision.com>'
	}

	/**
	 * Verifica se o serviço de email está habilitado
	 */
	private checkEnabled(): void {
		if (!this.isEnabled || !this.resend) {
			throw new Error('Serviço de email não está configurado. Configure RESEND_API_KEY nas variáveis de ambiente.')
		}
	}

	/**
	 * Envia um email genérico
	 */
	async sendEmail(options: EmailOptions): Promise<SendEmailResponse> {
		this.checkEnabled()
		
		try {
			const { data, error } = await this.resend!.emails.send({
				from: options.from || this.defaultFrom,
				to: options.to,
				subject: options.subject,
				html: options.html,
				cc: options.cc,
				bcc: options.bcc,
				replyTo: options.replyTo,
				attachments: options.attachments,
				tags: options.tags,
			})

			if (error) {
				throw new Error(`Erro ao enviar email: ${error.message}`)
			}

			return data as SendEmailResponse
		} catch (error) {
			console.error('Erro ao enviar email:', error)
			throw error
		}
	}

	/**
	 * Envia email de confirmação de agendamento
	 */
	async sendAppointmentConfirmation(
		to: string,
		data: AppointmentEmailData,
	): Promise<SendEmailResponse> {
		const template = EmailTemplates.appointmentConfirmation(data)
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
			tags: [
				{ name: 'category', value: 'appointment' },
				{ name: 'type', value: 'confirmation' },
			],
		})
	}

	/**
	 * Envia email de lembrete de consulta
	 */
	async sendAppointmentReminder(
		to: string,
		data: AppointmentEmailData,
	): Promise<SendEmailResponse> {
		const template = EmailTemplates.appointmentReminder(data)
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
			tags: [
				{ name: 'category', value: 'appointment' },
				{ name: 'type', value: 'reminder' },
			],
		})
	}

	/**
	 * Envia email de cancelamento de consulta
	 */
	async sendAppointmentCancelled(
		to: string,
		data: AppointmentEmailData,
	): Promise<SendEmailResponse> {
		const template = EmailTemplates.appointmentCancelled(data)
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
			tags: [
				{ name: 'category', value: 'appointment' },
				{ name: 'type', value: 'cancelled' },
			],
		})
	}

	/**
	 * Envia email de reagendamento de consulta
	 */
	async sendAppointmentRescheduled(
		to: string,
		data: AppointmentEmailData,
	): Promise<SendEmailResponse> {
		const template = EmailTemplates.appointmentRescheduled(data)
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
			tags: [
				{ name: 'category', value: 'appointment' },
				{ name: 'type', value: 'rescheduled' },
			],
		})
	}

	/**
	 * Envia email de prescrição médica pronta
	 */
	async sendPrescriptionReady(
		to: string,
		data: PrescriptionEmailData,
	): Promise<SendEmailResponse> {
		const template = EmailTemplates.prescriptionReady(data)
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
			tags: [
				{ name: 'category', value: 'prescription' },
				{ name: 'type', value: 'ready' },
			],
		})
	}

	/**
	 * Envia email de boas-vindas para paciente
	 */
	async sendWelcomePatient(to: string, data: WelcomeEmailData): Promise<SendEmailResponse> {
		const template = EmailTemplates.welcomePatient(data)
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
			tags: [
				{ name: 'category', value: 'welcome' },
				{ name: 'type', value: 'patient' },
			],
		})
	}

	/**
	 * Envia email de boas-vindas para médico
	 */
	async sendWelcomeDoctor(to: string, data: WelcomeEmailData): Promise<SendEmailResponse> {
		const template = EmailTemplates.welcomeDoctor(data)
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
			tags: [
				{ name: 'category', value: 'welcome' },
				{ name: 'type', value: 'doctor' },
			],
		})
	}

	/**
	 * Envia email de boas-vindas para admin
	 */
	async sendWelcomeAdmin(to: string, data: WelcomeEmailData): Promise<SendEmailResponse> {
		const template = EmailTemplates.welcomeAdmin(data)
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
			tags: [
				{ name: 'category', value: 'welcome' },
				{ name: 'type', value: 'admin' },
			],
		})
	}

	/**
	 * Envia email de recuperação de senha
	 */
	async sendPasswordReset(to: string, data: PasswordResetEmailData): Promise<SendEmailResponse> {
		const template = EmailTemplates.passwordReset(data)
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
			tags: [
				{ name: 'category', value: 'security' },
				{ name: 'type', value: 'password_reset' },
			],
		})
	}

	/**
	 * Envia email de verificação de conta
	 */
	async sendAccountVerification(
		to: string,
		data: VerificationEmailData,
	): Promise<SendEmailResponse> {
		const template = EmailTemplates.accountVerification(data)
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
			tags: [
				{ name: 'category', value: 'security' },
				{ name: 'type', value: 'verification' },
			],
		})
	}

	/**
	 * Envia código de segurança para login do paciente
	 */
	async sendSecurityCode(to: string, data: SecurityCodeEmailData): Promise<SendEmailResponse> {
		const template = EmailTemplates.securityCode(data)
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
			tags: [
				{ name: 'category', value: 'security' },
				{ name: 'type', value: 'access_code' },
			],
		})
	}

	/**
	 * Envia código de recuperação de senha
	 */
	async sendPasswordRecoveryCode(
		to: string,
		data: PasswordRecoveryCodeEmailData,
	): Promise<SendEmailResponse> {
		const template = EmailTemplates.passwordRecoveryCode(data)
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
			tags: [
				{ name: 'category', value: 'security' },
				{ name: 'type', value: 'password_recovery' },
			],
		})
	}

	/**
	 * Envia múltiplos emails em lote
	 */
	async sendBatch(emails: EmailOptions[]): Promise<SendEmailResponse[]> {
		const promises = emails.map((email) => this.sendEmail(email))
		return Promise.all(promises)
	}
}

// Singleton instance
export const emailService = new EmailService()
