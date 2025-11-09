import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	schema: './src/db/schema.ts',
	out: './src/db/drizzle/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		host: process.env.DB_HOST || 'localhost',
		port: Number(process.env.DB_PORT) || 5432,
		user: process.env.DB_USER!,
		password: process.env.DB_PASSWORD!,
		database: process.env.DB_NAME!,
		ssl: process.env.NODE_ENV === 'production' ? true : false,
	},
})
