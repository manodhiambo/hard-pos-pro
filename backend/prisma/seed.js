/**
 * Database Seeder
 * Helvino Technologies Limited
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default branch
  const mainBranch = await prisma.branch.upsert({
    where: { branchCode: 'MAIN' },
    update: {},
    create: {
      branchCode: 'MAIN',
      branchName: 'Main Branch',
      address: 'Nairobi, Kenya',
      city: 'Nairobi',
      phone: '0703445756',
      email: 'helvinotechltd@gmail.com',
      isMainBranch: true,
      isActive: true,
    },
  });
  console.log('✅ Created main branch');

  // Create roles
  const superAdminRole = await prisma.role.upsert({
    where: { roleName: 'Super Admin' },
    update: {},
    create: {
      roleName: 'Super Admin',
      description: 'Full system access',
      permissions: ['all'],
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { roleName: 'Branch Manager' },
    update: {},
    create: {
      roleName: 'Branch Manager',
      description: 'Branch management access',
      permissions: ['sales', 'inventory', 'reports', 'users'],
    },
  });

  const salesRole = await prisma.role.upsert({
    where: { roleName: 'Sales Counter' },
    update: {},
    create: {
      roleName: 'Sales Counter',
      description: 'POS and sales access',
      permissions: ['sales', 'customers'],
    },
  });

  const warehouseRole = await prisma.role.upsert({
    where: { roleName: 'Warehouse Staff' },
    update: {},
    create: {
      roleName: 'Warehouse Staff',
      description: 'Inventory management',
      permissions: ['inventory', 'receiving', 'transfers'],
    },
  });

  console.log('✅ Created roles');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@hardpos.com',
      passwordHash: hashedPassword,
      fullName: 'System Administrator',
      phone: '0703445756',
      roleId: superAdminRole.id,
      branchId: mainBranch.id,
      isActive: true,
    },
  });
  console.log('✅ Created admin user (username: admin, password: admin123)');

  // Create sample units of measure
  const units = [
    { unitCode: 'PCS', unitName: 'Pieces', unitType: 'piece', baseUnit: 'PCS', conversionFactor: 1.0 },
    { unitCode: 'M', unitName: 'Meters', unitType: 'length', baseUnit: 'M', conversionFactor: 1.0 },
    { unitCode: 'KG', unitName: 'Kilograms', unitType: 'weight', baseUnit: 'KG', conversionFactor: 1.0 },
    { unitCode: 'L', unitName: 'Liters', unitType: 'volume', baseUnit: 'L', conversionFactor: 1.0 },
    { unitCode: 'SQM', unitName: 'Square Meters', unitType: 'area', baseUnit: 'SQM', conversionFactor: 1.0 },
    { unitCode: 'BAG', unitName: 'Bag', unitType: 'package', baseUnit: 'PCS', conversionFactor: 1.0 },
  ];

  for (const unit of units) {
    await prisma.unitOfMeasure.upsert({
      where: { unitCode: unit.unitCode },
      update: {},
      create: unit,
    });
  }
  console.log('✅ Created units of measure');

  // Create categories
  const categories = [
    { categoryCode: 'BUILD', categoryName: 'Building Materials', description: 'Cement, steel, timber, roofing' },
    { categoryCode: 'PLUMB', categoryName: 'Plumbing', description: 'Pipes, fittings, fixtures, pumps' },
    { categoryCode: 'ELEC', categoryName: 'Electrical', description: 'Cables, switches, conduits, panels' },
    { categoryCode: 'TOOLS', categoryName: 'Tools', description: 'Power tools, hand tools, machinery' },
    { categoryCode: 'HARD', categoryName: 'Hardware', description: 'Nails, screws, hinges, locks' },
    { categoryCode: 'PAINT', categoryName: 'Paint & Coatings', description: 'Paints, thinners, brushes' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { categoryCode: category.categoryCode },
      update: {},
      create: category,
    });
  }
  console.log('✅ Created categories');

  // Create expense categories
  const expenseCategories = [
    { categoryName: 'Fuel', description: 'Delivery vehicle fuel' },
    { categoryName: 'Vehicle Maintenance', description: 'Truck and delivery vehicle maintenance' },
    { categoryName: 'Utilities', description: 'Electricity, water, internet' },
    { categoryName: 'Rent', description: 'Store and warehouse rent' },
    { categoryName: 'Salaries', description: 'Staff salaries and wages' },
  ];

  for (const expCat of expenseCategories) {
    await prisma.expenseCategory.upsert({
      where: { categoryName: expCat.categoryName },
      update: {},
      create: expCat,
    });
  }
  console.log('✅ Created expense categories');

  // Create storage location
  const mainWarehouse = await prisma.storageLocation.create({
    data: {
      branchId: mainBranch.id,
      locationCode: 'WH-MAIN',
      locationName: 'Main Warehouse',
      locationType: 'warehouse',
      isActive: true,
    },
  });
  console.log('✅ Created storage location');

  // Create cash register
  await prisma.cashRegister.create({
    data: {
      registerCode: 'REG-001',
      registerName: 'Main Counter',
      branchId: mainBranch.id,
      location: 'Front Counter',
      isActive: true,
    },
  });
  console.log('✅ Created cash register');

  // Create system settings
  const settings = [
    { settingKey: 'company_name', settingValue: 'Hardware Store', settingType: 'string', description: 'Company Name' },
    { settingKey: 'tax_rate', settingValue: '16', settingType: 'number', description: 'Default VAT Rate' },
    { settingKey: 'currency', settingValue: 'KES', settingType: 'string', description: 'Currency Code' },
    { settingKey: 'low_stock_threshold', settingValue: '10', settingType: 'number', description: 'Low Stock Alert' },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { settingKey: setting.settingKey },
      update: {},
      create: setting,
    });
  }
  console.log('✅ Created system settings');

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📝 Default Admin Credentials:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('');
  console.log('⚠️  Please change the default password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
