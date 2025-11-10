import type { FastifyReply, FastifyRequest } from 'fastify'
import { AppointmentRepository } from '../repositories/appointment.repository'
import {
	CreateAppointmentSchema,
	UpdateAppointmentSchema,
	GetAppointmentByIdSchema,
	DeleteAppointmentSchema,
	ListAppointmentsQuerySchema,
} from '../schemas/appointment.schema'

export class AppointmentController {
	private appointmentRepository: AppointmentRepository

	constructor() {
		this.appointmentRepository = new AppointmentRepository()
	}

	async createAppointment(req: FastifyRequest, res: FastifyReply) {
		try {
			const data = CreateAppointmentSchema.safeParse(req.body)

			if (!data.success) {
				return res.status(400).send({
					message: 'Dados inválidos.',
					errors: data.error.format(),
				})
			}

			// Verificar se o paciente existe
			const patient = await this.appointmentRepository.findPatientById(data.data.patientId)
			if (patient.length === 0) {
				return res.status(404).send({ message: 'Paciente não encontrado.' })
			}

			// Verificar se o médico existe
			const doctor = await this.appointmentRepository.findDoctorById(data.data.doctorId)
			if (doctor.length === 0) {
				return res.status(404).send({ message: 'Médico não encontrado.' })
			}

			const appointment = await this.appointmentRepository.createAppointment(data.data)

			return res.status(201).send({
				message: 'Agendamento criado com sucesso.',
				appointment,
			})
		} catch (error) {
			throw error
		}
	}

	async getAppointmentById(req: FastifyRequest, res: FastifyReply) {
		try {
			const data = GetAppointmentByIdSchema.safeParse(req.params)

			if (!data.success) {
				return res.status(400).send({
					message: 'ID inválido.',
					errors: data.error.format(),
				})
			}

			const appointment = await this.appointmentRepository.findAppointmentById(data.data.id)

			if (appointment.length === 0) {
				return res.status(404).send({ message: 'Agendamento não encontrado.' })
			}

			return appointment[0]
		} catch (error) {
			throw error
		}
	}

	async updateAppointment(req: FastifyRequest, res: FastifyReply) {
		try {
			const params = GetAppointmentByIdSchema.safeParse(req.params)

			if (!params.success) {
				return res.status(400).send({
					message: 'ID inválido.',
					errors: params.error.format(),
				})
			}

			const data = UpdateAppointmentSchema.safeParse({
				...(req.body as object),
				id: params.data.id,
			})

			if (!data.success) {
				return res.status(400).send({
					message: 'Dados inválidos.',
					errors: data.error.format(),
				})
			}

			// Verificar se o agendamento existe
			const appointmentExists = await this.appointmentRepository.findAppointmentById(data.data.id)
			if (appointmentExists.length === 0) {
				return res.status(404).send({ message: 'Agendamento não encontrado.' })
			}

			// Se está atualizando o paciente, verificar se ele existe
			if (data.data.patientId) {
				const patient = await this.appointmentRepository.findPatientById(data.data.patientId)
				if (patient.length === 0) {
					return res.status(404).send({ message: 'Paciente não encontrado.' })
				}
			}

			// Se está atualizando o médico, verificar se ele existe
			if (data.data.doctorId) {
				const doctor = await this.appointmentRepository.findDoctorById(data.data.doctorId)
				if (doctor.length === 0) {
					return res.status(404).send({ message: 'Médico não encontrado.' })
				}
			}

			const appointment = await this.appointmentRepository.updateAppointment(data.data)

			return res.status(200).send({
				message: 'Agendamento atualizado com sucesso.',
				appointment,
			})
		} catch (error) {
			throw error
		}
	}

	async deleteAppointment(req: FastifyRequest, res: FastifyReply) {
		try {
			const data = DeleteAppointmentSchema.safeParse(req.params)

			if (!data.success) {
				return res.status(400).send({
					message: 'ID inválido.',
					errors: data.error.format(),
				})
			}

			const appointmentExists = await this.appointmentRepository.findAppointmentById(data.data.id)
			if (appointmentExists.length === 0) {
				return res.status(404).send({ message: 'Agendamento não encontrado.' })
			}

			await this.appointmentRepository.deleteAppointment(data.data.id)

			return res.status(200).send({
				message: 'Agendamento excluído com sucesso.',
			})
		} catch (error) {
			throw error
		}
	}

	async listAppointments(req: FastifyRequest, res: FastifyReply) {
		try {
			const data = ListAppointmentsQuerySchema.safeParse(req.query)

			if (!data.success) {
				return res.status(400).send({
					message: 'Parâmetros inválidos.',
					errors: data.error.format(),
				})
			}

			const appointments = await this.appointmentRepository.listAppointments(data.data)

			return {
				appointments,
				pagination: {
					page: data.data.page,
					limit: data.data.limit,
				},
			}
		} catch (error) {
			throw error
		}
	}
}
