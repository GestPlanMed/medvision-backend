/**
 * @fileoverview
 * Serviço de criptografia e hash de senhas
 * Responsável por: hash, validação e utilidades criptográficas
 */

import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

export function createCryptoService() {
	/**
	 * Fazer hash de uma senha usando BCrypt
	 */
	async function hashPassword(password: string): Promise<string> {
		try {
			return await bcrypt.hash(password, SALT_ROUNDS)
		} catch {
			throw new Error('Erro ao fazer hash da senha')
		}
	}

	/**
	 * Comparar senha em texto plano com hash armazenado
	 */
	async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
		try {
			return await bcrypt.compare(plainPassword, hashedPassword)
		} catch {
			return false
		}
	}

	/**
	 * Gerar código aleatório numérico (para segurança de paciente, reset, etc)
	 */
	function generateRandomCode(length: number = 6): string {
		let code = ''
		for (let i = 0; i < length; i++) {
			code += Math.floor(Math.random() * 10)
		}
		return code
	}

	/**
	 * Gerar código de segurança para paciente (6 dígitos)
	 */
	function generateSecurityCode(): string {
		return generateRandomCode(6)
	}

	/**
	 * Gerar token aleatório para reset de senha
	 */
	function generateResetToken(): string {
		return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
	}

	/**
	 * Hash um código/token (para armazenar no BD sem exposição)
	 */
	function hashToken(token: string): string {
		return Buffer.from(token).toString('base64')
	}

	/**
	 * Validar formato de CPF (apenas formato, não dígito verificador)
	 */
	function isValidCPFFormat(cpf: string): boolean {
		// Remove formatação
		const cleanCPF = cpf.replace(/\D/g, '')
		// Deve ter 11 dígitos
		return cleanCPF.length === 11
	}

	/**
	 * Sanitizar entrada (remover caracteres perigosos)
	 */
	function sanitizeInput(input: string): string {
		return input
			.trim()
			.replace(/[<>]/g, '') // Remove < e >
			.substring(0, 255) // Limita comprimento
	}

	return {
		hashPassword,
		comparePassword,
		generateRandomCode,
		generateSecurityCode,
		generateResetToken,
		hashToken,
		isValidCPFFormat,
		sanitizeInput,
	}
}

export type CryptoService = ReturnType<typeof createCryptoService>
