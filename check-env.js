import { config } from 'dotenv';
config();

const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
    // Mask password
    const masked = dbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log('DATABASE_URL:', masked);
} else {
    console.log('DATABASE_URL is not set');
}
