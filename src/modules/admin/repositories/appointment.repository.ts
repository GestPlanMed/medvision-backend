import { db } from '@/db'
import { appointments, doctors, patients } from '@/db/schema'
import { eq, and, gte, lte, desc } from 'drizzle-orm'
import type {
	CreateAppointmentInput,
	UpdateAppointmentInput,
	ListAppointmentsQueryInput,
} from '../schemas/appointment.schema'

export class AppointmentRepository {
	async createAppointment(data: CreateAppointmentInput) {
		const [appointment] = await db.insert(appointments).values(data).returning()
		return appointment
	}

	async findAppointmentById(id: string) {
		return await db
			.select({
				id: appointments.id,
				patientId: appointments.patientId,
				patientName: patients.name,
				patientCpf: patients.cpf,
				patientPhone: patients.phone,
				doctorId: appointments.doctorId,
				doctorName: doctors.name,
				doctorCrm: doctors.crm,
				doctorSpecialty: doctors.specialty,
				appointmentDate: appointments.appointmentDate,
				reason: appointments.reason,
				status: appointments.status,
				createdAt: appointments.createdAt,
				updatedAt: appointments.updatedAt,
			})
			.from(appointments)
			.leftJoin(patients, eq(appointments.patientId, patients.id))
			.leftJoin(doctors, eq(appointments.doctorId, doctors.id))
			.where(eq(appointments.id, id))
			.limit(1)
	}

	async updateAppointment(data: UpdateAppointmentInput) {
		const { id, ...rest } = data

		const [appointment] = await db
			.update(appointments)
			.set({
				...rest,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(appointments.id, id))
			.returning()

		return appointment
	}

	async deleteAppointment(id: string) {
		const [appointment] = await db.delete(appointments).where(eq(appointments.id, id)).returning()
		return appointment
	}

	async listAppointments(filters: ListAppointmentsQueryInput) {
		const { patientId, doctorId, status, startDate, endDate, page, limit } = filters

		const conditions = []

		if (patientId) {
			conditions.push(eq(appointments.patientId, patientId))
		}

		if (doctorId) {
			conditions.push(eq(appointments.doctorId, doctorId))
		}

		if (status) {
			conditions.push(eq(appointments.status, status))
		}

		if (startDate) {
			conditions.push(gte(appointments.appointmentDate, startDate))
		}

		if (endDate) {
			conditions.push(lte(appointments.appointmentDate, endDate))
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined

		const offset = (page - 1) * limit

		const results = await db
			.select({
				id: appointments.id,
				patientId: appointments.patientId,
				patientName: patients.name,
				patientCpf: patients.cpf,
				patientPhone: patients.phone,
				doctorId: appointments.doctorId,
				doctorName: doctors.name,
				doctorCrm: doctors.crm,
				doctorSpecialty: doctors.specialty,
				appointmentDate: appointments.appointmentDate,
				reason: appointments.reason,
				status: appointments.status,
				createdAt: appointments.createdAt,
				updatedAt: appointments.updatedAt,
			})
			.from(appointments)
			.leftJoin(patients, eq(appointments.patientId, patients.id))
			.leftJoin(doctors, eq(appointments.doctorId, doctors.id))
			.where(whereClause)
			.orderBy(desc(appointments.appointmentDate))
			.limit(limit)
			.offset(offset)

		return results
	}

	async findPatientById(id: string) {
		return await db.select().from(patients).where(eq(patients.id, id)).limit(1)
	}

	async findDoctorById(id: string) {
		return await db.select().from(doctors).where(eq(doctors.id, id)).limit(1)
	}
}
