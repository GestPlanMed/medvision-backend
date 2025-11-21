/**
 * @fileoverview
 * Serviço de Email - Envio de notificações por email
 * Responsável por: enviar emails de verificação, 2FA, notificações
 */

interface EmailConfig {
	from: string
	smtpHost?: string
	smtpPort?: number
	smtpUser?: string
	smtpPassword?: string
}

interface EmailPayload {
	to: string
	subject: string
	htmlBody: string
	textBody?: string
}

export function createEmailService(_config: EmailConfig) {
	/**
	 * Enviar email de verificação (sign-up/login)
	 */
	async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
		const subject = 'Código de Verificação MedVision'
		const htmlBody = `
      <h2>Verificação de Conta</h2>
      <p>Seu código de verificação é:</p>
      <h1 style="font-size: 32px; letter-spacing: 10px; color: #007bff;">${code}</h1>
      <p>Este código é válido por 10 minutos.</p>
      <p>Se você não solicitou este código, ignore este email.</p>
    `

		return await sendEmail({
			to: email,
			subject,
			htmlBody,
			textBody: `Seu código de verificação: ${code}`,
		})
	}

	/**
	 * Enviar email de 2FA
	 */
	async function send2FAEmail(email: string, code: string): Promise<boolean> {
		const subject = 'Código de Autenticação de Dois Fatores - MedVision'
		const htmlBody = `
      <h2>Autenticação de Dois Fatores</h2>
      <p>Seu código de autenticação é:</p>
      <h1 style="font-size: 32px; letter-spacing: 10px; color: #28a745;">${code}</h1>
      <p>Este código é válido por 5 minutos.</p>
      <p>Se você não solicitou este código, não compartilhe com ninguém.</p>
    `

		return await sendEmail({
			to: email,
			subject,
			htmlBody,
			textBody: `Seu código 2FA: ${code}`,
		})
	}

	/**
	 * Enviar email de redefinição de senha
	 */
	async function sendPasswordResetEmail(email: string, resetToken: string, resetLink: string): Promise<boolean> {
		const subject = 'Redefinição de Senha - MedVision'
		const htmlBody = `
      <h2>Redefinição de Senha</h2>
      <p>Você solicitou uma redefinição de senha. Clique no link abaixo:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
        Redefinir Senha
      </a>
      <p>Este link é válido por 1 hora.</p>
      <p>Se você não solicitou isto, ignore este email.</p>
      <hr />
      <p style="font-size: 12px; color: #666;">Token: ${resetToken}</p>
    `

		return await sendEmail({
			to: email,
			subject,
			htmlBody,
		})
	}

	/**
	 * Enviar email de notificação geral
	 */
	async function sendNotificationEmail(
		email: string,
		title: string,
		message: string,
		action?: { text: string; url: string },
	): Promise<boolean> {
		let htmlBody = `
      <h2>${title}</h2>
      <p>${message}</p>
    `

		if (action) {
			htmlBody += `
      <a href="${action.url}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
        ${action.text}
      </a>
    `
		}

		return await sendEmail({
			to: email,
			subject: title,
			htmlBody,
		})
	}

	/**
	 * Enviar email de agendamento confirmado (para pacientes)
	 */
	async function sendAppointmentConfirmationEmail(
		email: string,
		appointmentData: {
			doctorName: string
			date: string
			time: string
			specialty: string
		},
	): Promise<boolean> {
		const subject = 'Agendamento Confirmado - MedVision'
		const htmlBody = `
      <h2>Agendamento Confirmado</h2>
      <p>Seu agendamento foi confirmado com sucesso!</p>
      <div style="background-color: #f0f0f0; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <p><strong>Médico:</strong> ${appointmentData.doctorName}</p>
        <p><strong>Especialidade:</strong> ${appointmentData.specialty}</p>
        <p><strong>Data:</strong> ${appointmentData.date}</p>
        <p><strong>Hora:</strong> ${appointmentData.time}</p>
      </div>
      <p>Compareça com 10 minutos de antecedência.</p>
    `

		return await sendEmail({
			to: email,
			subject,
			htmlBody,
		})
	}

	/**
	 * Função interna para enviar email (mockada para dev)
	 */
	async function sendEmail(payload: EmailPayload): Promise<boolean> {
		try {
			// TODO: Implementar integração com serviço de email (SendGrid, Mailgun, etc)
			// Por enquanto, apenas loga o email em desenvolvimento
			console.log(`[EMAIL] Enviando para ${payload.to}`)
			console.log(`[EMAIL] Assunto: ${payload.subject}`)
			console.log(`[EMAIL] Body: ${payload.htmlBody}`)

			// Em produção, descomente e configure com serviço real:
			// const transporter = nodemailer.createTransport({...})
			// await transporter.sendMail({
			//   from,
			//   to: payload.to,
			//   subject: payload.subject,
			//   html: payload.htmlBody,
			//   text: payload.textBody,
			// })

			return true
		} catch (error) {
			console.error('[EMAIL] Erro ao enviar email:', error)
			return false
		}
	}

	return {
		sendVerificationEmail,
		send2FAEmail,
		sendPasswordResetEmail,
		sendNotificationEmail,
		sendAppointmentConfirmationEmail,
	}
}

export type EmailService = ReturnType<typeof createEmailService>
