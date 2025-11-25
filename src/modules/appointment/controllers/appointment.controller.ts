import type { FastifyReply, FastifyRequest } from 'fastify'
import { AppointmentRepository } from '../repositories/appointment.repository'
import { CreateAppointmentSchema, UpdateAppointmentSchema } from '../schemas/appointment.schema'
import { DoctorRepository } from '@/modules/doctor/repositories/doctor.repository'

export class AppointmentController {
	private repository: AppointmentRepository
	private doctorRepository: DoctorRepository

	constructor() {
		this.repository = new AppointmentRepository()
		this.doctorRepository = new DoctorRepository()
	}

	async createAppointment(req: FastifyRequest, res: FastifyReply) {
		try {
			if (req.user?.role !== 'admin') {
				return res.status(403).send({
					ok: false,
					message: 'Acesso negado',
				})
			}

			const appointmentData = CreateAppointmentSchema.safeParse(req.body)

			if (!appointmentData.success) {
				return res.status(400).send({
					ok: false,
					message: 'Dados inválidos',
					errors: appointmentData.error,
				})
			}

			const hasSlot = await this.doctorRepository.hasAvailableSlot(
				appointmentData.data.doctorId,
				appointmentData.data.appointmentDate,
			)

			if (!hasSlot) {
				return res.status(409).send({
					ok: false,
					message: 'Horário indisponível para agendamento',
				})
			}

			const link = `https://meet.fake/${Math.random().toString(36).substring(2, 10)}`

			const appointment = await this.repository.create({
				...appointmentData.data,
				linkCall: link,
			})

			return res.status(201).send({
				ok: true,
				message: `Agendamento criado com sucesso`,
				data: {
					appointment,
				}
			})
		} catch (error) {
			return res.status(500).send({
				ok: false,
				message: `Erro ao criar agendamento: ${error}`,
			})
		}
	}

	async getAppointments(req: FastifyRequest, res: FastifyReply) {
		try {
			if (req.user?.role !== 'admin') {
				return res.status(403).send({
					ok: false,
					message: 'Acesso negado',
				})
			}

			const appointments = await this.repository.findAll()

			return res.status(200).send({
				ok: true,
				data: {
					appointments,
				},
			})
		} catch (error) {
			return res.status(500).send({
				ok: false,
				message: `Erro ao buscar agendamentos: ${error}`,
			})
		}
	}

	async updateAppointment(req: FastifyRequest, res: FastifyReply) {
		try {
			if (req.user?.role !== 'admin') {
				return res.status(403).send({
					ok: false,
					message: 'Acesso negado',
				})
			}

			const appointmentData = UpdateAppointmentSchema.safeParse(req.body)

			if (!appointmentData.success) {
				return res.status(400).send({
					ok: false,
					message: 'Dados inválidos',
					errors: appointmentData.error,
				})
			}

			const existingAppointment = await this.repository.findById(appointmentData.data.id)

			if (!existingAppointment) {
				return res.status(404).send({
					ok: false,
					message: 'Agendamento não encontrado',
				})
			}

			const updatedAppointment = await this.repository.update(appointmentData.data)

			return res.status(200).send({
				ok: true,
				message: `Agendamento atualizado com sucesso`,
				data: {
					appointment: updatedAppointment
				}
			})
		} catch (error) {
			return res.status(500).send({
				ok: false,
				message: `Erro ao atualizar agendamento: ${error}`,
			})
		}
	}
}
