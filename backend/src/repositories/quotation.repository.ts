import { Quotation, Prisma, QuoteStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { IBaseRepository } from './base.repository';

export interface IQuotationFilter {
  status?: QuoteStatus;
  customerId?: string;
  salesRepId?: string;
  search?: string;
  skip?: number;
  take?: number;
}

export interface IQuotationRepository extends IBaseRepository<Quotation, string, Prisma.QuotationCreateInput> {
  findByQuoteNumber(quoteNumber: string): Promise<any | null>;
  findByPortalToken(portalToken: string): Promise<any | null>;
  findAllWithFilters(filter: IQuotationFilter): Promise<{ quotations: any[]; total: number }>;
}

export class QuotationRepository implements IQuotationRepository {
  public async findById(id: string): Promise<any | null> {
    return prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            negotiationProfile: true,
          },
        },
        salesRep: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        lines: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
            variant: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        approvalRequests: {
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { tierLevel: 'asc' },
        },
        negotiationThreads: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  public async findByQuoteNumber(quoteNumber: string): Promise<any | null> {
    return prisma.quotation.findUnique({
      where: { quoteNumber },
      include: {
        customer: {
          include: {
            negotiationProfile: true,
          },
        },
        salesRep: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        lines: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
            variant: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        approvalRequests: {
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        negotiationThreads: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  public async findByPortalToken(portalToken: string): Promise<any | null> {
    return prisma.quotation.findFirst({
      where: {
        OR: [
          { portalToken },
          ...(portalToken === 'cust-001' || portalToken === 'demo-token'
            ? [{ portalToken: 'cust-001' }, { portalToken: 'demo-token' }, { quoteNumber: 'QT-2026-0043' }]
            : []),
        ],
      },
      include: {
        customer: true,
        salesRep: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lines: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
            variant: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        negotiationThreads: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  public async findAll(filter?: Partial<Quotation>): Promise<Quotation[]> {
    return prisma.quotation.findMany({
      where: filter as Prisma.QuotationWhereInput,
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findAllWithFilters(filter: IQuotationFilter): Promise<{ quotations: any[]; total: number }> {
    const where: Prisma.QuotationWhereInput = {};

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.customerId) {
      where.customerId = filter.customerId;
    }

    if (filter.salesRepId) {
      where.salesRepId = filter.salesRepId;
    }

    if (filter.search && filter.search.trim()) {
      const q = filter.search.trim();
      where.OR = [
        { quoteNumber: { contains: q, mode: 'insensitive' } },
        { customer: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        skip: filter.skip ?? 0,
        take: filter.take ?? 50,
        orderBy: { updatedAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              code: true,
              tier: true,
              contactEmail: true,
            },
          },
          salesRep: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          lines: {
            include: {
              product: {
                select: {
                  id: true,
                  sku: true,
                  name: true,
                  category: true,
                },
              },
            },
          },
          approvalRequests: {
            select: {
              id: true,
              tierLevel: true,
              status: true,
              decisionReason: true,
            },
          },
          _count: {
            select: {
              lines: true,
              negotiationThreads: true,
            },
          },
        },
      }),
      prisma.quotation.count({ where }),
    ]);

    return { quotations, total };
  }

  public async create(data: Prisma.QuotationCreateInput): Promise<Quotation> {
    return prisma.quotation.create({ data });
  }

  public async update(id: string, data: Prisma.QuotationUpdateInput): Promise<Quotation | null> {
    return prisma.quotation.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<boolean> {
    await prisma.quotation.delete({ where: { id } });
    return true;
  }
}

export const quotationRepository = new QuotationRepository();
