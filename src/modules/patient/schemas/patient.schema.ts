import z from 'zod'

export const UpdatePatientSchema = z.object({
	id: z.string().uuid('ID deve ser um UUID válido'),
	name: z
		.string()
		.min(3, 'Nome deve ter no mínimo 3 caracteres')
		.max(100, 'Nome deve ter no máximo 100 caracteres')
		.optional(),
	age: z.number().min(0, 'Idade não pode ser negativa').max(120, 'Idade inválida').optional(),
	phone: z
		.string()
		.min(10, 'Telefone deve ter no mínimo 10 dígitos')
		.max(15, 'Telefone deve ter no máximo 15 caracteres')
		.optional(),
	cpf: z
		.string()
		.min(11, 'CPF deve ter no mínimo 11 dígitos')
		.max(14, 'CPF deve ter no máximo 14 caracteres')
		.optional(),
	address: z
		.object({
			number: z.string().min(1, 'Número é obrigatório'),
			zipcode: z.string().min(8, 'CEP deve ter no mínimo 8 caracteres').max(9, 'CEP deve ter no máximo 9 caracteres'),
			street: z.string().min(1, 'Rua é obrigatória'),
			city: z.string().min(1, 'Cidade é obrigatória'),
			neighborhood: z.string().min(1, 'Bairro é obrigatório'),
		})
		.optional(),
})

export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>
