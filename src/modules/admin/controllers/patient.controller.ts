import type { FastifyReply, FastifyRequest } from 'fastify'
import { PatientRepository } from '../../patient/repositories/patient.repository'

const patientRepository = new PatientRepository()

export class PatientController {
	async list(request: FastifyRequest, reply: FastifyReply) {
		try {
			if (request.user?.role !== 'admin') {
				return reply.status(403).send({ message: 'Acesso negado. Apenas administradores podem acessar este recurso.' })
			}

			const patients = await patientRepository.findAll()
			return reply.send(patients)
		} catch (error) {
			throw error
		}
	}

	async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			if (request.user?.role !== 'admin') {
				return reply.status(403).send({ message: 'Acesso negado. Apenas administradores podem acessar este recurso.' })
			}

			const patient = await patientRepository.findById(request.params.id)

			if (!patient) {
				return reply.status(404).send({ message: 'Paciente não encontrado.' })
			}

			return reply.send(patient)
		} catch (error) {
			throw error
		}
	}

	async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			if (request.user?.role !== 'admin') {
				return reply.status(403).send({ message: 'Acesso negado. Apenas administradores podem acessar este recurso.' })
			}

			const patient = await patientRepository.findById(request.params.id)

			if (!patient) {
				return reply.status(404).send({ message: 'Paciente não encontrado.' })
			}

			await patientRepository.delete(request.params.id)

			return reply.send({ message: 'Paciente deletado com sucesso.' })
		} catch (error) {
			throw error
		}
	}
}
