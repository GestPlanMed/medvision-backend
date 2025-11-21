/**
 * @fileoverview
 * Serviço de Rate Limiting - Proteção contra abuso
 * Responsável por: limitar requisições, proteção brute force
 */

interface RateLimitConfig {
	windowMs: number // Janela de tempo em ms
	maxRequests: number // Máximo de requisições permitidas
	message?: string
}

interface RequestLog {
	timestamp: number
	count: number
}

export function createRateLimitService() {
	const store = new Map<string, RequestLog>()

	/**
	 * Limpar registros expirados
	 */
	function cleanup(): void {
		const now = Date.now()
		for (const [key, log] of store.entries()) {
			if (now - log.timestamp > 3600000) {
				// 1 hora
				store.delete(key)
			}
		}
	}

	/**
	 * Verificar se cliente excedeu limite
	 */
	function isLimited(identifier: string, config: RateLimitConfig): boolean {
		const now = Date.now()
		const log = store.get(identifier)

		if (!log || now - log.timestamp > config.windowMs) {
			// Nova janela de tempo
			store.set(identifier, { timestamp: now, count: 1 })
			return false
		}

		log.count++

		if (log.count > config.maxRequests) {
			return true
		}

		return false
	}

	/**
	 * Obter informações de limite atual
	 */
	function getStatus(identifier: string, windowMs: number): { remaining: number; resetAt: number } {
		const log = store.get(identifier)

		if (!log) {
			return { remaining: Infinity, resetAt: Date.now() + windowMs }
		}

		const remaining = Math.max(0, log.count)
		const resetAt = log.timestamp + windowMs

		return { remaining, resetAt }
	}

	/**
	 * Resetar limite para um cliente
	 */
	function reset(identifier: string): void {
		store.delete(identifier)
	}

	/**
	 * Limitar requisições gerais (login, signup, etc)
	 */
	function checkGeneralLimit(identifier: string): boolean {
		return isLimited(identifier, {
			windowMs: 15 * 60 * 1000, // 15 minutos
			maxRequests: 100,
		})
	}

	/**
	 * Limitar tentativas de login
	 */
	function checkLoginLimit(identifier: string): boolean {
		return isLimited(identifier, {
			windowMs: 15 * 60 * 1000, // 15 minutos
			maxRequests: 5, // 5 tentativas
		})
	}

	/**
	 * Limitar tentativas de 2FA
	 */
	function check2FALimit(identifier: string): boolean {
		return isLimited(identifier, {
			windowMs: 10 * 60 * 1000, // 10 minutos
			maxRequests: 3, // 3 tentativas
		})
	}

	/**
	 * Limitar requisições de verificação de email
	 */
	function checkVerificationLimit(identifier: string): boolean {
		return isLimited(identifier, {
			windowMs: 60 * 60 * 1000, // 1 hora
			maxRequests: 3, // 3 tentativas
		})
	}

	/**
	 * Limitar requisições de redefinição de senha
	 */
	function checkPasswordResetLimit(identifier: string): boolean {
		return isLimited(identifier, {
			windowMs: 60 * 60 * 1000, // 1 hora
			maxRequests: 3, // 3 tentativas
		})
	}

	/**
	 * Executar limpeza periódica (call a cada 5 minutos)
	 */
	function startCleanupInterval(): NodeJS.Timeout {
		return setInterval(cleanup, 5 * 60 * 1000)
	}

	return {
		isLimited,
		getStatus,
		reset,
		checkGeneralLimit,
		checkLoginLimit,
		check2FALimit,
		checkVerificationLimit,
		checkPasswordResetLimit,
		cleanup,
		startCleanupInterval,
	}
}

export type RateLimitService = ReturnType<typeof createRateLimitService>
