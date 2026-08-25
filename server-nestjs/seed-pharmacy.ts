import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const medications = [
  { name: 'Panadol Advance 500mg', category: 'مسكنات ألم', purchasePrice: 1.5, sellingPrice: 2.25, stock: 150, supplier: 'GSK' },
  { name: 'Amoxil 500mg', category: 'مضادات حيوية', purchasePrice: 3.2, sellingPrice: 5.0, stock: 45, supplier: 'Hikma Pharmaceuticals' },
  { name: 'Brufen 400mg', category: 'مسكنات ألم ومضادات التهاب', purchasePrice: 2.1, sellingPrice: 3.5, stock: 200, supplier: 'Abbott' },
  { name: 'Zyrtec 10mg', category: 'مضادات الهيستامين (حساسية)', purchasePrice: 4.0, sellingPrice: 6.5, stock: 30, supplier: 'UCB' },
  { name: 'Concor 5mg', category: 'أدوية الضغط والقلب', purchasePrice: 5.5, sellingPrice: 7.8, stock: 120, supplier: 'Merck' },
  { name: 'Lipitor 20mg', category: 'خافض للكوليسترول', purchasePrice: 8.0, sellingPrice: 12.0, stock: 60, supplier: 'Pfizer' },
  { name: 'Nexium 40mg', category: 'أدوية المعدة (حموضة)', purchasePrice: 7.2, sellingPrice: 10.5, stock: 80, supplier: 'AstraZeneca' },
  { name: 'Glucophage 500mg', category: 'أدوية السكري', purchasePrice: 2.5, sellingPrice: 4.0, stock: 300, supplier: 'Merck' },
  { name: 'CeraVe Hydrating Cleanser 236ml', category: 'مستحضرات عناية بالبشرة', purchasePrice: 12.0, sellingPrice: 18.5, stock: 25, supplier: 'L\'Oréal' },
  { name: 'Vichy Dercos Anti-Dandruff Shampoo', category: 'عناية بالشعر', purchasePrice: 10.5, sellingPrice: 15.0, stock: 15, supplier: 'L\'Oréal' },
  { name: 'Optrex Eye Drops 10ml', category: 'قطرات عين', purchasePrice: 3.0, sellingPrice: 4.5, stock: 40, supplier: 'Reckitt' },
  { name: 'Voltaren Emulgel 50g', category: 'مسكنات موضعية', purchasePrice: 4.2, sellingPrice: 6.0, stock: 90, supplier: 'Novartis' },
  { name: 'Centrum Adults Multivitamin (30 tabs)', category: 'فيتامينات ومكملات غذائية', purchasePrice: 9.0, sellingPrice: 14.0, stock: 50, supplier: 'GSK' },
  { name: 'Vitamin D3 50,000 IU', category: 'فيتامينات ومكملات غذائية', purchasePrice: 5.0, sellingPrice: 8.0, stock: 110, supplier: 'Dar Al Dawa' },
  { name: 'Eltroxin 100mcg', category: 'هرمونات الغدة الدرقية', purchasePrice: 3.5, sellingPrice: 5.2, stock: 75, supplier: 'Aspen' },
];

async function seed() {
  console.log('Starting seed process...');

  // Get the specific user with email
  const pharmacyUser = await prisma.user.findUnique({
    where: { email: 'aasammhadany@gmail.com' }
  });

  if (!pharmacyUser) {
    console.error('No pharmacy user found. Please create one from the UI first.');
    return;
  }

  console.log(`Found pharmacy user: ${pharmacyUser.name} (ID: ${pharmacyUser.id})`);

  for (const item of medications) {
    const barcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    
    await prisma.pharmacyInventory.create({
      data: {
        pharmacyId: pharmacyUser.id,
        name: item.name,
        category: item.category,
        purchasePrice: item.purchasePrice,
        sellingPrice: item.sellingPrice,
        stock: item.stock,
        supplier: item.supplier,
        barcode: barcode,
      }
    });
    console.log(`Added: ${item.name}`);
  }

  console.log('Seeding completed successfully!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
