import {
  Prisma,
  CustomerTier,
  ProductCategory,
  QuoteStatus,
  OrderStatus,
  FulfillmentStatus,
  BackorderStatus,
} from '@prisma/client';
import { prisma } from '../config/database';

export const seedFulfillmentData = async (): Promise<void> => {
  console.log('🌱 Seeding Fulfillment Warehouses, Stocks, Customers, and Sales Orders...');

  // 1. Ensure Categories Exist
  const hardwareCat = await prisma.category.upsert({
    where: { name: ProductCategory.HARDWARE },
    update: { defaultCeilingDiscount: 15.0 },
    create: {
      name: ProductCategory.HARDWARE,
      description: 'Physical computing hardware, enterprise laptops, docking stations',
      defaultCeilingDiscount: 15.0,
    },
  });

  const softwareCat = await prisma.category.upsert({
    where: { name: ProductCategory.SOFTWARE },
    update: { defaultCeilingDiscount: 20.0 },
    create: {
      name: ProductCategory.SOFTWARE,
      description: 'Enterprise software and security suites',
      defaultCeilingDiscount: 20.0,
    },
  });

  const servicesCat = await prisma.category.upsert({
    where: { name: ProductCategory.SERVICES },
    update: { defaultCeilingDiscount: 10.0 },
    create: {
      name: ProductCategory.SERVICES,
      description: 'Professional deployments and managed SLAs',
      defaultCeilingDiscount: 10.0,
    },
  });

  // 2. Ensure Core Products Exist
  const laptopProduct = await prisma.product.upsert({
    where: { sku: 'HW-LAPTOP-16' },
    update: {
      name: 'Enterprise Pro Laptop 16" (M3 Max / 64GB / 1TB)',
      basePrice: new Prisma.Decimal(85000),
      costPrice: new Prisma.Decimal(65000),
      categoryId: hardwareCat.id,
      unit: 'Unit',
      taxRate: new Prisma.Decimal(18.0),
      isActive: true,
    },
    create: {
      sku: 'HW-LAPTOP-16',
      name: 'Enterprise Pro Laptop 16" (M3 Max / 64GB / 1TB)',
      basePrice: new Prisma.Decimal(85000),
      costPrice: new Prisma.Decimal(65000),
      categoryId: hardwareCat.id,
      unit: 'Unit',
      taxRate: new Prisma.Decimal(18.0),
      isActive: true,
    },
  });

  const dockProduct = await prisma.product.upsert({
    where: { sku: 'HW-DOCK-01' },
    update: {
      name: 'Docking Station Pro Dual 4K',
      basePrice: new Prisma.Decimal(18000),
      costPrice: new Prisma.Decimal(12000),
      categoryId: hardwareCat.id,
      unit: 'Unit',
      taxRate: new Prisma.Decimal(18.0),
      isActive: true,
    },
    create: {
      sku: 'HW-DOCK-01',
      name: 'Docking Station Pro Dual 4K',
      basePrice: new Prisma.Decimal(18000),
      costPrice: new Prisma.Decimal(12000),
      categoryId: hardwareCat.id,
      unit: 'Unit',
      taxRate: new Prisma.Decimal(18.0),
      isActive: true,
    },
  });

  const dock4kProduct = await prisma.product.upsert({
    where: { sku: 'HW-DOCK-4K' },
    update: {
      name: 'High-Performance Edge Gateway & Hardware',
      basePrice: new Prisma.Decimal(18500),
      costPrice: new Prisma.Decimal(11500),
      categoryId: hardwareCat.id,
      unit: 'Unit',
      taxRate: new Prisma.Decimal(18.0),
      isActive: true,
    },
    create: {
      sku: 'HW-DOCK-4K',
      name: 'High-Performance Edge Gateway & Hardware',
      basePrice: new Prisma.Decimal(18500),
      costPrice: new Prisma.Decimal(11500),
      categoryId: hardwareCat.id,
      unit: 'Unit',
      taxRate: new Prisma.Decimal(18.0),
      isActive: true,
    },
  });

  // 3. Ensure 3 Regional Warehouses Exist
  const whMumbai = await prisma.warehouse.upsert({
    where: { code: 'WH-BOM-01' },
    update: {
      name: 'Main Central Hub',
      address: 'Bhiwandi Logistics Park, Mumbai, MH - 421302',
      priorityOrder: 1,
      shippingCostWeight: new Prisma.Decimal(1.0),
      isActive: true,
    },
    create: {
      id: '8a06f3f5-6e88-4990-9146-5ca1ac68a186',
      code: 'WH-BOM-01',
      name: 'Main Central Hub',
      address: 'Bhiwandi Logistics Park, Mumbai, MH - 421302',
      priorityOrder: 1,
      shippingCostWeight: new Prisma.Decimal(1.0),
      isActive: true,
    },
  });

  const whKolkata = await prisma.warehouse.upsert({
    where: { code: 'WH-CCU-02' },
    update: {
      name: 'East Regional Depot',
      address: 'Dankuni Industrial Estate, Kolkata, WB - 712311',
      priorityOrder: 2,
      shippingCostWeight: new Prisma.Decimal(1.3),
      isActive: true,
    },
    create: {
      id: '99742f0a-4b1d-4217-bed2-b87eab40cedb',
      code: 'WH-CCU-02',
      name: 'East Regional Depot',
      address: 'Dankuni Industrial Estate, Kolkata, WB - 712311',
      priorityOrder: 2,
      shippingCostWeight: new Prisma.Decimal(1.3),
      isActive: true,
    },
  });

  const whAhmedabad = await prisma.warehouse.upsert({
    where: { code: 'WH-AMD-03' },
    update: {
      name: 'West Regional Hub',
      address: 'Changodar Logistics Cluster, Ahmedabad, GJ - 382213',
      priorityOrder: 3,
      shippingCostWeight: new Prisma.Decimal(1.15),
      isActive: true,
    },
    create: {
      id: '128bea73-d93b-4f92-809b-df5beabb2a97',
      code: 'WH-AMD-03',
      name: 'West Regional Hub',
      address: 'Changodar Logistics Cluster, Ahmedabad, GJ - 382213',
      priorityOrder: 3,
      shippingCostWeight: new Prisma.Decimal(1.15),
      isActive: true,
    },
  });

  // 4. Seed Live Warehouse Stock Records
  const stockSeed = [
    // Mumbai Main Hub
    { warehouseId: whMumbai.id, productId: laptopProduct.id, onHand: 45, reserved: 20 },
    { warehouseId: whMumbai.id, productId: dockProduct.id, onHand: 40, reserved: 0 },
    { warehouseId: whMumbai.id, productId: dock4kProduct.id, onHand: 40, reserved: 25 },
    // Kolkata East Depot
    { warehouseId: whKolkata.id, productId: laptopProduct.id, onHand: 16, reserved: 0 },
    { warehouseId: whKolkata.id, productId: dockProduct.id, onHand: 20, reserved: 0 },
    { warehouseId: whKolkata.id, productId: dock4kProduct.id, onHand: 15, reserved: 0 },
    // Ahmedabad West Hub
    { warehouseId: whAhmedabad.id, productId: laptopProduct.id, onHand: 8, reserved: 0 },
    { warehouseId: whAhmedabad.id, productId: dockProduct.id, onHand: 10, reserved: 0 },
    { warehouseId: whAhmedabad.id, productId: dock4kProduct.id, onHand: 10, reserved: 0 },
  ];

  for (const s of stockSeed) {
    await prisma.warehouseStock.upsert({
      where: {
        warehouseId_productId: {
          warehouseId: s.warehouseId,
          productId: s.productId,
        },
      },
      update: {
        onHandQuantity: s.onHand,
        reservedQuantity: s.reserved,
      },
      create: {
        warehouseId: s.warehouseId,
        productId: s.productId,
        onHandQuantity: s.onHand,
        reservedQuantity: s.reserved,
        reorderThreshold: 5,
      },
    });
  }

  // 5. Ensure Customers Exist
  const custAcme = await prisma.customer.upsert({
    where: { code: 'CUST-ACME' },
    update: { name: 'Acme Corp', tier: CustomerTier.GOLD },
    create: {
      code: 'CUST-ACME',
      name: 'Acme Corp',
      tier: CustomerTier.GOLD,
      contactEmail: 'orders@acme.com',
      paymentTerms: 'Net 30',
      isActive: true,
    },
  });

  const custStark = await prisma.customer.upsert({
    where: { code: 'CUST-STARK' },
    update: { name: 'Stark Enterprises', tier: CustomerTier.ENTERPRISE },
    create: {
      code: 'CUST-STARK',
      name: 'Stark Enterprises',
      tier: CustomerTier.ENTERPRISE,
      contactEmail: 'procurement@stark.com',
      paymentTerms: 'Net 60',
      isActive: true,
    },
  });

  const custWayne = await prisma.customer.upsert({
    where: { code: 'CUST-WAYNE' },
    update: { name: 'Wayne Enterprises', tier: CustomerTier.ENTERPRISE },
    create: {
      code: 'CUST-WAYNE',
      name: 'Wayne Enterprises',
      tier: CustomerTier.ENTERPRISE,
      contactEmail: 'supply@wayne.com',
      paymentTerms: 'Net 45',
      isActive: true,
    },
  });

  const custCyber = await prisma.customer.upsert({
    where: { code: 'CUST-CYBER' },
    update: { name: 'Cyberdyne Systems', tier: CustomerTier.SILVER },
    create: {
      code: 'CUST-CYBER',
      name: 'Cyberdyne Systems',
      tier: CustomerTier.SILVER,
      contactEmail: 'procure@cyberdyne.io',
      paymentTerms: 'Net 30',
      isActive: true,
    },
  });

  const custOscorp = await prisma.customer.upsert({
    where: { code: 'CUST-OSCORP' },
    update: { name: 'Oscorp Industries', tier: CustomerTier.BRONZE },
    create: {
      code: 'CUST-OSCORP',
      name: 'Oscorp Industries',
      tier: CustomerTier.BRONZE,
      contactEmail: 'purchasing@oscorp.org',
      paymentTerms: 'Net 15',
      isActive: true,
    },
  });

  const custLex = await prisma.customer.upsert({
    where: { code: 'CUST-LEX' },
    update: { name: 'LexCorp Industries', tier: CustomerTier.ENTERPRISE },
    create: {
      code: 'CUST-LEX',
      name: 'LexCorp Industries',
      tier: CustomerTier.ENTERPRISE,
      contactEmail: 'procurement@lexcorp.com',
      paymentTerms: 'Net 60',
      isActive: true,
    },
  });

  // 6. Ensure Sales User Exists for Quotations
  let salesUser = await prisma.user.findFirst();
  if (!salesUser) {
    salesUser = await prisma.user.create({
      data: {
        email: 'rep@dealorbit.io',
        passwordHash: '$2b$10$dummyHashForDemoUsersDealOrbit2026',
        name: 'Alex Rivera',
        role: 'SALES_REP',
      },
    });
  }

  // 7. Seed Quotations & Confirmed Sales Orders
  const ordersToSeed = [
    {
      orderNumber: 'SO-2026-0043',
      quoteNumber: 'Q-2026-0043',
      customer: custAcme,
      product: laptopProduct,
      quantity: 20,
      unitPrice: 85000,
      totalAmount: 1881392,
      status: OrderStatus.PROCESSING,
      hasSplit: true,
      splitWarehouse: whMumbai,
      shipmentNumber: 'SHIP-SO-2026-0043-A',
      splitStatus: FulfillmentStatus.SHIPPED,
      trackingNumber: 'TRK-IND-99210',
    },
    {
      orderNumber: 'SO-2026-0044',
      quoteNumber: 'Q-2026-0044',
      customer: custStark,
      product: dock4kProduct,
      quantity: 24,
      unitPrice: 18500,
      totalAmount: 858450,
      status: OrderStatus.PENDING,
      hasSplit: false,
    },
    {
      orderNumber: 'SO-2026-0045',
      quoteNumber: 'Q-2026-0045',
      customer: custWayne,
      product: laptopProduct,
      quantity: 55,
      unitPrice: 85000,
      totalAmount: 4441250,
      status: OrderStatus.PENDING,
      hasSplit: false,
    },
    {
      orderNumber: 'SO-2026-0046',
      quoteNumber: 'Q-2026-0046',
      customer: custCyber,
      product: dockProduct,
      quantity: 15,
      unitPrice: 18000,
      totalAmount: 549585,
      status: OrderStatus.PENDING,
      hasSplit: false,
    },
    {
      orderNumber: 'SO-2026-0047',
      quoteNumber: 'Q-2026-0047',
      customer: custOscorp,
      product: laptopProduct,
      quantity: 5,
      unitPrice: 85000,
      totalAmount: 441320,
      status: OrderStatus.FULFILLED,
      hasSplit: true,
      splitWarehouse: whMumbai,
      shipmentNumber: 'SHIP-SO-2026-0047-A',
      splitQuantity: 5,
      splitStatus: FulfillmentStatus.DELIVERED,
      trackingNumber: 'TRK-IND-88102',
    },
    {
      orderNumber: 'SO-2026-0048',
      quoteNumber: 'Q-2026-0048',
      customer: custLex,
      product: dock4kProduct,
      quantity: 35,
      unitPrice: 18500,
      totalAmount: 615125,
      status: OrderStatus.PARTIALLY_FULFILLED,
      hasSplit: true,
      splitWarehouse: whMumbai,
      shipmentNumber: 'SHIP-SO-2026-0048-A',
      splitQuantity: 25,
      splitStatus: FulfillmentStatus.READY_FOR_PICKING,
      trackingNumber: 'TRK-IND-77192',
      backorderQuantity: 10,
    },
  ];

  for (const o of ordersToSeed) {
    // 7a. Ensure Quotation
    const quotation = await prisma.quotation.upsert({
      where: { quoteNumber: o.quoteNumber },
      update: {
        customerId: o.customer.id,
        salesRepId: salesUser.id,
        status: QuoteStatus.ACCEPTED,
        grandTotal: new Prisma.Decimal(o.totalAmount),
      },
      create: {
        quoteNumber: o.quoteNumber,
        customerId: o.customer.id,
        salesRepId: salesUser.id,
        status: QuoteStatus.ACCEPTED,
        grandTotal: new Prisma.Decimal(o.totalAmount),
        portalTokenExpiresAt: new Date(Date.now() + 30 * 86400000),
        expiresAt: new Date(Date.now() + 30 * 86400000),
        lines: {
          create: [
            {
              productId: o.product.id,
              quantity: o.quantity,
              unitPrice: new Prisma.Decimal(o.unitPrice),
              unitCost: new Prisma.Decimal(o.unitPrice * 0.75),
              discountPercent: new Prisma.Decimal(5.0),
              effectiveCeiling: new Prisma.Decimal(15.0),
              isViolation: false,
              violationPoints: 0,
              netLinePrice: new Prisma.Decimal(o.unitPrice * 0.95),
              lineMarginPercent: new Prisma.Decimal(25.0),
              isRecurring: false,
              billingFrequency: "ONE_TIME",
            },
          ],
        },
      },
    });

    // 7b. Ensure Sales Order
    const salesOrder = await prisma.salesOrder.upsert({
      where: { orderNumber: o.orderNumber },
      update: {
        quotationId: quotation.id,
        customerId: o.customer.id,
        status: o.status,
        totalAmount: new Prisma.Decimal(o.totalAmount),
      },
      create: {
        orderNumber: o.orderNumber,
        quotationId: quotation.id,
        customerId: o.customer.id,
        status: o.status,
        totalAmount: new Prisma.Decimal(o.totalAmount),
      },
    });

    // 7c. Ensure Quotation Lines match seed quantity
    await prisma.quotationLine.deleteMany({
      where: { quotationId: quotation.id },
    });
    await prisma.quotationLine.create({
      data: {
        quotationId: quotation.id,
        productId: o.product.id,
        quantity: o.quantity,
        unitPrice: new Prisma.Decimal(o.unitPrice),
        unitCost: new Prisma.Decimal(o.unitPrice * 0.75),
        discountPercent: new Prisma.Decimal(5.0),
        effectiveCeiling: new Prisma.Decimal(15.0),
        isViolation: false,
        violationPoints: 0,
        netLinePrice: new Prisma.Decimal(o.unitPrice * 0.95),
        lineMarginPercent: new Prisma.Decimal(25.0),
        isRecurring: false,
        billingFrequency: "ONE_TIME",
      },
    });

    // 7d. Reset splits and backorders if order has no split seeded
    if (!o.hasSplit) {
      const existingSplits = await prisma.fulfillmentSplit.findMany({
        where: { salesOrderId: salesOrder.id },
        select: { id: true },
      });
      for (const sp of existingSplits) {
        await prisma.fulfillmentLine.deleteMany({ where: { fulfillmentSplitId: sp.id } });
      }
      await prisma.fulfillmentSplit.deleteMany({ where: { salesOrderId: salesOrder.id } });
      await prisma.backorder.deleteMany({ where: { salesOrderId: salesOrder.id } });
    }

    // 7e. Ensure Fulfillment Split if applicable
    if (o.hasSplit && o.splitWarehouse && o.shipmentNumber) {
      const split = await prisma.fulfillmentSplit.upsert({
        where: { shipmentNumber: o.shipmentNumber },
        update: {
          salesOrderId: salesOrder.id,
          warehouseId: o.splitWarehouse.id,
          status: o.splitStatus || FulfillmentStatus.SHIPPED,
          trackingNumber: o.trackingNumber,
          shippingCostWeight: o.splitWarehouse.shippingCostWeight,
          dispatchedAt: new Date(),
        },
        create: {
          salesOrderId: salesOrder.id,
          warehouseId: o.splitWarehouse.id,
          shipmentNumber: o.shipmentNumber,
          status: o.splitStatus || FulfillmentStatus.SHIPPED,
          trackingNumber: o.trackingNumber,
          shippingCostWeight: o.splitWarehouse.shippingCostWeight,
          dispatchedAt: new Date(),
        },
      });

      await prisma.fulfillmentLine.deleteMany({
        where: { fulfillmentSplitId: split.id },
      });

      await prisma.fulfillmentLine.create({
        data: {
          fulfillmentSplitId: split.id,
          productId: o.product.id,
          quantityFulfilled: o.splitQuantity || o.quantity,
        },
      });
    }

    // 7f. Ensure Backorder if applicable
    if (o.backorderQuantity && o.backorderQuantity > 0) {
      await prisma.backorder.deleteMany({
        where: { salesOrderId: salesOrder.id },
      });
      await prisma.backorder.create({
        data: {
          salesOrderId: salesOrder.id,
          productId: o.product.id,
          quantityShort: o.backorderQuantity,
          status: BackorderStatus.PENDING,
        },
      });
    }
  }

  console.log('✅ Fulfillment Seeding Complete: 3 Warehouses, Live Stock, and Confirmed Orders in PostgreSQL!\n');
};

// Allow standalone execution
if (require.main === module) {
  seedFulfillmentData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Fulfillment Seeding Failed:', err);
      process.exit(1);
    });
}
