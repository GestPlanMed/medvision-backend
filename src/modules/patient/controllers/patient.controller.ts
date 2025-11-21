import type { FastifyReply, FastifyRequest } from 'fastify'
import { PatientRepository } from '../repositories/patient.repository'

export class PatientController {
	private repository: PatientRepository

	constructor() {
		this.repository = new PatientRepository()
	}

	async getPatientProfile(req: FastifyRequest, res: FastifyReply) {
		try {
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
}
