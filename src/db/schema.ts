import { pgTable, text, timestamp, varchar, integer, uuid } from 'drizzle-orm/pg-core'

export const admins = pgTable('admins', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	password: text('password').notNull(),
	resetCode: varchar('reset_code', { length: 6 }),
	createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true }).defaultNow().notNull()
})

export const patients = pgTable('patients', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	age: integer('age').notNull(),
	cpf: varchar('cpf', { length: 14 }).notNull().unique(),
	phone: varchar('phone', { length: 20 }).notNull(),
	address: text('address'),
	code: text('code'),
	createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true }).defaultNow().notNull(),
})

export const doctors = pgTable('doctors', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	phone: varchar('phone', { length: 20 }).notNull(),
	crm: varchar('crm', { length: 20 }).notNull().unique(),
	specialty: text('specialty').notNull(),
	code: text('code'),
	password: text('password').notNull(),
	resetCode: varchar('reset_code', { length: 6 }),
	createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true }).defaultNow().notNull(),
})

export const appointments = pgTable('appointments', {
	id: uuid('id').defaultRandom().primaryKey(),
	patientId: uuid('patient_id')
		.notNull()
		.references(() => patients.id),
	doctorId: uuid('doctor_id')
		.notNull()
		.references(() => doctors.id),
	appointmentDate: timestamp('appointment_date', { mode: 'string', withTimezone: true }).notNull(),
	reason: text('reason').notNull(),
	createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true }).defaultNow().notNull(),
})
