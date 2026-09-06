import bcrypt from 'bcryptjs';
import {
  Prisma,
  Role,
  CustomerTier,
  ProductCategory,
  QuoteStatus,
  ApprovalStatus,
  OrderStatus,
  FulfillmentStatus,
  BillingFrequency,
  InvoiceType,
  InvoiceStatus,
  SubscriptionStatus,
  AlertType,
  AlertSeverity,
} from '@prisma/client';
import { prisma } from '../config/database';

export const seedLargeDataset = async (): Promise<void> => {
  console.log('🚀 Starting Enterprise Large Dataset Seeding (200+ Quotations, 40 Customers, Downstream Orders & Alerts)...');
  const startTime = Date.now();

  // ==========================================
  // 1. Ensure Sales Rep & Approver Personas
  // ==========================================
  console.log('1️⃣  Ensuring Sales Reps & Operations Users...');
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('DealOrbit@123', salt);

  const repsData = [
    {
      email: 'sales.rep@dealorbit.io',
      name: 'Sarah Jenkins',
      role: Role.SALES_REP,
      historicalAvgDiscount: 8.5,
    },
    {
      email: 'sam.seller@dealorbit.io',
      name: 'Sam Seller',
      role: Role.SALES_REP,
      historicalAvgDiscount: 12.0,
    },
    {
      email: 'rachel.green@dealorbit.io',
      name: 'Rachel Green',
      role: Role.SALES_REP,
      historicalAvgDiscount: 6.5,
    },
    {
      email: 'sales.manager@dealorbit.io',
      name: 'Marcus Vance',
      role: Role.SALES_MANAGER,
      historicalAvgDiscount: 14.2,
    },
    {
      email: 'finance.ops@dealorbit.io',
      name: 'Elena Rostova',
      role: Role.FINANCE_OPS,
      historicalAvgDiscount: 0.0,
    },
    {
      email: 'admin@dealorbit.io',
      name: 'Alex Rivera',
      role: Role.ADMIN,
      historicalAvgDiscount: 0.0,
    },
  ];

  const salesReps: { id: string; name: string; email: string; avgDiscount: number }[] = [];
  let salesManagerId = '';
  let financeOpsId = '';

  for (const u of repsData) {
    const record = await prisma.user.upsert({
      where: { email: u.email.toLowerCase() },
      update: {
        name: u.name,
        role: u.role,
        isActive: true,
        historicalAvgDiscount: new Prisma.Decimal(u.historicalAvgDiscount),
      },
      create: {
        email: u.email.toLowerCase(),
        name: u.name,
        role: u.role,
        passwordHash: defaultPasswordHash,
        isActive: true,
        historicalAvgDiscount: new Prisma.Decimal(u.historicalAvgDiscount),
      },
    });

    if (u.role === Role.SALES_REP) {
      salesReps.push({
        id: record.id,
        name: record.name,
        email: record.email,
        avgDiscount: u.historicalAvgDiscount,
      });
    } else if (u.role === Role.SALES_MANAGER) {
      salesManagerId = record.id;
    } else if (u.role === Role.FINANCE_OPS) {
      financeOpsId = record.id;
    }
  }
  console.log(`   ✓ ${salesReps.length} Sales Reps & Operations Users ready.`);

  // ==========================================
  // 2. Ensure Categories & Regional Warehouses
  // ==========================================
  console.log('2️⃣  Ensuring Product Categories & Regional Warehouses...');
  const catHardware = await prisma.category.upsert({
    where: { name: ProductCategory.HARDWARE },
    update: { defaultCeilingDiscount: new Prisma.Decimal(15.0) },
    create: {
      name: ProductCategory.HARDWARE,
      description: 'Physical computing hardware, enterprise laptops, docking stations, server nodes',
      defaultCeilingDiscount: new Prisma.Decimal(15.0),
    },
  });

  const catSoftware = await prisma.category.upsert({
    where: { name: ProductCategory.SOFTWARE },
    update: { defaultCeilingDiscount: new Prisma.Decimal(20.0) },
    create: {
      name: ProductCategory.SOFTWARE,
      description: 'Enterprise software licenses, SaaS subscriptions, and cloud tools',
      defaultCeilingDiscount: new Prisma.Decimal(20.0),
    },
  });

  const catServices = await prisma.category.upsert({
    where: { name: ProductCategory.SERVICES },
    update: { defaultCeilingDiscount: new Prisma.Decimal(10.0) },
    create: {
      name: ProductCategory.SERVICES,
      description: 'Professional consulting, on-site deployment, architecture audits, and SLAs',
      defaultCeilingDiscount: new Prisma.Decimal(10.0),
    },
  });

  const warehousesData = [
    { code: 'WH-BOM-01', name: 'Main Central Hub (Mumbai)', address: 'Bhiwandi Logistics Park, Mumbai, MH', priority: 1, weight: 1.0 },
    { code: 'WH-CCU-02', name: 'East Regional Depot (Kolkata)', address: 'Dankuni Industrial Estate, Kolkata, WB', priority: 2, weight: 1.3 },
    { code: 'WH-AMD-03', name: 'West Regional Hub (Ahmedabad)', address: 'Changodar Logistics Cluster, Ahmedabad, GJ', priority: 3, weight: 1.15 },
  ];

  const warehouses: { id: string; code: string }[] = [];
  for (const wh of warehousesData) {
    const record = await prisma.warehouse.upsert({
      where: { code: wh.code },
      update: { name: wh.name, address: wh.address, priorityOrder: wh.priority, shippingCostWeight: new Prisma.Decimal(wh.weight), isActive: true },
      create: { code: wh.code, name: wh.name, address: wh.address, priorityOrder: wh.priority, shippingCostWeight: new Prisma.Decimal(wh.weight), isActive: true },
    });
    warehouses.push({ id: record.id, code: record.code });
  }

  // ==========================================
  // 3. Ensure Expanded Product Catalog (30 Products)
  // ==========================================
  console.log('3️⃣  Ensuring Product Catalog (Hardware, Software, Services)...');
  const catalogDefinitions = [
    // Hardware
    { sku: 'HW-LAPTOP-16', name: 'Enterprise Pro Laptop 16" (M3 Max / 64GB / 1TB)', catId: catHardware.id, price: 85000, cost: 65000, unit: 'Unit', minMargin: 18, rec: false },
    { sku: 'HW-DOCK-01', name: 'Pro Thunderbolt 4 Dual-Display Docking Station', catId: catHardware.id, price: 18000, cost: 11000, unit: 'Unit', minMargin: 15, rec: false },
    { sku: 'HW-SERVER-2U', name: 'Dual-Socket Enterprise Rack Server 2U (128-Core / 512GB)', catId: catHardware.id, price: 340000, cost: 260000, unit: 'Server', minMargin: 20, rec: false },
    { sku: 'HW-SWITCH-48', name: '48-Port Layer 3 Managed 100GbE Spine-Leaf Switch', catId: catHardware.id, price: 145000, cost: 98000, unit: 'Switch', minMargin: 18, rec: false },
    { sku: 'HW-SAN-STORAGE', name: 'All-Flash NVMe SAN Storage Array 64TB', catId: catHardware.id, price: 580000, cost: 420000, unit: 'Array', minMargin: 22, rec: false },
    { sku: 'HW-GPU-HGX', name: 'Enterprise AI GPU Compute Node (8x H100 SXM5 / 640GB)', catId: catHardware.id, price: 850000, cost: 710000, unit: 'Node', minMargin: 16, rec: false },
    { sku: 'HW-MONITOR-4K', name: 'Ultra-Wide 38" Curved Color-Calibrated Display', catId: catHardware.id, price: 62000, cost: 44000, unit: 'Unit', minMargin: 15, rec: false },
    { sku: 'HW-UPS-10KVA', name: 'High-Density Smart Online Rack UPS 10kVA', catId: catHardware.id, price: 115000, cost: 78000, unit: 'Unit', minMargin: 18, rec: false },

    // Software
    { sku: 'SW-SEC-01', name: 'Cloud Security Suite & Zero-Trust Access Gateway', catId: catSoftware.id, price: 45000, cost: 22000, unit: 'License/Yr', minMargin: 20, rec: true },
    { sku: 'SW-DB-02', name: 'Enterprise Database Managed HA Cluster License', catId: catSoftware.id, price: 95000, cost: 50000, unit: 'Cluster/Mo', minMargin: 20, rec: true },
    { sku: 'SW-AI-COPILOT', name: 'DealOrbit AI Copilot Seat (Billed Annually)', catId: catSoftware.id, price: 28000, cost: 12000, unit: 'Seat/Yr', minMargin: 25, rec: true },
    { sku: 'SW-SIEM-SUITE', name: 'Real-Time Telemetry & Next-Gen SIEM Collector', catId: catSoftware.id, price: 72000, cost: 34000, unit: 'Tenant/Mo', minMargin: 22, rec: true },
    { sku: 'SW-K8S-MGMT', name: 'Hybrid Multi-Cloud Kubernetes Orchestration Tier', catId: catSoftware.id, price: 125000, cost: 60000, unit: 'Cluster/Yr', minMargin: 24, rec: true },
    { sku: 'SW-BACKUP-DR', name: 'Enterprise Automated Disaster Recovery & Snapshot Agent', catId: catSoftware.id, price: 38000, cost: 18000, unit: 'Node/Yr', minMargin: 20, rec: true },

    // Services
    { sku: 'SRV-DEPLOY-ONSITE', name: 'On-Site Hardware Deployment & Turnkey Provisioning', catId: catServices.id, price: 120000, cost: 85000, unit: 'Engagement', minMargin: 15, rec: false },
    { sku: 'SRV-TAM-01', name: '24/7 Dedicated Technical Account Manager Support SLA', catId: catServices.id, price: 150000, cost: 90000, unit: 'Contract/Mo', minMargin: 25, rec: true },
    { sku: 'SRV-ARCH-AUDIT', name: 'Zero-Trust Architecture & Threat Surface Audit', catId: catServices.id, price: 210000, cost: 135000, unit: 'Audit', minMargin: 20, rec: false },
    { sku: 'SRV-AI-DEPL', name: 'Custom AI Cluster Tuning & Model Fine-Tuning Eng', catId: catServices.id, price: 320000, cost: 210000, unit: 'Engagement', minMargin: 20, rec: false },
    { sku: 'SRV-SLA-PLATINUM', name: 'Mission-Critical 15-Minute Response Platinum SLA', catId: catServices.id, price: 400000, cost: 280000, unit: 'Annual SLA', minMargin: 26, rec: true },
    { sku: 'SRV-MIGRATE-CLOUD', name: 'Legacy Datacenter to Cloud Migration Engineering', catId: catServices.id, price: 275000, cost: 180000, unit: 'Project', minMargin: 22, rec: false },
  ];

  const products: Array<{
    id: string;
    sku: string;
    name: string;
    categoryId: string;
    category: ProductCategory;
    basePrice: number;
    costPrice: number;
    unit: string;
    taxRate: number;
    isRecurring: boolean;
  }> = [];

  for (const p of catalogDefinitions) {
    const record = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        categoryId: p.catId,
        basePrice: new Prisma.Decimal(p.price),
        costPrice: new Prisma.Decimal(p.cost),
        unit: p.unit,
        minMarginThreshold: new Prisma.Decimal(p.minMargin),
        isRecurringDefault: p.rec,
        defaultBillingCycle: p.rec ? BillingFrequency.MONTHLY : BillingFrequency.ONE_TIME,
        isActive: true,
      },
      create: {
        sku: p.sku,
        name: p.name,
        categoryId: p.catId,
        basePrice: new Prisma.Decimal(p.price),
        costPrice: new Prisma.Decimal(p.cost),
        unit: p.unit,
        minMarginThreshold: new Prisma.Decimal(p.minMargin),
        isRecurringDefault: p.rec,
        defaultBillingCycle: p.rec ? BillingFrequency.MONTHLY : BillingFrequency.ONE_TIME,
        isActive: true,
      },
    });

    const categoryEnum =
      p.catId === catHardware.id
        ? ProductCategory.HARDWARE
        : p.catId === catSoftware.id
        ? ProductCategory.SOFTWARE
        : ProductCategory.SERVICES;

    products.push({
      id: record.id,
      sku: record.sku,
      name: record.name,
      categoryId: record.categoryId,
      category: categoryEnum,
      basePrice: p.price,
      costPrice: p.cost,
      unit: record.unit,
      taxRate: 18.0,
      isRecurring: p.rec,
    });

    // Ensure warehouse stock for physical products
    if (categoryEnum === ProductCategory.HARDWARE) {
      for (const wh of warehouses) {
        await prisma.warehouseStock.upsert({
          where: { warehouseId_productId: { warehouseId: wh.id, productId: record.id } },
          update: { onHandQuantity: 120, reservedQuantity: 20, reorderThreshold: 15 },
          create: { warehouseId: wh.id, productId: record.id, onHandQuantity: 120, reservedQuantity: 20, reorderThreshold: 15 },
        });
      }
    }
  }
  console.log(`   ✓ ${products.length} Products configured with multi-warehouse inventory.`);

  // ==========================================
  // 4. Ensure 40 Enterprise B2B Customers
  // ==========================================
  console.log('4️⃣  Ensuring 40 Enterprise B2B Customers with Negotiation Profiles...');
  const customerDefinitions: Array<{
    code: string;
    name: string;
    tier: CustomerTier;
    terms: string;
    email: string;
    phone: string;
    sensitivity: string;
    minDisc: number;
    maxDisc: number;
    serviceAffinity: number;
  }> = [
    // Bronze (Base ceiling 5%)
    { code: 'CUST-OSCORP', name: 'Oscorp Industries', tier: CustomerTier.BRONZE, terms: 'Net 15', email: 'procure@oscorp.org', phone: '+91 9820011001', sensitivity: 'HIGH', minDisc: 2, maxDisc: 5, serviceAffinity: 0.3 },
    { code: 'CUST-INITECH', name: 'Initech Solutions', tier: CustomerTier.BRONZE, terms: 'Net 30', email: 'bill@initech.com', phone: '+91 9820011002', sensitivity: 'HIGH', minDisc: 1, maxDisc: 4, serviceAffinity: 0.35 },
    { code: 'CUST-DUNDER', name: 'Dunder Mifflin Enterprise', tier: CustomerTier.BRONZE, terms: 'Net 15', email: 'orders@dundermifflin.com', phone: '+91 9820011003', sensitivity: 'HIGH', minDisc: 2, maxDisc: 5, serviceAffinity: 0.25 },
    { code: 'CUST-HOOLI', name: 'Hooli Cloud Systems', tier: CustomerTier.BRONZE, terms: 'Net 30', email: 'infra@hooli.xyz', phone: '+91 9820011004', sensitivity: 'MEDIUM', minDisc: 3, maxDisc: 6, serviceAffinity: 0.4 },
    { code: 'CUST-PIEDPIPER', name: 'Pied Piper Networks', tier: CustomerTier.BRONZE, terms: 'Net 30', email: 'richard@piedpiper.io', phone: '+91 9820011005', sensitivity: 'HIGH', minDisc: 2, maxDisc: 5, serviceAffinity: 0.45 },
    { code: 'CUST-SOYLENT', name: 'Soylent Computing', tier: CustomerTier.BRONZE, terms: 'Net 15', email: 'procurement@soylent.org', phone: '+91 9820011006', sensitivity: 'HIGH', minDisc: 1, maxDisc: 4, serviceAffinity: 0.3 },
    { code: 'CUST-MASSIVEDYN', name: 'Massive Dynamic Corp', tier: CustomerTier.BRONZE, terms: 'Net 30', email: 'tech@massivedynamic.com', phone: '+91 9820011007', sensitivity: 'MEDIUM', minDisc: 3, maxDisc: 5, serviceAffinity: 0.5 },
    { code: 'CUST-UMBRELLA', name: 'Umbrella IT Solutions', tier: CustomerTier.BRONZE, terms: 'Net 15', email: 'itops@umbrellacorp.io', phone: '+91 9820011008', sensitivity: 'HIGH', minDisc: 2, maxDisc: 5, serviceAffinity: 0.35 },
    { code: 'CUST-TYRELL', name: 'Tyrell Robotics Systems', tier: CustomerTier.BRONZE, terms: 'Net 30', email: 'hardware@tyrell.corp', phone: '+91 9820011009', sensitivity: 'MEDIUM', minDisc: 2, maxDisc: 5, serviceAffinity: 0.4 },
    { code: 'CUST-GLOBEX', name: 'Globex Corporation', tier: CustomerTier.BRONZE, terms: 'Net 30', email: 'hank@globex.org', phone: '+91 9820011010', sensitivity: 'HIGH', minDisc: 2, maxDisc: 5, serviceAffinity: 0.3 },

    // Silver (Base ceiling 10%)
    { code: 'CUST-CYBER', name: 'Cyberdyne Systems', tier: CustomerTier.SILVER, terms: 'Net 30', email: 'procure@cyberdyne.io', phone: '+91 9820022001', sensitivity: 'HIGH', minDisc: 4, maxDisc: 10, serviceAffinity: 0.45 },
    { code: 'CUST-BETA', name: 'Beta Technologies', tier: CustomerTier.SILVER, terms: 'Net 30', email: 'ops@betatech.io', phone: '+91 9820022002', sensitivity: 'MEDIUM', minDisc: 5, maxDisc: 9, serviceAffinity: 0.55 },
    { code: 'CUST-OMNI', name: 'Omni Consumer Products (OCP)', tier: CustomerTier.SILVER, terms: 'Net 45', email: 'b2b@ocp.com', phone: '+91 9820022003', sensitivity: 'MEDIUM', minDisc: 5, maxDisc: 10, serviceAffinity: 0.5 },
    { code: 'CUST-APERTURE', name: 'Aperture Science Systems', tier: CustomerTier.SILVER, terms: 'Net 30', email: 'glados@aperture.lab', phone: '+91 9820022004', sensitivity: 'LOW', minDisc: 4, maxDisc: 8, serviceAffinity: 0.65 },
    { code: 'CUST-NAKAMURA', name: 'Nakamura BioTech', tier: CustomerTier.SILVER, terms: 'Net 30', email: 'supply@nakamura.jp', phone: '+91 9820022005', sensitivity: 'MEDIUM', minDisc: 5, maxDisc: 10, serviceAffinity: 0.6 },
    { code: 'CUST-SYNAPSE', name: 'Synapse Pharma Networks', tier: CustomerTier.SILVER, terms: 'Net 45', email: 'procure@synapsepharma.com', phone: '+91 9820022006', sensitivity: 'HIGH', minDisc: 6, maxDisc: 10, serviceAffinity: 0.5 },
    { code: 'CUST-BIOGEN', name: 'BioGen Global Labs', tier: CustomerTier.SILVER, terms: 'Net 30', email: 'orders@biogenglobal.com', phone: '+91 9820022007', sensitivity: 'MEDIUM', minDisc: 5, maxDisc: 9, serviceAffinity: 0.7 },
    { code: 'CUST-ZENITH-LIFE', name: 'Zenith Life Sciences', tier: CustomerTier.SILVER, terms: 'Net 30', email: 'purchasing@zenithlife.io', phone: '+91 9820022008', sensitivity: 'HIGH', minDisc: 4, maxDisc: 10, serviceAffinity: 0.45 },
    { code: 'CUST-VANGUARD-MED', name: 'Vanguard Medical Devices', tier: CustomerTier.SILVER, terms: 'Net 30', email: 'hospital.b2b@vanguardmed.com', phone: '+91 9820022009', sensitivity: 'MEDIUM', minDisc: 5, maxDisc: 10, serviceAffinity: 0.65 },
    { code: 'CUST-BEACON', name: 'Beacon Financial Holdings', tier: CustomerTier.SILVER, terms: 'Net 45', email: 'itprocure@beaconholdings.com', phone: '+91 9820022010', sensitivity: 'MEDIUM', minDisc: 6, maxDisc: 10, serviceAffinity: 0.55 },

    // Gold (Base ceiling 15%, Services 10%)
    { code: 'CUST-ACME', name: 'Acme Corp', tier: CustomerTier.GOLD, terms: 'Net 30', email: 'customer.acme@dealorbit.io', phone: '+91 9820033001', sensitivity: 'HIGH', minDisc: 8, maxDisc: 15, serviceAffinity: 0.75 },
    { code: 'CUST-NEXUS-HEALTH', name: 'Nexus Healthcare Systems', tier: CustomerTier.GOLD, terms: 'Net 30', email: 'procurement@nexushealth.org', phone: '+91 9820033002', sensitivity: 'MEDIUM', minDisc: 7, maxDisc: 14, serviceAffinity: 0.8 },
    { code: 'CUST-APEX-HEALTH', name: 'Apex Health Diagnostics', tier: CustomerTier.GOLD, terms: 'Net 30', email: 'devices@apexhealth.in', phone: '+91 9820033003', sensitivity: 'MEDIUM', minDisc: 8, maxDisc: 15, serviceAffinity: 0.7 },
    { code: 'CUST-STERLING-FIN', name: 'Sterling Mutual Financial', tier: CustomerTier.GOLD, terms: 'Net 45', email: 'enterprise@sterlingfin.com', phone: '+91 9820033004', sensitivity: 'LOW', minDisc: 6, maxDisc: 12, serviceAffinity: 0.85 },
    { code: 'CUST-TITAN-ASSET', name: 'Titan Asset Management', tier: CustomerTier.GOLD, terms: 'Net 45', email: 'infra@titanasset.com', phone: '+91 9820033005', sensitivity: 'MEDIUM', minDisc: 7, maxDisc: 14, serviceAffinity: 0.75 },
    { code: 'CUST-AEGIS-WEALTH', name: 'Aegis Private Wealth', tier: CustomerTier.GOLD, terms: 'Net 30', email: 'secops@aegiswealth.co', phone: '+91 9820033006', sensitivity: 'LOW', minDisc: 5, maxDisc: 12, serviceAffinity: 0.9 },
    { code: 'CUST-HORIZON-BANK', name: 'Horizon Commerce Bank', tier: CustomerTier.GOLD, terms: 'Net 60', email: 'procurement@horizonbank.io', phone: '+91 9820033007', sensitivity: 'MEDIUM', minDisc: 8, maxDisc: 15, serviceAffinity: 0.8 },
    { code: 'CUST-ATLAS-LOG', name: 'Atlas Logistics Freight', tier: CustomerTier.GOLD, terms: 'Net 30', email: 'supply@atlaslogistics.com', phone: '+91 9820033008', sensitivity: 'HIGH', minDisc: 9, maxDisc: 15, serviceAffinity: 0.65 },
    { code: 'CUST-ZENITH-ENG', name: 'Zenith Heavy Engineering', tier: CustomerTier.GOLD, terms: 'Net 45', email: 'b2b@zenitheng.com', phone: '+91 9820033009', sensitivity: 'MEDIUM', minDisc: 7, maxDisc: 14, serviceAffinity: 0.7 },
    { code: 'CUST-ORION-AUTO', name: 'Orion Advanced Automations', tier: CustomerTier.GOLD, terms: 'Net 30', email: 'orders@orionauto.tech', phone: '+91 9820033010', sensitivity: 'LOW', minDisc: 6, maxDisc: 13, serviceAffinity: 0.85 },

    // Enterprise (Base ceiling 20%, Hardware 15%, Services 10%)
    { code: 'CUST-STARK', name: 'Stark Enterprises', tier: CustomerTier.ENTERPRISE, terms: 'Net 60', email: 'procurement@starkenterprises.com', phone: '+91 9820044001', sensitivity: 'MEDIUM', minDisc: 10, maxDisc: 20, serviceAffinity: 0.95 },
    { code: 'CUST-WAYNE', name: 'Wayne Enterprises', tier: CustomerTier.ENTERPRISE, terms: 'Net 45', email: 'supply@waynecorp.com', phone: '+91 9820044002', sensitivity: 'LOW', minDisc: 8, maxDisc: 18, serviceAffinity: 0.85 },
    { code: 'CUST-TITANIUM-AERO', name: 'Titanium Global Aerospace', tier: CustomerTier.ENTERPRISE, terms: 'Net 60', email: 'defense@titaniumaero.com', phone: '+91 9820044003', sensitivity: 'LOW', minDisc: 8, maxDisc: 20, serviceAffinity: 0.9 },
    { code: 'CUST-COBALT-GRID', name: 'Cobalt Energy Grid', tier: CustomerTier.ENTERPRISE, terms: 'Net 60', email: 'scada@cobaltenergy.org', phone: '+91 9820044004', sensitivity: 'MEDIUM', minDisc: 10, maxDisc: 20, serviceAffinity: 0.8 },
    { code: 'CUST-APEX-SEMI', name: 'Apex Semiconductor Foundry', tier: CustomerTier.ENTERPRISE, terms: 'Net 45', email: 'cleanroom@apexsemi.com', phone: '+91 9820044005', sensitivity: 'LOW', minDisc: 9, maxDisc: 18, serviceAffinity: 0.9 },
    { code: 'CUST-NOVARTIS-IND', name: 'Novartis Informatics India', tier: CustomerTier.ENTERPRISE, terms: 'Net 60', email: 'global.procure@novartis.com', phone: '+91 9820044006', sensitivity: 'MEDIUM', minDisc: 10, maxDisc: 20, serviceAffinity: 0.85 },
    { code: 'CUST-VANGUARD-CAP', name: 'Vanguard Global Capital', tier: CustomerTier.ENTERPRISE, terms: 'Net 60', email: 'fintech@vanguardcap.com', phone: '+91 9820044007', sensitivity: 'LOW', minDisc: 8, maxDisc: 19, serviceAffinity: 0.9 },
    { code: 'CUST-WAYNETECH', name: 'WayneTech Digital Labs', tier: CustomerTier.ENTERPRISE, terms: 'Net 45', email: 'labs@waynetech.com', phone: '+91 9820044008', sensitivity: 'LOW', minDisc: 9, maxDisc: 20, serviceAffinity: 0.92 },
    { code: 'CUST-STARK-AI', name: 'Stark Cloud AI Foundation', tier: CustomerTier.ENTERPRISE, terms: 'Net 60', email: 'friday@starkcloud.io', phone: '+91 9820044009', sensitivity: 'LOW', minDisc: 10, maxDisc: 20, serviceAffinity: 0.98 },
    { code: 'CUST-ASTRA-CARE', name: 'Astra Care Diagnostics', tier: CustomerTier.ENTERPRISE, terms: 'Net 60', email: 'pathology@astracare.org', phone: '+91 9820044010', sensitivity: 'MEDIUM', minDisc: 8, maxDisc: 18, serviceAffinity: 0.88 },
  ];

  const customers: Array<{ id: string; code: string; name: string; tier: CustomerTier; paymentTerms: string }> = [];

  for (const c of customerDefinitions) {
    const record = await prisma.customer.upsert({
      where: { code: c.code },
      update: {
        name: c.name,
        tier: c.tier,
        paymentTerms: c.terms,
        contactEmail: c.email,
        contactPhone: c.phone,
        isActive: true,
      },
      create: {
        code: c.code,
        name: c.name,
        tier: c.tier,
        paymentTerms: c.terms,
        contactEmail: c.email,
        contactPhone: c.phone,
        isActive: true,
      },
    });

    await prisma.customerNegotiationProfile.upsert({
      where: { customerId: record.id },
      update: {
        priceSensitivity: c.sensitivity,
        historicalMinDiscount: new Prisma.Decimal(c.minDisc),
        historicalMaxDiscount: new Prisma.Decimal(c.maxDisc),
        serviceAffinity: new Prisma.Decimal(c.serviceAffinity),
        paymentTermElasticity: c.tier === CustomerTier.ENTERPRISE ? 'LOW' : 'MEDIUM',
        averageResponseDays: c.tier === CustomerTier.ENTERPRISE ? 3 : 5,
        notes: `Enterprise portfolio account. Standard SLA corridor with ${c.tier} discount preference.`,
      },
      create: {
        customerId: record.id,
        priceSensitivity: c.sensitivity,
        historicalMinDiscount: new Prisma.Decimal(c.minDisc),
        historicalMaxDiscount: new Prisma.Decimal(c.maxDisc),
        serviceAffinity: new Prisma.Decimal(c.serviceAffinity),
        paymentTermElasticity: c.tier === CustomerTier.ENTERPRISE ? 'LOW' : 'MEDIUM',
        averageResponseDays: c.tier === CustomerTier.ENTERPRISE ? 3 : 5,
        notes: `Enterprise portfolio account. Standard SLA corridor with ${c.tier} discount preference.`,
      },
    });

    customers.push({
      id: record.id,
      code: record.code,
      name: record.name,
      tier: record.tier,
      paymentTerms: record.paymentTerms,
    });
  }
  console.log(`   ✓ ${customers.length} B2B Enterprise Customers ready with negotiation profiles.`);

  // ==========================================
  // 5. Generate 220 Living Quotations & Downstream Orders
  // ==========================================
  console.log('5️⃣  Generating 220 Living Quotations with Life-Cycle Statuses...');

  // Helper for effective ceiling
  const getCeiling = (tier: CustomerTier, cat: ProductCategory): number => {
    if (cat === ProductCategory.SERVICES) return 10.0;
    if (tier === CustomerTier.BRONZE) return 5.0;
    if (tier === CustomerTier.SILVER) return 10.0;
    if (tier === CustomerTier.GOLD) return 15.0;
    if (tier === CustomerTier.ENTERPRISE) return cat === ProductCategory.HARDWARE ? 15.0 : 20.0;
    return 10.0;
  };

  const statusDistribution: QuoteStatus[] = [
    // 35 Drafts
    ...Array(35).fill(QuoteStatus.DRAFT),
    // 45 In Review (triggering manager / finance approvals)
    ...Array(45).fill(QuoteStatus.IN_REVIEW),
    // 35 Customer Review
    ...Array(35).fill(QuoteStatus.CUSTOMER_REVIEW),
    // 20 Customer Negotiating
    ...Array(20).fill(QuoteStatus.NEGOTIATING),
    // 25 Approved (ready for customer)
    ...Array(25).fill(QuoteStatus.APPROVED),
    // 25 Accepted
    ...Array(25).fill(QuoteStatus.ACCEPTED),
    // 20 Converted to Order
    ...Array(20).fill(QuoteStatus.CONVERTED_TO_ORDER),
    // 12 Rejected
    ...Array(12).fill(QuoteStatus.REJECTED),
    // 5 Expired
    ...Array(5).fill(QuoteStatus.EXPIRED),
  ];

  let quoteCounter = 100;
  let orderCounter = 100;
  let shipmentCounter = 100;
  let invoiceCounter = 100;
  let subCounter = 100;
  let healthAlertCounter = 1;

  let totalQuotesCreated = 0;
  let totalOrdersCreated = 0;
  let totalSubscriptionsCreated = 0;
  let totalInvoicesCreated = 0;
  let totalAlertsCreated = 0;

  const now = Date.now();

  for (let i = 0; i < statusDistribution.length; i++) {
    quoteCounter++;
    const quoteNumber = `QT-2026-0${quoteCounter}`;
    const status = statusDistribution[i];

    // Pick customer & sales rep deterministically for reproducible runs
    const customer = customers[i % customers.length];
    const rep = salesReps[i % salesReps.length];

    // Distribute creation timestamps over past 80 days
    const daysAgo = Math.floor((i / statusDistribution.length) * 75) + (i % 5);
    const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    const expiresAt = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    const portalTokenExpiresAt = new Date(createdAt.getTime() + 45 * 24 * 60 * 60 * 1000);
    const portalToken = `portal-tok-${quoteCounter}-${customer.code.toLowerCase()}`;

    // Pick 1 to 3 products
    const lineCount = 1 + (i % 3);
    const selectedProducts: typeof products = [];
    for (let l = 0; l < lineCount; l++) {
      const prodIndex = (i * 3 + l * 7) % products.length;
      if (!selectedProducts.find((sp) => sp.id === products[prodIndex].id)) {
        selectedProducts.push(products[prodIndex]);
      }
    }
    if (selectedProducts.length === 0) {
      selectedProducts.push(products[0]);
    }

    // Build line calculations
    let subtotalSum = 0;
    let discountSum = 0;
    let costSum = 0;
    let weightedOverageSum = 0;
    let totalDiscountPercentSum = 0;

    const linesPayload = selectedProducts.map((p, lineIdx) => {
      const quantity = 1 + ((i + lineIdx * 3) % 15);
      const unitPrice = p.basePrice;
      const unitCost = p.costPrice;
      const effectiveCeiling = getCeiling(customer.tier, p.category);

      // Determine discount %:
      // For ~40% of quotes (especially IN_REVIEW and NEGOTIATING), introduce intentional ceiling violations
      let discountPercent = 0.0;
      if (status === QuoteStatus.IN_REVIEW || status === QuoteStatus.NEGOTIATING) {
        // High discount with breach
        discountPercent = Number((effectiveCeiling + 2.0 + (i % 10) * 1.5).toFixed(1));
      } else if (status === QuoteStatus.DRAFT) {
        discountPercent = Number(((i % 8) * 1.5).toFixed(1));
      } else {
        // Safe discount within ceiling
        discountPercent = Number((Math.min(effectiveCeiling, 2.0 + (i % 6) * 2.0)).toFixed(1));
      }

      const isViolation = discountPercent > effectiveCeiling;
      const violationPoints = isViolation ? Number((discountPercent - effectiveCeiling).toFixed(2)) : 0.0;

      const lineGrossAmount = quantity * unitPrice;
      const lineDiscountAmount = lineGrossAmount * (discountPercent / 100.0);
      const netLinePrice = lineGrossAmount - lineDiscountAmount;
      const lineCostBasis = quantity * unitCost;
      const lineMarginPercent = netLinePrice > 0 ? ((netLinePrice - lineCostBasis) / netLinePrice) * 100.0 : 0.0;

      subtotalSum += lineGrossAmount;
      discountSum += lineDiscountAmount;
      costSum += lineCostBasis;
      totalDiscountPercentSum += discountPercent;

      return {
        productId: p.id,
        quantity,
        unitPrice: new Prisma.Decimal(unitPrice),
        unitCost: new Prisma.Decimal(unitCost),
        discountPercent: new Prisma.Decimal(discountPercent),
        effectiveCeiling: new Prisma.Decimal(effectiveCeiling),
        isViolation,
        violationPoints: new Prisma.Decimal(violationPoints),
        netLinePrice: new Prisma.Decimal(Number(netLinePrice.toFixed(2))),
        lineMarginPercent: new Prisma.Decimal(Number(lineMarginPercent.toFixed(2))),
        isRecurring: p.isRecurring,
        billingFrequency: p.isRecurring ? BillingFrequency.MONTHLY : BillingFrequency.ONE_TIME,
      };
    });

    const netAmount = subtotalSum - discountSum;
    const taxAmount = netAmount * 0.18;
    const grandTotal = netAmount + taxAmount;
    const dealMarginPercent = netAmount > 0 ? ((netAmount - costSum) / netAmount) * 100.0 : 0.0;

    // Calculate Blended Risk Score
    for (const l of linesPayload) {
      const weight = netAmount > 0 ? Number(l.netLinePrice) / netAmount : 1 / linesPayload.length;
      const overage = Math.max(0, Number(l.discountPercent) - Number(l.effectiveCeiling));
      weightedOverageSum += weight * overage;
    }
    const discountLeakageScore = 4.0 * weightedOverageSum;
    const marginPenalty = 25.0 * Math.max(0, 0.2 - dealMarginPercent / 100.0);
    const avgDisc = totalDiscountPercentSum / linesPayload.length;
    const repVolatility = Math.max(0, avgDisc - rep.avgDiscount);
    const rawRiskScore = discountLeakageScore + marginPenalty + 1.0 * repVolatility;
    const blendedRiskScore = Math.min(100.0, Math.max(0.0, Number(rawRiskScore.toFixed(2))));

    // Upsert quotation
    const quotation = await prisma.quotation.upsert({
      where: { quoteNumber },
      update: {
        customerId: customer.id,
        salesRepId: rep.id,
        status,
        paymentTerms: customer.paymentTerms,
        subtotalAmount: new Prisma.Decimal(Number(subtotalSum.toFixed(2))),
        totalDiscountAmount: new Prisma.Decimal(Number(discountSum.toFixed(2))),
        taxAmount: new Prisma.Decimal(Number(taxAmount.toFixed(2))),
        grandTotal: new Prisma.Decimal(Number(grandTotal.toFixed(2))),
        totalCostBasis: new Prisma.Decimal(Number(costSum.toFixed(2))),
        dealMarginPercent: new Prisma.Decimal(Number(dealMarginPercent.toFixed(2))),
        blendedRiskScore: new Prisma.Decimal(blendedRiskScore),
        expiresAt,
        portalToken,
        portalTokenExpiresAt,
        createdAt,
        updatedAt: createdAt,
      },
      create: {
        quoteNumber,
        customerId: customer.id,
        salesRepId: rep.id,
        status,
        paymentTerms: customer.paymentTerms,
        subtotalAmount: new Prisma.Decimal(Number(subtotalSum.toFixed(2))),
        totalDiscountAmount: new Prisma.Decimal(Number(discountSum.toFixed(2))),
        taxAmount: new Prisma.Decimal(Number(taxAmount.toFixed(2))),
        grandTotal: new Prisma.Decimal(Number(grandTotal.toFixed(2))),
        totalCostBasis: new Prisma.Decimal(Number(costSum.toFixed(2))),
        dealMarginPercent: new Prisma.Decimal(Number(dealMarginPercent.toFixed(2))),
        blendedRiskScore: new Prisma.Decimal(blendedRiskScore),
        expiresAt,
        portalToken,
        portalTokenExpiresAt,
        createdAt,
        updatedAt: createdAt,
        lines: {
          create: linesPayload,
        },
      },
    });

    totalQuotesCreated++;

    // 5.1 Seed Approval Requests & Audit Logs for IN_REVIEW or High Risk
    if (status === QuoteStatus.IN_REVIEW) {
      const isDualRequired = blendedRiskScore > 50.0 || dealMarginPercent < 18.0;
      const tierLevel = isDualRequired ? 2 : 1;

      // Approval Request
      const existingReq = await prisma.approvalRequest.findFirst({
        where: { quotationId: quotation.id },
      });
      if (!existingReq) {
        await prisma.approvalRequest.create({
          data: {
            quotationId: quotation.id,
            approverId: isDualRequired && financeOpsId ? financeOpsId : salesManagerId,
            tierLevel,
            status: ApprovalStatus.PENDING,
            decisionReason: isDualRequired
              ? 'High-risk deal exceeding blended threshold (>50) or margin (<18%); requires Finance Ops + Sales Manager sign-off.'
              : 'Moderate discount ceiling overage requiring Sales Manager review.',
            requestedAt: createdAt,
          },
        });
      }

      // Audit Log
      await prisma.auditLog.create({
        data: {
          quotationId: quotation.id,
          actorId: rep.id,
          action: 'QUOTE_SUBMITTED_FOR_REVIEW',
          previousState: 'DRAFT',
          newState: 'IN_REVIEW',
          reason: `Submission routed to Tier-${tierLevel} governance inbox (Risk Score: ${blendedRiskScore}, Margin: ${dealMarginPercent.toFixed(1)}%).`,
          createdAt,
        },
      });
    }

    // 5.2 Seed Deal Health Radar Anomalies
    // Rule A: Stalled Deal (in CUSTOMER_REVIEW for >7 days)
    if (status === QuoteStatus.CUSTOMER_REVIEW && daysAgo >= 7 && healthAlertCounter <= 20) {
      healthAlertCounter++;
      await prisma.dealHealthAlert.create({
        data: {
          quotationId: quotation.id,
          alertType: AlertType.STALLED_DEAL,
          severity: daysAgo >= 14 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
          metricValue: new Prisma.Decimal(daysAgo),
          benchmarkValue: new Prisma.Decimal(7.0),
          description: `Quotation inactive in CUSTOMER_REVIEW for ${daysAgo} consecutive days without customer response (SLA: 7 days).`,
          isResolved: false,
          createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000),
        },
      });
      totalAlertsCreated++;
    }

    // Rule B: Discount Anomaly (>2.5 sigma or >20% on Hardware)
    if (blendedRiskScore >= 55.0 && healthAlertCounter <= 35) {
      healthAlertCounter++;
      await prisma.dealHealthAlert.create({
        data: {
          quotationId: quotation.id,
          alertType: AlertType.DISCOUNT_ANOMALY,
          severity: AlertSeverity.HIGH,
          metricValue: new Prisma.Decimal(blendedRiskScore),
          benchmarkValue: new Prisma.Decimal(25.0),
          description: `Outlier discount pattern: Deal risk score (${blendedRiskScore}) is >2.5σ higher than peer deals for ${customer.name}.`,
          isResolved: false,
          createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
        },
      });
      totalAlertsCreated++;
    }

    // 5.3 Downstream Fulfillment & Billing for ACCEPTED and CONVERTED_TO_ORDER
    if (status === QuoteStatus.ACCEPTED || status === QuoteStatus.CONVERTED_TO_ORDER) {
      orderCounter++;
      const orderNumber = `SO-2026-0${orderCounter}`;

      const existingSO = await prisma.salesOrder.findUnique({
        where: { quotationId: quotation.id },
      });

      let salesOrderId = existingSO?.id;
      if (!existingSO) {
        const newSO = await prisma.salesOrder.create({
          data: {
            orderNumber,
            quotationId: quotation.id,
            customerId: customer.id,
            status: status === QuoteStatus.CONVERTED_TO_ORDER ? OrderStatus.FULFILLED : OrderStatus.PROCESSING,
            totalAmount: quotation.grandTotal,
            createdAt,
            updatedAt: createdAt,
          },
        });
        salesOrderId = newSO.id;
        totalOrdersCreated++;

        // Fulfillment Split
        shipmentCounter++;
        const shipmentNumber = `SHIP-2026-${shipmentCounter}-A`;
        const primaryWh = warehouses[i % warehouses.length];

        const split = await prisma.fulfillmentSplit.create({
          data: {
            salesOrderId: newSO.id,
            warehouseId: primaryWh.id,
            shipmentNumber,
            status: status === QuoteStatus.CONVERTED_TO_ORDER ? FulfillmentStatus.DELIVERED : FulfillmentStatus.SHIPPED,
            trackingNumber: `TRK-IND-${800000 + shipmentCounter}`,
            shippingCostWeight: new Prisma.Decimal(1.0),
            dispatchedAt: new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000),
            createdAt,
          },
        });

        // Add line items to split
        for (const prod of selectedProducts) {
          await prisma.fulfillmentLine.create({
            data: {
              fulfillmentSplitId: split.id,
              productId: prod.id,
              quantityFulfilled: 1,
            },
          });
        }
      }

      // Commercial Invoice
      if (salesOrderId) {
        invoiceCounter++;
        const invoiceNumber = `INV-2026-0${invoiceCounter}`;
        const existingInv = await prisma.invoice.findUnique({
          where: { invoiceNumber },
        });

        if (!existingInv) {
          await prisma.invoice.create({
            data: {
              invoiceNumber,
              salesOrderId,
              customerId: customer.id,
              type: InvoiceType.COMMERCIAL_INVOICE,
              status: status === QuoteStatus.CONVERTED_TO_ORDER ? InvoiceStatus.PAID : InvoiceStatus.SENT,
              subtotal: quotation.subtotalAmount,
              taxAmount: quotation.taxAmount,
              totalAmount: quotation.grandTotal,
              dueDate: new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000),
              paidAt: status === QuoteStatus.CONVERTED_TO_ORDER ? new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000) : null,
              createdAt,
            },
          });
          totalInvoicesCreated++;
        }

        // Check if any product is recurring -> Seed Subscription
        const recurringProd = selectedProducts.find((p) => p.isRecurring);
        if (recurringProd) {
          subCounter++;
          const contractNumber = `SUB-2026-0${subCounter}`;
          const existingSub = await prisma.subscription.findUnique({
            where: { contractNumber },
          });

          if (!existingSub) {
            const recurringAmount = recurringProd.basePrice * 0.9;
            const sub = await prisma.subscription.create({
              data: {
                contractNumber,
                salesOrderId,
                customerId: customer.id,
                productId: recurringProd.id,
                status: SubscriptionStatus.ACTIVE,
                billingFrequency: BillingFrequency.MONTHLY,
                recurringAmount: new Prisma.Decimal(recurringAmount),
                quantity: 1,
                unitPrice: new Prisma.Decimal(recurringProd.basePrice),
                currentPeriodStart: createdAt,
                currentPeriodEnd: new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000),
                nextBillingDate: new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000),
                createdAt,
              },
            });

            // Add billing schedule
            await prisma.billingSchedule.create({
              data: {
                subscriptionId: sub.id,
                scheduledDate: new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000),
                amount: new Prisma.Decimal(recurringAmount),
                isProcessed: false,
              },
            });

            totalSubscriptionsCreated++;
          }
        }
      }
    }

    if ((i + 1) % 50 === 0 || i === statusDistribution.length - 1) {
      console.log(`   ⏳ Progress: ${i + 1} / ${statusDistribution.length} quotations processed...`);
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n======================================================');
  console.log(`✅ Large Dataset Seeding Successfully Finished in ${durationSec}s!`);
  console.log(`   • Quotations Processed: ${totalQuotesCreated}`);
  console.log(`   • Enterprise Customers: ${customers.length}`);
  console.log(`   • Sales Orders Created: ${totalOrdersCreated}`);
  console.log(`   • Invoices Created: ${totalInvoicesCreated}`);
  console.log(`   • Subscriptions Active: ${totalSubscriptionsCreated}`);
  console.log(`   • Deal Health Alerts: ${totalAlertsCreated}`);
  console.log('======================================================\n');
};

// Standalone CLI invocation
if (require.main === module) {
  seedLargeDataset()
    .catch((err) => {
      console.error('❌ Large Dataset Seeding Failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
