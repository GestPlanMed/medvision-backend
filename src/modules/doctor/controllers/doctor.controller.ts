import type { FastifyReply, FastifyRequest } from 'fastify'
import { DoctorRepository } from '../repositories/doctor.repository'
import { UpdateDoctorSchema } from '../schemas/doctor.schema'

export class DoctorController {
	private repository: DoctorRepository

	constructor() {
		this.repository = new DoctorRepository()
	}

	async getAllDoctors() {
		try {
			return await this.repository.findAll()
		} catch (error) {
			throw new Error(`Failed to get all doctors: ${error}`)
		}
	}

	async getDoctorById(req: FastifyRequest, res: FastifyReply) {
		try {
			const { id } = req.params as { id: string }
			const doctor = await this.repository.findById(id)
			if (!doctor) {
				return res.status(404).send({ error: 'Doctor not found.' })
			}
			return res.send(doctor)
		} catch (error) {
			console.error('Error fetching doctor by ID:', error)
			return res.status(500).send({ error: 'An error occurred while fetching the doctor.' })
		}
	}

	async updateDoctor(req: FastifyRequest, res: FastifyReply) {
		try {
			const updateData = UpdateDoctorSchema.safeParse(req.body)

			if (!updateData.success) {
				return res.status(400).send({ error: 'Erro no corpo da requisição', details: updateData.error.issues })
			}

			const updatedDoctor = await this.repository.update(updateData.data)

			if (!updatedDoctor) {
				return res.status(404).send({ error: 'Doctor not found.' })
			}

			return res.status(200).send(updatedDoctor)
		} catch (error) {
			console.error('Error updating doctor:', error)
			return res.status(500).send({ error: 'An error occurred while updating the doctor.' })
		}
	}
}
