/**
 * @fileoverview
 * Serviço de 2FA - Autenticação em duas etapas
 * Responsável por: gerar secrets TOTP, validar códigos, backup codes
 * Usa algoritmo HMAC-SHA1 para TOTP (RFC 6238)
 */

import { randomBytes, createHmac } from 'node:crypto'

interface TwoFactorSetup {
	secret: string
	backupCodes: string[]
}

interface BackupCodesData {
	codes: string[]
	generatedAt: number
}

/**
 * Converter base32 para buffer
 * RFC 4648 - Base32 Encoding
 */
function base32ToBuffer(input: string): Buffer {
	const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
	const bits: number[] = []

	for (const char of input) {
		const val = base32Alphabet.indexOf(char)
		if (val === -1) throw new Error('Invalid base32 character')
		bits.push(...val.toString(2).padStart(5, '0').split('').map(Number))
	}

	const buffer = Buffer.alloc(Math.floor(bits.length / 8))
	for (let i = 0; i < buffer.length; i++) {
		buffer[i] = parseInt(bits.slice(i * 8, i * 8 + 8).join(''), 2)
	}

	return buffer
}

/**
 * Converter buffer para base32
 */
function bufferToBase32(buffer: Buffer): string {
	const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
	let bits = ''

	for (let i = 0; i < buffer.length; i++) {
		bits += buffer[i].toString(2).padStart(8, '0')
	}

	bits = bits.padEnd(Math.ceil(bits.length / 5) * 5, '0')

	let result = ''
	for (let i = 0; i < bits.length; i += 5) {
		const val = parseInt(bits.slice(i, i + 5), 2)
		result += base32Alphabet[val]
	}

	return result
}

/**
 * Gerar TOTP token (RFC 6238)
 */
function generateTOTP(secret: string, time: number = Math.floor(Date.now() / 1000)): string {
	const timeCounter = Math.floor(time / 30)
	const counterBuffer = Buffer.alloc(8)
	counterBuffer.writeBigInt64BE(BigInt(timeCounter))

	const secretBuffer = base32ToBuffer(secret)
	const hmac = createHmac('sha1', secretBuffer)
	hmac.update(counterBuffer)
	const digest = hmac.digest()

	const offset = digest[digest.length - 1] & 0xf
	const otp =
		(((digest[offset] & 0x7f) << 24) |
			((digest[offset + 1] & 0xff) << 16) |
			((digest[offset + 2] & 0xff) << 8) |
			(digest[offset + 3] & 0xff)) %
		1000000

	return otp.toString().padStart(6, '0')
}

export function createTwoFactorService() {
	/**
	 * Gerar novo secret TOTP
	 */
	function generateSecret(): TwoFactorSetup {
		// Gerar 20 bytes (160 bits) para secret TOTP
		const secretBuffer = randomBytes(20)
		const secret = bufferToBase32(secretBuffer)

		const backupCodes = generateBackupCodes(10)

		return {
			secret,
			backupCodes,
		}
	}

	/**
	 * Validar código TOTP (6 dígitos)
	 */
	function verifyToken(secret: string, token: string): boolean {
		try {
			// Validar entrada
			if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
				return false
			}

			const currentTime = Math.floor(Date.now() / 1000)

			// Verificar 3 janelas: atual, -30s, +30s
			for (let window = -1; window <= 1; window++) {
				const testTime = currentTime + window * 30
				const totp = generateTOTP(secret, testTime)

				if (totp === token) {
					return true
				}
			}

			return false
		} catch {
			return false
		}
	}

	/**
	 * Gerar códigos de backup (10 códigos)
	 */
	function generateBackupCodes(count: number = 10): string[] {
		const codes: string[] = []

		for (let i = 0; i < count; i++) {
			// Gerar 8 bytes = 16 caracteres hexadecimais
			const code = randomBytes(8).toString('hex').toUpperCase()
			// Formatar como XXXX-XXXX-XXXX-XXXX
			const formatted = `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}-${code.slice(12, 16)}`
			codes.push(formatted)
		}

		return codes
	}

	/**
	 * Validar e usar código de backup
	 */
	function useBackupCode(backupCodesData: BackupCodesData, code: string): boolean {
		const index = backupCodesData.codes.indexOf(code)

		if (index === -1) {
			return false
		}

		// Remover código usado
		backupCodesData.codes.splice(index, 1)
		return true
	}

	/**
	 * Verificar se backup codes estão vencidos (30 dias)
	 */
	function areBackupCodesExpired(backupCodesData: BackupCodesData): boolean {
		const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
		const age = Date.now() - backupCodesData.generatedAt

		return age > thirtyDaysMs
	}

	/**
	 * Gerar código de segurança (6 dígitos) para email
	 */
	function generateSecurityCode(): string {
		const code = Math.floor(Math.random() * 1000000)
			.toString()
			.padStart(6, '0')

		return code
	}

	return {
		generateSecret,
		verifyToken,
		generateBackupCodes,
		useBackupCode,
		areBackupCodesExpired,
		generateSecurityCode,
	}
}

export type TwoFactorService = ReturnType<typeof createTwoFactorService>
