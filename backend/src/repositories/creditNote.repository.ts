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
    return prisma.creditNote.findMany({
      include: {
        subscription: {
          select: {
            contractNumber: true,
            billingFrequency: true,
          },
        },
        invoice: {
          select: {
            invoiceNumber: true,
            totalAmount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async create(data: Prisma.CreditNoteCreateInput): Promise<CreditNote> {
    return prisma.creditNote.create({
      data,
    });
  }
}

export const creditNoteRepository = new CreditNoteRepository();
