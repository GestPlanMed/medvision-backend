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

	function cleanup(): void {
		const now = Date.now()
		for (const [key, log] of store.entries()) {
			if (now - log.timestamp > 3600000) {
				// 1 hora
				store.delete(key)
			}
		}
	}

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

	function getStatus(identifier: string, windowMs: number): { remaining: number; resetAt: number } {
		const log = store.get(identifier)

		if (!log) {
			return { remaining: Infinity, resetAt: Date.now() + windowMs }
		}

		const remaining = Math.max(0, log.count)
		const resetAt = log.timestamp + windowMs

		return { remaining, resetAt }
	}

	function reset(identifier: string): void {
		store.delete(identifier)
	}

	function checkGeneralLimit(identifier: string): boolean {
		return isLimited(identifier, {
			windowMs: 15 * 60 * 1000, // 15 minutos
			maxRequests: 100,
		})
	}

	function checkLoginLimit(identifier: string): boolean {
		return isLimited(identifier, {
			windowMs: 15 * 60 * 1000, // 15 minutos
			maxRequests: 5, // 5 tentativas
		})
	}

	function check2FALimit(identifier: string): boolean {
		return isLimited(identifier, {
			windowMs: 10 * 60 * 1000, // 10 minutos
			maxRequests: 3, // 3 tentativas
		})
	}

	function checkVerificationLimit(identifier: string): boolean {
		return isLimited(identifier, {
			windowMs: 60 * 60 * 1000, // 1 hora
			maxRequests: 3, // 3 tentativas
		})
	}

	function checkPasswordResetLimit(identifier: string): boolean {
		return isLimited(identifier, {
			windowMs: 60 * 60 * 1000, // 1 hora
			maxRequests: 3, // 3 tentativas
		})
	}

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
