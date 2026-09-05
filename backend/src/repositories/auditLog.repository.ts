import { AuditLog, Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export interface ICreateAuditLogInput {
  quotationId?: string | null;
  salesOrderId?: string | null;
  actorId?: string | null;
  action: string;
  previousState?: string | null;
  newState?: string | null;
  reason?: string | null;
  metadataJson?: Prisma.InputJsonValue;
}

export interface IAuditLogRepository {
  create(data: ICreateAuditLogInput): Promise<AuditLog>;
  findByQuotationId(quotationId: string): Promise<AuditLog[]>;
  findAll(limit?: number): Promise<AuditLog[]>;
}

export class AuditLogRepository implements IAuditLogRepository {
  public async create(data: ICreateAuditLogInput): Promise<AuditLog> {
    return prisma.auditLog.create({
      data: {
        quotationId: data.quotationId,
        salesOrderId: data.salesOrderId,
        actorId: data.actorId,
        action: data.action,
        previousState: data.previousState,
        newState: data.newState,
        reason: data.reason,
        metadataJson: data.metadataJson,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  public async findByQuotationId(quotationId: string): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { quotationId },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findAll(limit = 100): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      take: limit,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const auditLogRepository = new AuditLogRepository();
