export type UserRole = 'admin' | 'doctor' | 'patient'

export type AdminPermission =
	| 'create:user'
	| 'read:all_users'
	| 'update:any_user'
	| 'delete:user'
	| 'read:all_appointments'
	| 'read:audit_logs'
	| 'manage:roles'
	| 'manage:permissions'
	| 'manage:system_settings'

export type DoctorPermission =
	| 'read:assigned_appointments'
	| 'create:medical_record'
	| 'read:assigned_patients'
	| 'update:appointment'
	| 'read:own_profile'
	| 'update:own_profile'
	| 'read:own_schedule'

export type PatientPermission =
	| 'read:own_appointments'
	| 'read:own_medical_records'
	| 'create:appointment'
	| 'read:own_profile'
	| 'update:own_profile'

export type Permission = AdminPermission | DoctorPermission | PatientPermission

export interface JWTBasePayload {
	sub: string // User ID
	role: UserRole
	iat: number // Issued at
	exp: number // Expiration
	aud: 'medvision'
	iss: 'medvision-auth'
}

export interface PatientJWTPayload extends JWTBasePayload {
	role: 'patient'
	cpf: string
}

export interface DoctorJWTPayload extends JWTBasePayload {
	role: 'doctor'
	email: string
	crm: string
}

export interface AdminJWTPayload extends JWTBasePayload {
	role: 'admin'
	email: string
	sessionId: string
}

export type JWTPayload = PatientJWTPayload | DoctorJWTPayload | AdminJWTPayload

export interface AuthSuccessResponse<T> {
	token: string
	refreshToken: string
	expiresIn: number
	user: T
}

export interface PatientAuthResponse extends AuthSuccessResponse<PatientUser> {
	requiresTwoFactor?: false
}

export interface DoctorAuthResponse extends AuthSuccessResponse<DoctorUser> {
	requiresTwoFactor?: boolean
}

export interface AdminAuthResponse extends AuthSuccessResponse<AdminUser> {
	sessionId: string
	requiresTwoFactor?: false
}

export interface PatientUser {
	id: string
	name: string
	cpf: string
	phone: string
	age: number
	address?: string
	role: 'patient'
}

export interface DoctorUser {
	id: string
	name: string
	email: string
	phone: string
	crm: string
	specialty: string
	role: 'doctor'
}

export interface AdminUser {
	id: string
	name: string
	email: string
	role: 'admin'
	permissions: AdminPermission[]
}

export type User = PatientUser | DoctorUser | AdminUser

export interface PatientLoginRequest {
	cpf: string
	securityCode: string
}

export interface DoctorLoginRequest {
	email: string
	password: string
	totpCode?: string
}

export interface AdminLoginRequest {
	email: string
	password: string
	totpCode: string
}

export interface RefreshTokenRequest {
	refreshToken: string
}

export interface ForgotPasswordRequest {
	email: string
}

export interface ResetPasswordRequest {
	email: string
	code: string
	newPassword: string
}

export interface SetupTwoFactorRequest {
	method: 'totp' | 'sms' | 'email'
}

export interface SetupTwoFactorResponse {
	qrCode: string
	secret: string
	backupCodes?: string[]
}

export interface VerifyTwoFactorRequest {
	tempToken?: string
	totpCode: string
}

export interface ConfirmTwoFactorRequest {
	totpCode: string
}

// ============================================================================
// SESSÕES DE ADMINISTRADOR
// ============================================================================

export interface AdminSession {
	id: string
	adminId: string
	token: string
	ipAddress: string
	userAgent: string
	createdAt: Date
	lastActivityAt: Date
	expiresAt: Date
	isActive: boolean
}

// ============================================================================
// PROTEÇÃO CONTRA FORÇA BRUTA
// ============================================================================

export interface BruteForceConfig {
	maxAttempts: number
	lockoutDuration: number // em minutos
	resetAfter: number // em minutos
}

export interface BruteForceAttempt {
	id: string
	identifier: string // CPF, email ou email
	role: UserRole
	attemptCount: number
	lastAttemptAt: Date
	isLocked: boolean
	lockedUntil?: Date
}

// ============================================================================
// CONFIGURAÇÕES DE RATE LIMITING
// ============================================================================

export interface RateLimitConfig {
	windowMs: number // janela em ms
	maxRequests: number // máximas requisições por janela
}

export interface ErrorResponse {
	code: string
	message: string
	details?: Record<string, unknown>
	timestamp: string
}

export enum AuthErrorCode {
	INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
	USER_NOT_FOUND = 'USER_NOT_FOUND',
	ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
	INVALID_TOKEN = 'INVALID_TOKEN',
	TOKEN_EXPIRED = 'TOKEN_EXPIRED',
	MISSING_2FA = 'MISSING_2FA',
	INVALID_2FA = 'INVALID_2FA',
	EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
	WEAK_PASSWORD = 'WEAK_PASSWORD',
	DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',
	DUPLICATE_CPF = 'DUPLICATE_CPF',
	RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
	UNAUTHORIZED = 'UNAUTHORIZED',
	FORBIDDEN = 'FORBIDDEN',
	INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export const PASSWORD_REQUIREMENTS = {
	patient: {
		minLength: 6,
		requireUppercase: false,
		requireLowercase: false,
		requireNumbers: false,
		requireSymbols: false,
	},
	doctor: {
		minLength: 8,
		requireUppercase: true,
		requireLowercase: true,
		requireNumbers: true,
		requireSymbols: false,
	},
	admin: {
		minLength: 12,
		requireUppercase: true,
		requireLowercase: true,
		requireNumbers: true,
		requireSymbols: true,
	},
}

export const TOKEN_EXPIRATION = {
	patient: 7 * 24 * 60 * 60, // 7 dias em segundos
	doctor: 8 * 60 * 60, // 8 horas em segundos
	admin: 4 * 60 * 60, // 4 horas em segundos
}

export const REFRESH_TOKEN_EXPIRATION = {
	patient: 30 * 24 * 60 * 60, // 30 dias em segundos
	doctor: 30 * 24 * 60 * 60, // 30 dias em segundos
	admin: 30 * 24 * 60 * 60, // 30 dias em segundos
}

export const BRUTE_FORCE_CONFIG: Record<UserRole, BruteForceConfig> = {
	patient: {
		maxAttempts: 5,
		lockoutDuration: 15,
		resetAfter: 1440,
	},
	doctor: {
		maxAttempts: 3,
		lockoutDuration: 30,
		resetAfter: 1440,
	},
	admin: {
		maxAttempts: 3,
		lockoutDuration: 60,
		resetAfter: 1440,
	},
}

export const RATE_LIMIT_CONFIG: Record<string, RateLimitConfig> = {
	publicAuth: {
		windowMs: 1 * 60 * 1000, // 1 minuto
		maxRequests: 5,
	},
	patientLogin: {
		windowMs: 5 * 60 * 1000, // 5 minutos
		maxRequests: 10,
	},
	doctorLogin: {
		windowMs: 5 * 60 * 1000, // 5 minutos
		maxRequests: 5,
	},
	adminLogin: {
		windowMs: 10 * 60 * 1000, // 10 minutos
		maxRequests: 3,
	},
}
