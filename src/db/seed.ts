import { db } from './index'
import { admins, doctors, patients } from './schema'
import bcrypt from 'bcrypt'

async function seed() {
    console.log('🌱 Seeding database...')

    try {
        // Criar Admin padrão
        const hashedAdminPassword = await bcrypt.hash('admin123', 5)
        
        await db
            .insert(admins)
            .values({
                name: 'Administrador',
                email: 'admin@medvision.com',
                password: hashedAdminPassword,
            })
            .onConflictDoNothing()

        console.log('✅ Admin criado: admin@medvision.com / admin123')

        // Criar médico de exemplo
        const hashedDoctorPassword = await bcrypt.hash('doctor123', 5)
        
        const [doctor] = await db
            .insert(doctors)
            .values({
                name: 'Dr. João Silva',
                email: 'joao@medvision.com',
                password: hashedDoctorPassword,
                specialty: 'Cardiologia',
                crm: '123456-SP',
            })
            .onConflictDoNothing()
            .returning()

        console.log('✅ Médico criado: joao@medvision.com / doctor123')

        // Criar paciente de exemplo
        const [patient] = await db
            .insert(patients)
            .values({
                name: 'Maria Santos',
                email: 'maria@email.com',
                cpf: '12345678900',
                phone: '11999999999',
                birthDate: '1990-01-01',
            })
            .onConflictDoNothing()
            .returning()

        console.log('✅ Paciente criado: CPF 12345678900')

        console.log('✅ Seed completed!')
    } catch (error) {
        console.error('❌ Seed failed:', error)
        process.exit(1)
    }
}

seed()