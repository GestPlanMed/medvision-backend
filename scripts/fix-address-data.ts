import { db } from '../src/lib/prisma'

interface PatientRow {
	id: string
	address: unknown
}

async function fixAddressData() {
	console.log('Iniciando correção dos dados de endereço...')

	try {
		// Buscar todos os pacientes
		const patients = await db.$queryRawUnsafe<PatientRow[]>(
			'SELECT id, address FROM patients'
		)

		console.log(`Encontrados ${patients.length} pacientes`)

		for (const patient of patients) {
			if (patient.address === null || patient.address === undefined) {
				continue
			}

			// Se o address não é um objeto válido, tentar corrigir
			if (typeof patient.address === 'string') {
				try {
					// Tentar parsear se for string JSON
					const parsed = JSON.parse(patient.address)
					await db.$queryRawUnsafe(
						`UPDATE patients SET address = $1::jsonb WHERE id = $2`,
						JSON.stringify(parsed),
						patient.id
					)
					console.log(`✓ Paciente ${patient.id} corrigido`)
				} catch {
					// Se não for JSON válido, setar como null
					await db.$queryRawUnsafe(
						`UPDATE patients SET address = NULL WHERE id = $1`,
						patient.id
					)
					console.log(`⚠ Paciente ${patient.id} - endereço inválido removido`)
				}
			}
		}

		console.log('Correção concluída!')
	} catch (error) {
		console.error('Erro ao corrigir dados:', error)
	} finally {
		await db.$disconnect()
	}
}

fixAddressData()
