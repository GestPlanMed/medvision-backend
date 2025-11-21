import { db } from './index'
import { admins } from './schema'
import bcrypt from 'bcrypt'

async function seed() {
	console.log('🌱 Seeding database...')

	try {
		const hashedAdminPassword = await bcrypt.hash('admin123', 5)

		await db
			.insert(admins)
			.values({
				name: 'Natanael Souza',
				email: 'natanaelsouza.dev@gmail.com',
				password: hashedAdminPassword,
			})
			.onConflictDoNothing({ target: admins.email })

		console.log('✅ Admin criado: natanaelsouza.dev@gmail.com / admin123')

		console.log('✅ Seed completed!')
	} catch (error) {
		console.error('❌ Seed failed:', error)
		process.exit(1)
	}
}

seed()
