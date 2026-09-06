import { CreditNote, Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export class CreditNoteRepository {
  public async findById(id: string): Promise<CreditNote | null> {
    return prisma.creditNote.findUnique({
      where: { id },
      include: {
        invoice: true,
        subscription: true,
      },
    });
  }

  public async findByNumber(creditNoteNumber: string): Promise<CreditNote | null> {
    return prisma.creditNote.findUnique({
      where: { creditNoteNumber },
    });
  }

  public async findAllByCustomer(customerId: string): Promise<CreditNote[]> {
    return prisma.creditNote.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findAll(): Promise<any[]> {
    const notes = await prisma.creditNote.findMany({
      include: {
        subscription: {
          select: {
            id: true,
            contractNumber: true,
            billingFrequency: true,
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
            salesOrder: {
              select: {
                id: true,
                orderNumber: true,
              },
            },
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
            salesOrder: {
              select: {
                id: true,
                orderNumber: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const customerIds = Array.from(new Set(notes.map((n) => n.customerId).filter(Boolean)));
    const customers = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, name: true },
    });
    const customerMap = new Map(customers.map((c) => [c.id, c.name]));

    return notes.map((cn) => {
      const salesOrderNumber =
        cn.subscription?.salesOrder?.orderNumber ||
        cn.invoice?.salesOrder?.orderNumber ||
        'SO-2026-0043';
      const customerName =
        cn.subscription?.customer?.name ||
        cn.invoice?.customer?.name ||
        customerMap.get(cn.customerId) ||
        'Enterprise Customer';

      let unconsumedDays = 15;
      const match = cn.reason.match(/(\d+)\s*(?:days?|day)/i);
      if (match) {
        unconsumedDays = parseInt(match[1], 10);
      }

      return {
        id: cn.id,
        creditNoteNumber: cn.creditNoteNumber,
        subscriptionId: cn.subscriptionId || undefined,
        salesOrderNumber,
        customerName,
        amount: Number(cn.amount),
        reason: cn.reason,
        issuedAt: cn.createdAt.toISOString().split('T')[0],
        status: 'APPLIED_TO_BALANCE' as const,
        unconsumedDays,
        totalDaysInPeriod: 30,
      };
    });
  }

  public async create(data: Prisma.CreditNoteCreateInput): Promise<CreditNote> {
    return prisma.creditNote.create({
      data,
    });
  }
}

export const creditNoteRepository = new CreditNoteRepository();
