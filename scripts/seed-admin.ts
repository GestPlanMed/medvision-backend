import { PrismaClient } from '../src/generated/prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function seedAdmin() {
	try {
		console.log('🌱 Iniciando seed do admin...')

		// Buscar variáveis de ambiente para o admin
		const adminEmail = process.env.ADMIN_EMAIL || 'admin@medvision.com'
		const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456'
		const adminName = process.env.ADMIN_NAME || 'Administrador'

		// Verificar se o admin já existe
		const existingAdmin = await prisma.admin.findUnique({
			where: { email: adminEmail },
		})

		if (existingAdmin) {
			console.log(`⚠️  Admin com email ${adminEmail} já existe. Pulando seed...`)
			return
		}

		// Hash da senha
		const hashedPassword = await bcrypt.hash(adminPassword, 10)

		// Criar admin
		const admin = await prisma.admin.create({
			data: {
				name: adminName,
				email: adminEmail,
				password: hashedPassword,
			},
		})

		console.log('✅ Admin criado com sucesso!')
		console.log('📧 Email:', adminEmail)
		console.log('🔑 Senha:', adminPassword)
		console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!')
		console.log('👤 ID:', admin.id)
	} catch (error) {
		console.error('❌ Erro ao criar admin:', error)
		throw error
	} finally {
		await prisma.$disconnect()
	}
}

seedAdmin()
	.then(() => {
		console.log('🎉 Seed concluído!')
		process.exit(0)
	})
	.catch((error) => {
		console.error('💥 Erro fatal:', error)
		process.exit(1)
	})
