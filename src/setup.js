/**
 * Automatic database setup script
 * Runs migrations and creates initial data if needed
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../prisma/dev.db');

console.log('🔧 Setting up database...');

try {
    // Check if database exists
    const dbExists = fs.existsSync(dbPath);
    
    if (!dbExists) {
        console.log('📦 Database not found. Creating new database...');
    }

    // Generate Prisma client
    console.log('⚙️  Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Run migrations
    console.log('🔄 Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    // Create initial skills if database is new
    if (!dbExists) {
        console.log('🌱 Creating initial skill data...');
        await createInitialSkills();
    }

    console.log('✅ Database setup complete!\n');
} catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
}

async function createInitialSkills() {
    try {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();

        const skills = [
            // Technical Skills
            { name: 'JavaScript', category: 'Technical', description: 'Programming language for web development' },
            { name: 'Python', category: 'Technical', description: 'General-purpose programming language' },
            { name: 'React', category: 'Technical', description: 'JavaScript library for building user interfaces' },
            { name: 'Node.js', category: 'Technical', description: 'JavaScript runtime for backend development' },
            { name: 'SQL', category: 'Technical', description: 'Database query language' },
            { name: 'Git', category: 'Technical', description: 'Version control system' },
            { name: 'Docker', category: 'Technical', description: 'Containerization platform' },
            { name: 'AWS', category: 'Technical', description: 'Cloud computing services' },
            
            // Soft Skills
            { name: 'Communication', category: 'Soft Skills', description: 'Effective verbal and written communication' },
            { name: 'Leadership', category: 'Soft Skills', description: 'Ability to lead and motivate teams' },
            { name: 'Problem Solving', category: 'Soft Skills', description: 'Analytical thinking and solution finding' },
            { name: 'Time Management', category: 'Soft Skills', description: 'Efficient task prioritization and execution' },
            { name: 'Teamwork', category: 'Soft Skills', description: 'Collaborative work abilities' },
            
            // Domain Knowledge
            { name: 'Machine Learning', category: 'Domain Knowledge', description: 'AI and ML concepts' },
            { name: 'Data Analysis', category: 'Domain Knowledge', description: 'Data processing and insights' },
            { name: 'UI/UX Design', category: 'Domain Knowledge', description: 'User interface and experience design' },
            { name: 'Agile Methodology', category: 'Domain Knowledge', description: 'Agile project management' },
        ];

        for (const skill of skills) {
            await prisma.skill.upsert({
                where: { name: skill.name },
                update: {},
                create: skill
            });
        }

        console.log(`   Created ${skills.length} initial skills`);
        await prisma.$disconnect();
    } catch (error) {
        console.error('   Warning: Could not create initial skills:', error.message);
    }
}
