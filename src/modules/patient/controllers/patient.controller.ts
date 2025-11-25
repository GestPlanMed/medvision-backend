import type { FastifyReply, FastifyRequest } from 'fastify'
import { PatientRepository } from '../repositories/patient.repository'
import { UpdatePatientSchema } from '../schemas/patient.schema'

export class PatientController {
	private repository: PatientRepository

	constructor() {
		this.repository = new PatientRepository()
	}

	async getPatientProfile(req: FastifyRequest, res: FastifyReply) {
		try {
			if (req.user?.role !== 'patient') {
				return res.status(403).send({
					ok: false,
					message: 'Acesso negado',
				})
			}

			const { patientId } = req.query as { patientId: string }

			const patient = await this.repository.findById(patientId)

			if (!patient) {
				return res.status(404).send({
					ok: false,
					message: 'Paciente não encontrado',
				})
			}

			return res.status(200).send({
				ok: true,
				data: patient,
			})
		} catch (error) {
			console.error('[GetPatientProfile Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao buscar perfil do paciente',
			})
		}
	}

	async getAllPatients(req: FastifyRequest, res: FastifyReply) {
		try {
			if (req.user?.role !== 'admin') {
				return res.status(403).send({
					ok: false,
					message: 'Acesso negado',
				})
			}

			const patients = await this.repository.findAll()

			return res.status(200).send({
				ok: true,
				data: {
					patients,
				},
			})
		} catch (error) {
			console.error('[GetAllPatients Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao buscar pacientes',
			})
		}
	}

	async updatePatient(req: FastifyRequest, res: FastifyReply) {
		try {
			if (req.user?.role === 'patient') {
				return res.status(403).send({
					ok: false,
					message: 'Acesso negado',
				})
			}

			const updateData = UpdatePatientSchema.safeParse(req.body)

			if (!updateData.success) {
				return res.status(400).send({
					ok: false,
					message: 'Erro no corpo da requisição',
					details: updateData.error.issues,
				})
			}

			const patient = await this.repository.findById(updateData.data.id)

			if (!patient) {
				return res.status(404).send({
					ok: false,
					message: 'Paciente não encontrado',
				})
			}

			const updatedPatient = await this.repository.update(updateData.data)

			return res.status(200).send({
				ok: true,
				message: 'Paciente atualizado com sucesso',
				data: {
					patient: updatedPatient,
				},
			})
		} catch (error) {
			console.error('[UpdatePatient Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao atualizar paciente',
			})
		}
	}
}