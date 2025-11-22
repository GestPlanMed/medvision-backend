import type { FastifyReply, FastifyRequest } from 'fastify'
import { CreatePrescriptionSchema, UpdatePrescriptionSchema, ListPrescriptionsFilterSchema } from '../schemas/prescription.schema'
import { PrescriptionRepository } from '../repositories/prescription.repository'

export class PrescriptionController {
	private repository: PrescriptionRepository

	constructor() {
		this.repository = new PrescriptionRepository()
	}

	async getAllPrescriptions(req: FastifyRequest, res: FastifyReply) {
		try {
			const query = ListPrescriptionsFilterSchema.parse(req.query)

			const prescriptions = await this.repository.findAll(query)

			return res.status(200).send({
				ok: true,
				data: prescriptions,
			})
		} catch (error) {
			console.error('[GetAllPrescriptions Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao buscar prescrições',
			})
		}
	}

	async getPrescriptionById(req: FastifyRequest, res: FastifyReply) {
		try {
			const { id } = req.params as { id: string }

			const prescription = await this.repository.findById(id)

			if (!prescription) {
				return res.status(404).send({
					ok: false,
					message: 'Prescrição não encontrada',
				})
			}

			return res.status(200).send({
				ok: true,
				data: prescription,
			})
		} catch (error) {
			console.error('[GetPrescriptionById Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao buscar prescrição',
			})
		}
	}

	async getPrescriptionsByPatient(req: FastifyRequest, res: FastifyReply) {
		try {
			const { patientId } = req.params as { patientId: string }
			const query = ListPrescriptionsFilterSchema.parse(req.query)

			const prescriptions = await this.repository.findByPatientId(patientId, query)

			return res.status(200).send({
				ok: true,
				data: prescriptions,
			})
		} catch (error) {
			console.error('[GetPrescriptionsByPatient Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao buscar prescrições do paciente',
			})
		}
	}

	async getPrescriptionsByDoctor(req: FastifyRequest, res: FastifyReply) {
		try {
			const { doctorId } = req.params as { doctorId: string }
			const query = ListPrescriptionsFilterSchema.parse(req.query)

			const prescriptions = await this.repository.findByDoctorId(doctorId, query)

			return res.status(200).send({
				ok: true,
				data: prescriptions,
			})
		} catch (error) {
			console.error('[GetPrescriptionsByDoctor Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao buscar prescrições do médico',
			})
		}
	}

	async createPrescription(req: FastifyRequest, res: FastifyReply) {
		try {
			const body = CreatePrescriptionSchema.parse(req.body)

			if (req.user?.role !== 'doctor' && req.user?.role !== 'admin') {
				return res.status(403).send({
					ok: false,
					message: 'Acesso negado. Apenas médicos e admins podem criar prescrições',
				})
			}

			const prescription = await this.repository.create(body)

			return res.status(201).send({
				ok: true,
				data: prescription,
				message: 'Prescrição criada com sucesso',
			})
		} catch (error) {
			console.error('[CreatePrescription Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao criar prescrição',
			})
		}
	}

	async updatePrescription(req: FastifyRequest, res: FastifyReply) {
		try {
			const body = UpdatePrescriptionSchema.parse(req.body)

			if (req.user?.role !== 'doctor' && req.user?.role !== 'admin') {
				return res.status(403).send({
					ok: false,
					message: 'Acesso negado. Apenas médicos e admins podem atualizar prescrições',
				})
			}

			const prescription = await this.repository.findById(body.id)

			if (!prescription) {
				return res.status(404).send({
					ok: false,
					message: 'Prescrição não encontrada',
				})
			}

			const updated = await this.repository.update(body)

			return res.status(200).send({
				ok: true,
				data: updated,
				message: 'Prescrição atualizada com sucesso',
			})
		} catch (error) {
			console.error('[UpdatePrescription Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao atualizar prescrição',
			})
		}
	}

	async deletePrescription(req: FastifyRequest, res: FastifyReply) {
		try {
			const { id } = req.params as { id: string }

			if (req.user?.role !== 'doctor' && req.user?.role !== 'admin') {
				return res.status(403).send({
					ok: false,
					message: 'Acesso negado. Apenas médicos e admins podem deletar prescrições',
				})
			}

			const prescription = await this.repository.findById(id)

			if (!prescription) {
				return res.status(404).send({
					ok: false,
					message: 'Prescrição não encontrada',
				})
			}

			await this.repository.delete(id)

			return res.status(200).send({
				ok: true,
				message: 'Prescrição deletada com sucesso',
			})
		} catch (error) {
			console.error('[DeletePrescription Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao deletar prescrição',
			})
		}
	}
}
