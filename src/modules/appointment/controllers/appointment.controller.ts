import type { FastifyReply, FastifyRequest } from 'fastify'
import { AppointmentRepository } from '../repositories/appointment.repository'
import { CreateAppointmentSchema, UpdateAppointmentSchema } from '../schemas/appointment.schema'
import { DoctorRepository } from '@/modules/doctor/repositories/doctor.repository'
import { createCryptoService, createDailyService } from '@/services'

export class AppointmentController {
    private repository: AppointmentRepository
    private doctorRepository: DoctorRepository
    private dailyService: ReturnType<typeof createDailyService>

    constructor() {
        this.repository = new AppointmentRepository()
        this.doctorRepository = new DoctorRepository()
        this.dailyService = createDailyService()
    }

    async createAppointment(req: FastifyRequest, res: FastifyReply) {
        try {
            if (req.user?.role !== 'admin') {
                console.log('Acesso negado: role é', req.user?.role)
                return res.status(403).send({
                    ok: false,
                    message: 'Acesso negado',
                })
            }

            const appointmentData = CreateAppointmentSchema.safeParse(req.body)

            if (!appointmentData.success) {
                console.log('Validação falhou:', appointmentData.error)
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

            const roomName = `consulta_${createCryptoService().generateRandomCode(10)}`

            const dailyRoom = await this.dailyService.createRoom(roomName, 'pending')

            const appointment = await this.repository.create({
                ...appointmentData.data,
                roomName: dailyRoom.roomName,
            })

            return res.status(201).send({
                ok: true,
                message: 'Agendamento criado com sucesso',
                data: {
                    appointment,
                    roomUrl: dailyRoom.url,
                    accessInfo: {
                        message: 'Para acessar a videochamada, solicite um token em /appointments/{id}/token',
                        tokenEndpoint: `/appointments/${appointment.id}/token`,
                    }
                }
            })
        } catch (error) {
            console.error('❌ ERRO EM CREATEAPPOINTMENT:', error)
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

            // Adiciona roomUrl para cada appointment
            const appointmentsWithRoomUrl = appointments.map(appointment => ({
                ...appointment,
                roomUrl: appointment.roomName 
                    ? `https://njsolutions.daily.co/${appointment.roomName}` 
                    : null,
            }))

            return res.status(200).send({
                ok: true,
                data: {
                    appointments: appointmentsWithRoomUrl,
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
            if (req.user?.role === 'patient') {
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
                    message: 'Consulta não encontrada',
                })
            }

            const updatedAppointment = await this.repository.update(appointmentData.data)

            return res.status(200).send({
                ok: true,
                message: `Consulta atualizada com sucesso`,
                data: {
                    appointment: updatedAppointment
                }
            })
        } catch (error) {
            return res.status(500).send({
                ok: false,
                message: `Erro ao atualizar consulta: ${error}`,
            })
        }
    }

    async deleteAppointment(req: FastifyRequest, res: FastifyReply) {
        try {
            if (req.user?.role !== 'admin') {
                return res.status(403).send({
                    ok: false,
                    message: 'Acesso negado',
                })
            }

            const { id } = req.params as { id: string }

            const appointment = await this.repository.findById(id)

            if (!appointment) {
                return res.status(404).send({
                    ok: false,
                    message: 'Consulta não encontrada',
                })
            }

            // Deleta a sala do Daily.co
            if (appointment.roomName) {
                await this.dailyService.deleteRoom(appointment.roomName)
            }

            await this.repository.delete(id)

            return res.status(200).send({
                ok: true,
                message: 'Consulta deletada com sucesso',
            })
        } catch (error) {
            return res.status(500).send({
                ok: false,
                message: `Erro ao deletar consulta: ${error}`,
            })
        }
    }

    async getRoomToken(req: FastifyRequest, res: FastifyReply) {
        try {
            const { appointmentId } = req.params as { appointmentId: string }

            const appointment = await this.repository.findById(appointmentId)

            if (!appointment) {
                return res.status(404).send({
                    ok: false,
                    message: 'Consulta não encontrada',
                })
            }

            // Validação de permissão: apenas doctor ou patient da consulta podem acessar
            const isDoctor = req.user?.role === 'doctor' && req.user?.sub === appointment.doctorId
            const isPatient = req.user?.role === 'patient' && req.user?.sub === appointment.patientId
            const isAdmin = req.user?.role === 'admin'

            if (!isDoctor && !isPatient && !isAdmin) {
                return res.status(403).send({
                    ok: false,
                    message: 'Você não tem permissão para acessar esta consulta',
                })
            }

            if (appointment.status !== 'scheduled' && appointment.status !== 'in_progress') {
                return res.status(400).send({
                    ok: false,
                    message: 'Consulta não está disponível para acesso',
                })
            }

            const userRole = req.user?.role === 'doctor' ? 'doctor' : 
                             req.user?.role === 'patient' ? 'patient' : 
                             'admin'

            const token = await this.dailyService.generateToken(
                appointment.roomName || '',
                req.user?.sub || '',
                userRole,
                {
                    userName: 'Usuário',
                    expiresIn: 3600,
                },
            )

            return res.status(200).send({
                ok: true,
                data: {
                    token,
                    roomName: appointment.roomName,
                    roomUrl: `https://njsolutions.daily.co/${appointment.roomName}?t=${token}`,
                    accessUrl: `https://njsolutions.daily.co/${appointment.roomName}?t=${token}`,
                },
            })
        } catch (error) {
            console.error('ERRO EM GETROOMTOKEN:', error)
            return res.status(500).send({
                ok: false,
                message: `Erro ao gerar token: ${error}`,
            })
        }
    }
}
