const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    // Create default categories
    const categories = [
        { name: '生存基盤', subName: 'Foundation', sortOrder: 1 },
        { name: 'キャリア', subName: 'Career', sortOrder: 2 },
        { name: '関係的充足', subName: 'Connection', sortOrder: 3 },
        { name: '余白(趣味など)', subName: 'Free', sortOrder: 4 },
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { id: cat.subName.toLowerCase() },
            update: cat,
            create: { id: cat.subName.toLowerCase(), ...cat },
        });
    }

    console.log('Seed data created successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
