import type {
	EmailTemplate,
	AppointmentEmailData,
	PrescriptionEmailData,
	WelcomeEmailData,
	PasswordResetEmailData,
	VerificationEmailData,
	SecurityCodeEmailData,
	PasswordRecoveryCodeEmailData,
} from '../../types/email.types'

/**
 * Layout base para todos os emails
 */
const baseLayout = (content: string): string => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>MedVision</title>
	<style>
		body {
			margin: 0;
			padding: 0;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
			background-color: #f5f5f5;
		}
		.container {
			max-width: 600px;
			margin: 0 auto;
			background-color: #ffffff;
		}
		.header {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			padding: 40px 20px;
			text-align: center;
		}
		.header h1 {
			color: #ffffff;
			margin: 0;
			font-size: 28px;
			font-weight: 600;
		}
		.content {
			padding: 40px 30px;
			color: #333333;
			line-height: 1.6;
		}
		.content h2 {
			color: #667eea;
			font-size: 24px;
			margin-top: 0;
		}
		.button {
			display: inline-block;
			padding: 14px 32px;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: #ffffff !important;
			text-decoration: none;
			border-radius: 6px;
			font-weight: 600;
			margin: 20px 0;
		}
		.info-box {
			background-color: #f8f9fa;
			border-left: 4px solid #667eea;
			padding: 20px;
			margin: 20px 0;
			border-radius: 4px;
		}
		.info-box strong {
			color: #667eea;
		}
		.footer {
			background-color: #f8f9fa;
			padding: 30px;
			text-align: center;
			color: #6c757d;
			font-size: 14px;
		}
		.divider {
			border: 0;
			border-top: 1px solid #e9ecef;
			margin: 30px 0;
		}
		@media only screen and (max-width: 600px) {
			.content {
				padding: 20px 15px;
			}
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>🏥 MedVision</h1>
		</div>
		<div class="content">
			${content}
		</div>
		<div class="footer">
			<p>© ${new Date().getFullYear()} MedVision. Todos os direitos reservados.</p>
			<p>Este é um email automático, por favor não responda.</p>
		</div>
	</div>
</body>
</html>
`

export class EmailTemplates {
	/**
	 * Template: Confirmação de Agendamento
	 */
	static appointmentConfirmation(data: AppointmentEmailData): EmailTemplate {
		const content = `
			<h2>✅ Consulta Confirmada!</h2>
			<p>Olá <strong>${data.patientName}</strong>,</p>
			<p>Sua consulta foi confirmada com sucesso! Veja os detalhes abaixo:</p>
			
			<div class="info-box">
				<p><strong>Médico:</strong> Dr(a). ${data.doctorName}</p>
				${data.specialty ? `<p><strong>Especialidade:</strong> ${data.specialty}</p>` : ''}
				<p><strong>Data:</strong> ${data.appointmentDate}</p>
				<p><strong>Horário:</strong> ${data.appointmentTime}</p>
				${data.location ? `<p><strong>Local:</strong> ${data.location}</p>` : ''}
			</div>
			
			${data.meetingUrl ? `
				<p>Esta é uma consulta <strong>online</strong>. Acesse o link abaixo no horário marcado:</p>
				<a href="${data.meetingUrl}" class="button">Entrar na Consulta</a>
			` : ''}
			
			${data.notes ? `
				<hr class="divider">
				<p><strong>Observações:</strong></p>
				<p>${data.notes}</p>
			` : ''}
			
			<hr class="divider">
			<p style="color: #6c757d; font-size: 14px;">
				💡 Você receberá um lembrete 24 horas antes da sua consulta.
			</p>
		`

		return {
			subject: `Consulta Confirmada - ${data.appointmentDate} às ${data.appointmentTime}`,
			html: baseLayout(content),
		}
	}

	/**
	 * Template: Lembrete de Consulta
	 */
	static appointmentReminder(data: AppointmentEmailData): EmailTemplate {
		const content = `
			<h2>⏰ Lembrete de Consulta</h2>
			<p>Olá <strong>${data.patientName}</strong>,</p>
			<p>Este é um lembrete da sua consulta marcada para <strong>amanhã</strong>:</p>
			
			<div class="info-box">
				<p><strong>Médico:</strong> Dr(a). ${data.doctorName}</p>
				${data.specialty ? `<p><strong>Especialidade:</strong> ${data.specialty}</p>` : ''}
				<p><strong>Data:</strong> ${data.appointmentDate}</p>
				<p><strong>Horário:</strong> ${data.appointmentTime}</p>
				${data.location ? `<p><strong>Local:</strong> ${data.location}</p>` : ''}
			</div>
			
			${data.meetingUrl ? `
				<p>Consulta <strong>online</strong>. Acesse o link abaixo no horário marcado:</p>
				<a href="${data.meetingUrl}" class="button">Entrar na Consulta</a>
			` : `
				<p>Por favor, chegue com <strong>10 minutos de antecedência</strong>.</p>
			`}
			
			<hr class="divider">
			<p style="color: #6c757d; font-size: 14px;">
				📋 Lembre-se de trazer seus exames e documentos necessários.
			</p>
		`

		return {
			subject: `🔔 Lembrete: Consulta Amanhã - ${data.appointmentTime}`,
			html: baseLayout(content),
		}
	}

	/**
	 * Template: Consulta Cancelada
	 */
	static appointmentCancelled(data: AppointmentEmailData): EmailTemplate {
		const content = `
			<h2>❌ Consulta Cancelada</h2>
			<p>Olá <strong>${data.patientName}</strong>,</p>
			<p>Informamos que sua consulta foi cancelada:</p>
			
			<div class="info-box">
				<p><strong>Médico:</strong> Dr(a). ${data.doctorName}</p>
				<p><strong>Data:</strong> ${data.appointmentDate}</p>
				<p><strong>Horário:</strong> ${data.appointmentTime}</p>
			</div>
			
			${data.notes ? `
				<p><strong>Motivo:</strong> ${data.notes}</p>
			` : ''}
			
			<p>Se desejar, você pode agendar uma nova consulta através da nossa plataforma.</p>
			
			<hr class="divider">
			<p style="color: #6c757d; font-size: 14px;">
				Se você não solicitou este cancelamento, entre em contato conosco imediatamente.
			</p>
		`

		return {
			subject: `Consulta Cancelada - ${data.appointmentDate}`,
			html: baseLayout(content),
		}
	}

	/**
	 * Template: Consulta Reagendada
	 */
	static appointmentRescheduled(data: AppointmentEmailData): EmailTemplate {
		const content = `
			<h2>📅 Consulta Reagendada</h2>
			<p>Olá <strong>${data.patientName}</strong>,</p>
			<p>Sua consulta foi reagendada com sucesso! Confira os novos detalhes:</p>
			
			<div class="info-box">
				<p><strong>Médico:</strong> Dr(a). ${data.doctorName}</p>
				${data.specialty ? `<p><strong>Especialidade:</strong> ${data.specialty}</p>` : ''}
				<p><strong>Nova Data:</strong> ${data.appointmentDate}</p>
				<p><strong>Novo Horário:</strong> ${data.appointmentTime}</p>
				${data.location ? `<p><strong>Local:</strong> ${data.location}</p>` : ''}
			</div>
			
			${data.meetingUrl ? `
				<a href="${data.meetingUrl}" class="button">Acessar Consulta Online</a>
			` : ''}
			
			<p>Você receberá um lembrete 24 horas antes da nova data.</p>
		`

		return {
			subject: `Consulta Reagendada - Nova Data: ${data.appointmentDate}`,
			html: baseLayout(content),
		}
	}

	/**
	 * Template: Prescrição Pronta
	 */
	static prescriptionReady(data: PrescriptionEmailData): EmailTemplate {
		const medicationsList = data.medications.map((med) => `<li>${med}</li>`).join('')

		const content = `
			<h2>💊 Prescrição Médica Disponível</h2>
			<p>Olá <strong>${data.patientName}</strong>,</p>
			<p>Sua prescrição médica foi emitida por <strong>Dr(a). ${data.doctorName}</strong> em ${data.prescriptionDate}.</p>
			
			<div class="info-box">
				<p><strong>Medicamentos Prescritos:</strong></p>
				<ul style="margin: 10px 0; padding-left: 20px;">
					${medicationsList}
				</ul>
			</div>
			
			${data.instructions ? `
				<p><strong>Instruções:</strong></p>
				<p>${data.instructions}</p>
			` : ''}
			
			<p>Acesse sua área do paciente para visualizar e baixar a prescrição completa.</p>
			
			<hr class="divider">
			<p style="color: #dc3545; font-size: 14px;">
				⚠️ <strong>Atenção:</strong> Siga rigorosamente as orientações médicas. Em caso de dúvidas, consulte seu médico.
			</p>
		`

		return {
			subject: `Prescrição Médica Disponível - Dr(a). ${data.doctorName}`,
			html: baseLayout(content),
		}
	}

	/**
	 * Template: Boas-vindas Paciente
	 */
	static welcomePatient(data: WelcomeEmailData): EmailTemplate {
		const content = `
			<h2>Bem-vindo(a) ao MedVision! 🎉</h2>
			<p>Olá <strong>${data.name}</strong>,</p>
			<p>É um prazer tê-lo(a) conosco! Sua conta foi criada com sucesso.</p>
			
			<div class="info-box">
				<p><strong>Email cadastrado:</strong> ${data.email}</p>
			</div>
			
			<p>Com o MedVision, você pode:</p>
			<ul style="line-height: 2;">
				<li>✅ Agendar consultas online</li>
				<li>✅ Consultar seu histórico médico</li>
				<li>✅ Acessar prescrições e exames</li>
				<li>✅ Realizar teleconsultas</li>
			</ul>
			
			${data.loginUrl ? `
				<a href="${data.loginUrl}" class="button">Acessar Minha Conta</a>
			` : ''}
			
			<hr class="divider">
			<p>Qualquer dúvida, estamos à disposição! 💙</p>
		`

		return {
			subject: 'Bem-vindo(a) ao MedVision! 🏥',
			html: baseLayout(content),
		}
	}

	/**
	 * Template: Boas-vindas Médico
	 */
	static welcomeDoctor(data: WelcomeEmailData): EmailTemplate {
		const content = `
			<h2>Bem-vindo(a) à Equipe MedVision! 👨‍⚕️</h2>
			<p>Olá <strong>Dr(a). ${data.name}</strong>,</p>
			<p>É uma honra tê-lo(a) em nossa plataforma! Sua conta médica foi ativada com sucesso.</p>
			
			<div class="info-box">
				<p><strong>Email profissional:</strong> ${data.email}</p>
				${data.temporaryPassword ? `
					<p><strong>Senha temporária:</strong> <code style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${data.temporaryPassword}</code></p>
					<p style="color: #dc3545; margin-top: 10px;">⚠️ <strong>Importante:</strong> Altere sua senha no primeiro acesso!</p>
				` : ''}
			</div>
			
			<p>Como médico(a) no MedVision, você tem acesso a:</p>
			<ul style="line-height: 2;">
				<li>✅ Agenda de consultas integrada</li>
				<li>✅ Sistema de teleconsulta</li>
				<li>✅ Prescrição eletrônica</li>
				<li>✅ Histórico completo dos pacientes</li>
				<li>✅ Dashboard de estatísticas</li>
			</ul>
			
			${data.loginUrl ? `
				<a href="${data.loginUrl}" class="button">Acessar Painel Médico</a>
			` : ''}
			
			<hr class="divider">
			<p>Conte conosco para qualquer suporte! 💙</p>
		`

		return {
			subject: 'Bem-vindo(a) à Equipe MedVision! 👨‍⚕️',
			html: baseLayout(content),
		}
	}

	/**
	 * Template: Boas-vindas Admin
	 */
	static welcomeAdmin(data: WelcomeEmailData): EmailTemplate {
		const content = `
			<h2>Bem-vindo(a) ao MedVision Admin! 🔐</h2>
			<p>Olá <strong>${data.name}</strong>,</p>
			<p>Sua conta de administrador foi criada com sucesso no sistema MedVision.</p>
			
			<div class="info-box">
				<p><strong>Email:</strong> ${data.email}</p>
				${data.temporaryPassword ? `
					<p><strong>Senha temporária:</strong> <code style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${data.temporaryPassword}</code></p>
					<p style="color: #dc3545; margin-top: 10px;">⚠️ <strong>Importante:</strong> Altere sua senha no primeiro acesso!</p>
				` : ''}
			</div>
			
			<p>Como administrador, você tem acesso total ao sistema:</p>
			<ul style="line-height: 2;">
				<li>✅ Gerenciamento de médicos e pacientes</li>
				<li>✅ Controle de agendamentos</li>
				<li>✅ Relatórios e estatísticas</li>
				<li>✅ Configurações do sistema</li>
				<li>✅ Acesso completo a todas as funcionalidades</li>
			</ul>
			
			${data.loginUrl ? `
				<a href="${data.loginUrl}" class="button">Acessar Painel Admin</a>
			` : ''}
			
			<hr class="divider">
			<p style="color: #dc3545; font-size: 14px;">
				🔒 <strong>Segurança:</strong> Nunca compartilhe suas credenciais de administrador.
			</p>
		`

		return {
			subject: '🔐 Bem-vindo(a) ao MedVision Admin',
			html: baseLayout(content),
		}
	}

	/**
	 * Template: Recuperação de Senha
	 */
	static passwordReset(data: PasswordResetEmailData): EmailTemplate {
		const content = `
			<h2>🔐 Recuperação de Senha</h2>
			<p>Olá <strong>${data.name}</strong>,</p>
			<p>Recebemos uma solicitação para redefinir a senha da sua conta MedVision.</p>
			
			<p>Clique no botão abaixo para criar uma nova senha:</p>
			
			<a href="${data.resetUrl}" class="button">Redefinir Senha</a>
			
			<div class="info-box">
				<p>⏱️ Este link é válido por <strong>${data.expiresIn}</strong>.</p>
			</div>
			
			<hr class="divider">
			<p style="color: #dc3545;">
				<strong>⚠️ Importante:</strong> Se você não solicitou esta alteração, ignore este email e sua senha permanecerá inalterada.
			</p>
			
			<p style="color: #6c757d; font-size: 14px;">
				Por segurança, nunca compartilhe este link com ninguém.
			</p>
		`

		return {
			subject: '🔐 Recuperação de Senha - MedVision',
			html: baseLayout(content),
		}
	}

	/**
	 * Template: Verificação de Conta
	 */
	static accountVerification(data: VerificationEmailData): EmailTemplate {
		const content = `
			<h2>✉️ Verifique seu Email</h2>
			<p>Olá <strong>${data.name}</strong>,</p>
			<p>Obrigado por se cadastrar no MedVision! Para ativar sua conta, precisamos verificar seu endereço de email.</p>
			
			<p>Clique no botão abaixo para confirmar seu email:</p>
			
			<a href="${data.verificationUrl}" class="button">Verificar Email</a>
			
			<div class="info-box">
				<p>⏱️ Este link de verificação expira em <strong>${data.expiresIn}</strong>.</p>
			</div>
			
			<hr class="divider">
			<p style="color: #6c757d; font-size: 14px;">
				Se você não criou uma conta no MedVision, pode ignorar este email com segurança.
			</p>
		`

		return {
			subject: '✉️ Verifique seu Email - MedVision',
			html: baseLayout(content),
		}
	}

	/**
	 * Template: Código de Segurança para Login
	 */
	static securityCode(data: SecurityCodeEmailData): EmailTemplate {
		const content = `
			<h2>🔐 Seu Código de Acesso</h2>
			<p>Olá <strong>${data.name}</strong>,</p>
			<p>Use o código abaixo para acessar sua conta no MedVision:</p>
			
			<div class="info-box" style="text-align: center; padding: 30px;">
				<p style="margin: 0 0 10px 0; color: #667eea; font-size: 14px; font-weight: 600;">SEU CÓDIGO DE ACESSO</p>
				<p style="margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: monospace;">${data.securityCode}</p>
			</div>
			
			${data.expiresIn ? `
				<p style="text-align: center; color: #6c757d;">
					⏱️ Este código expira em <strong>${data.expiresIn}</strong>.
				</p>
			` : ''}
			
			<hr class="divider">
			<p style="color: #dc3545; font-size: 14px;">
				<strong>⚠️ Segurança:</strong> Se você não solicitou este código, ignore este email. Nunca compartilhe este código com ninguém.
			</p>
		`

		return {
			subject: '🔐 Seu Código de Acesso - MedVision',
			html: baseLayout(content),
		}
	}

	/**
	 * Template: Código de Recuperação de Senha
	 */
	static passwordRecoveryCode(data: PasswordRecoveryCodeEmailData): EmailTemplate {
		const content = `
			<h2>🔑 Recuperação de Senha</h2>
			<p>Olá <strong>${data.name}</strong>,</p>
			<p>Recebemos uma solicitação para redefinir a senha da sua conta MedVision.</p>
			<p>Use o código abaixo para criar uma nova senha:</p>
			
			<div class="info-box" style="text-align: center; padding: 30px;">
				<p style="margin: 0 0 10px 0; color: #667eea; font-size: 14px; font-weight: 600;">CÓDIGO DE RECUPERAÇÃO</p>
				<p style="margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: monospace;">${data.recoveryCode}</p>
			</div>
			
			${data.expiresIn ? `
				<p style="text-align: center; color: #6c757d;">
					⏱️ Este código expira em <strong>${data.expiresIn}</strong>.
				</p>
			` : ''}
			
			<hr class="divider">
			<p style="color: #dc3545;">
				<strong>⚠️ Importante:</strong> Se você não solicitou esta alteração, ignore este email e sua senha permanecerá inalterada.
			</p>
			<p style="color: #6c757d; font-size: 14px;">
				Por segurança, nunca compartilhe este código com ninguém.
			</p>
		`

		return {
			subject: '🔑 Código de Recuperação de Senha - MedVision',
			html: baseLayout(content),
		}
	}
}
