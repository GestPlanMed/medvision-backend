import type { FastifyReply, FastifyRequest } from 'fastify'
import { DoctorRepository } from '../../doctor/repositories/doctor.repository'
import bcrypt from 'bcrypt'

const doctorRepository = new DoctorRepository()

export class DoctorController {
	async list(request: FastifyRequest, reply: FastifyReply) {
		try {
			if (request.user?.role !== 'admin') {
				return reply.status(403).send({ message: 'Acesso negado. Apenas administradores podem acessar este recurso.' })
			}

			const doctors = await doctorRepository.findAll()
			return reply.send(doctors)
		} catch (error) {
			throw error
		}
	}

	async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			if (request.user?.role !== 'admin') {
				return reply.status(403).send({ message: 'Acesso negado. Apenas administradores podem acessar este recurso.' })
			}

			const doctor = await doctorRepository.findById(request.params.id)

			if (!doctor) {
				return reply.status(404).send({ message: 'Médico não encontrado.' })
			}

			return reply.send(doctor)
		} catch (error) {
			throw error
		}
	}

	async create(
		request: FastifyRequest<{
			Body: {
				name: string
				email: string
				password: string
				phone: string
				specialty: string
				crm: string
			}
		}>,
		reply: FastifyReply,
	) {
		try {
			if (request.user?.role !== 'admin') {
				return reply.status(403).send({ message: 'Acesso negado. Apenas administradores podem acessar este recurso.' })
			}

			const { name, email, password, phone, specialty, crm } = request.body

			// Verificar se o email já existe
			const existingDoctorByEmail = await doctorRepository.findByEmail(email)
			if (existingDoctorByEmail) {
				return reply.status(409).send({ message: 'Email já cadastrado.' })
			}

			// Verificar se o CRM já existe
			const existingDoctorByCRM = await doctorRepository.findByCRM(crm)
			if (existingDoctorByCRM) {
				return reply.status(409).send({ message: 'CRM já cadastrado.' })
			}

			// Hash da senha
			const hashedPassword = await bcrypt.hash(password, 5)

			const doctor = await doctorRepository.create({
				name,
				email,
				password: hashedPassword,
				phone,
				specialty,
				crm,
			})

			// Remover senha da resposta
			const { password: _password, ...doctorWithoutPassword } = doctor

			return reply.status(201).send({
				message: 'Médico criado com sucesso.',
				doctor: doctorWithoutPassword,
			})
		} catch (error) {
			throw error
		}
	}

	async update(
		request: FastifyRequest<{
			Params: { id: string }
			Body: {
				name?: string
				email?: string
				phone?: string
				specialty?: string
				crm?: string
			}
		}>,
		reply: FastifyReply,
	) {
		try {
			if (request.user?.role !== 'admin') {
				return reply.status(403).send({ message: 'Acesso negado. Apenas administradores podem acessar este recurso.' })
			}

			const doctor = await doctorRepository.findById(request.params.id)

			if (!doctor) {
				return reply.status(404).send({ message: 'Médico não encontrado.' })
			}

			// Verificar se o email está sendo alterado e se já existe
			if (request.body.email && request.body.email !== doctor.email) {
				const existingDoctorByEmail = await doctorRepository.findByEmail(request.body.email)
				if (existingDoctorByEmail) {
					return reply.status(409).send({ message: 'Email já cadastrado.' })
				}
			}

			// Verificar se o CRM está sendo alterado e se já existe
			if (request.body.crm && request.body.crm !== doctor.crm) {
				const existingDoctorByCRM = await doctorRepository.findByCRM(request.body.crm)
				if (existingDoctorByCRM) {
					return reply.status(409).send({ message: 'CRM já cadastrado.' })
				}
			}

			const updated = await doctorRepository.update(request.params.id, request.body)

			// Remover senha da resposta
			const { password: _password, ...doctorWithoutPassword } = updated

			return reply.send({
				message: 'Médico atualizado com sucesso.',
				doctor: doctorWithoutPassword,
			})
		} catch (error) {
			throw error
		}
	}

	async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			if (request.user?.role !== 'admin') {
				return reply.status(403).send({ message: 'Acesso negado. Apenas administradores podem acessar este recurso.' })
			}

			const doctor = await doctorRepository.findById(request.params.id)

			if (!doctor) {
				return reply.status(404).send({ message: 'Médico não encontrado.' })
			}

			await doctorRepository.delete(request.params.id)

			return reply.send({ message: 'Médico deletado com sucesso.' })
		} catch (error) {
			throw error
		}
	}
}
