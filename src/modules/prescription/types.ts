export interface PrescriptionData {
	id: string
	patientId: string
	doctorId: string
	appointmentId?: string
	content: string
	status: 'active' | 'expired' | 'cancelled'
	createdAt: Date
	updatedAt: Date
}

export interface CreatePrescriptionInput {
	patientId: string
	doctorId: string
	appointmentId?: string
	content: string
}

export interface UpdatePrescriptionInput {
	id: string
	content?: string
	status?: 'active' | 'expired' | 'cancelled'
}
