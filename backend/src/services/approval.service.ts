import { QuoteStatus, ApprovalStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/appError';
import { IAuthUser } from '../types';

export interface IApprovalDecisionDto {
  decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'APPROVE' | 'REJECT' | 'RETURN';
  reason: string;
  reviewerName?: string;
  reviewerRole?: string;
}

export class ApprovalService {
  /**
   * Records an approval, rejection, or revision request with mandatory audit justification.
   * Aligned with API.md §8.2 and PRD §5.1 Sequential Governance.
   */
  public async recordDecision(
    idOrQuoteNumber: string,
    dto: IApprovalDecisionDto,
    user?: IAuthUser
  ) {
    if (!dto.reason || dto.reason.trim() === '') {
      throw new AppError('A mandatory review note / audit justification is required to record a decision.', 400);
    }

    // 1. Locate Quotation (by quoteNumber, quotation ID, or approvalRequest ID)
    let quotation = await prisma.quotation.findFirst({
      where: {
        OR: [
          { quoteNumber: idOrQuoteNumber },
          { id: idOrQuoteNumber },
        ],
      },
      include: {
        lines: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        approvalRequests: {
          orderBy: { tierLevel: 'asc' },
        },
        salesRep: true,
        customer: true,
      },
    });

    if (!quotation) {
      // Check if idOrQuoteNumber is an ApprovalRequest ID
      const apprReq = await prisma.approvalRequest.findUnique({
        where: { id: idOrQuoteNumber },
        include: {
          quotation: {
            include: {
              lines: {
                include: {
                  product: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
              approvalRequests: {
                orderBy: { tierLevel: 'asc' },
              },
              salesRep: true,
              customer: true,
            },
          },
        },
      });

      if (apprReq?.quotation) {
        quotation = apprReq.quotation;
      }
    }

    if (!quotation) {
      throw new AppError(`Quotation or approval request not found for identifier: ${idOrQuoteNumber}`, 404);
    }

    // 2. Normalize Decision Action
    const rawDecision = dto.decision.toUpperCase();
    let normalizedDecision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' = 'APPROVED';
    if (rawDecision === 'REJECT' || rawDecision === 'REJECTED') {
      normalizedDecision = 'REJECTED';
    } else if (rawDecision === 'RETURN' || rawDecision === 'CHANGES_REQUESTED') {
      normalizedDecision = 'CHANGES_REQUESTED';
    }

    // 3. Resolve Reviewer Identity
    const actorName = user?.name || dto.reviewerName || 'Morgan Manager';
    const actorRole = user?.role || dto.reviewerRole || 'SALES_MANAGER';
    const actorId = user?.id && !user.id.startsWith('demo-') ? user.id : null;

    // 4. Determine Multi-Tier Requirement (PRD §5.1: Risk > 50 or Margin < 18%)
    const riskScore = Number(quotation.blendedRiskScore);
    const dealMargin = Number(quotation.dealMarginPercent);
    const hasTier2InRequests = quotation.approvalRequests.some((a) => a.tierLevel === 2);
    const isDualRequired = riskScore > 50 || dealMargin < 18 || hasTier2InRequests;

    const tier1Req = quotation.approvalRequests.find((a) => a.tierLevel === 1);
    const tier2Req = quotation.approvalRequests.find((a) => a.tierLevel === 2);

    let nextStatus: QuoteStatus = quotation.status;
    let nextStage: 'SALES_MANAGER' | 'FINANCE' | 'COMPLETED' | 'REJECTED' | 'RETURNED' = 'COMPLETED';
    let auditAction = 'APPROVED_FINAL';
    let isFinal = false;
    let nextStep = 'READY_TO_PUBLISH';
    let responseMessage = '';

    if (normalizedDecision === 'APPROVED') {
      nextStatus = QuoteStatus.APPROVED;
      nextStage = 'COMPLETED';
      auditAction = 'APPROVED_FINAL';
      isFinal = true;
      nextStep = 'READY_TO_PUBLISH';
      responseMessage = `Quotation ${quotation.quoteNumber} fully approved and unlocked for customer publishing.`;
    } else if (normalizedDecision === 'REJECTED') {
      nextStatus = QuoteStatus.REJECTED;
      nextStage = 'REJECTED';
      auditAction = 'REJECTED';
      isFinal = true;
      nextStep = 'CLOSED_REJECTED';
      responseMessage = `Quotation ${quotation.quoteNumber} rejected and closed out.`;
    } else {
      // CHANGES_REQUESTED (Return for revision)
      nextStatus = QuoteStatus.DRAFT;
      nextStage = 'RETURNED';
      auditAction = 'CHANGES_REQUESTED';
      isFinal = false;
      nextStep = 'RETURNED_TO_REP';
      responseMessage = `Quotation ${quotation.quoteNumber} returned to ${quotation.salesRep?.name || 'Sales Rep'} for revision.`;
    }

    // 5. Execute Database Operations inside a Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 5.1 Update quotation status and version
      const updatedQuote = await tx.quotation.update({
        where: { id: quotation.id },
        data: {
          status: nextStatus,
          version: { increment: 1 },
          updatedAt: new Date(),
        },
      });

      // 5.2 Update or create ApprovalRequest record
      let activeApprovalRequest = null;
      const now = new Date();

      if (auditAction === 'APPROVED_FINAL') {
        // Mark all approval requests for this quotation as APPROVED
        await tx.approvalRequest.updateMany({
          where: { quotationId: quotation.id, status: ApprovalStatus.PENDING },
          data: {
            status: ApprovalStatus.APPROVED,
            decisionReason: dto.reason.trim(),
            decidedAt: now,
            approverId: actorId,
          },
        });

        const targetReq = tier1Req || tier2Req;
        if (targetReq) {
          activeApprovalRequest = await tx.approvalRequest.findUnique({
            where: { id: targetReq.id },
          });
        } else {
          activeApprovalRequest = await tx.approvalRequest.create({
            data: {
              quotationId: quotation.id,
              tierLevel: 1,
              status: ApprovalStatus.APPROVED,
              decisionReason: dto.reason.trim(),
              decidedAt: now,
              approverId: actorId,
            },
          });
        }
      } else {
        // Reject or Changes Requested
        const targetStatus =
          normalizedDecision === 'REJECTED' ? ApprovalStatus.REJECTED : ApprovalStatus.CHANGES_REQUESTED;
        const pendingReq = quotation.approvalRequests.find((a) => a.status === ApprovalStatus.PENDING);

        if (pendingReq) {
          activeApprovalRequest = await tx.approvalRequest.update({
            where: { id: pendingReq.id },
            data: {
              status: targetStatus,
              decisionReason: dto.reason.trim(),
              decidedAt: now,
              approverId: actorId,
            },
          });
        } else {
          activeApprovalRequest = await tx.approvalRequest.create({
            data: {
              quotationId: quotation.id,
              tierLevel: 1,
              status: targetStatus,
              decisionReason: dto.reason.trim(),
              decidedAt: now,
              approverId: actorId,
            },
          });
        }
      }

      // 5.3 Write immutable Audit Log record
      const auditEntry = await tx.auditLog.create({
        data: {
          quotationId: quotation.id,
          actorId,
          action: auditAction,
          previousState: quotation.status,
          newState: nextStatus,
          reason: dto.reason.trim(),
          metadataJson: {
            actorName,
            actorRole,
            riskScore,
            blendedMargin: dealMargin,
            stage: nextStage,
            timestamp: now.toISOString(),
          },
        },
      });

      return {
        updatedQuote,
        activeApprovalRequest,
        auditEntry,
      };
    });

    return {
      message: responseMessage,
      data: {
        requestId: result.activeApprovalRequest?.id || `appr-${quotation.id}`,
        quotationId: quotation.id,
        quoteNumber: quotation.quoteNumber,
        status: nextStatus,
        approvalStage: nextStage,
        isFinal,
        nextStep,
        auditLogId: result.auditEntry.id,
        version: result.updatedQuote.version,
        updatedAt: result.updatedQuote.updatedAt.toISOString(),
      },
    };
  }

  /**
   * Lists quotations currently awaiting approval sign-off.
   * Aligned with API.md §8.1.
   */
  public async getPendingApprovals() {
    const pendingQuotes = await prisma.quotation.findMany({
      where: {
        status: QuoteStatus.IN_REVIEW,
      },
      include: {
        customer: true,
        salesRep: true,
        lines: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        approvalRequests: {
          orderBy: { tierLevel: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const pendingApprovals = pendingQuotes.map((q) => {
      const violatingLines = q.lines
        .filter((l) => l.isViolation)
        .map((l) => ({
          productName: l.product.name,
          category: l.product.category.name,
          ceiling: Number(l.effectiveCeiling),
          proposed: Number(l.discountPercent),
          overagePoints: Number(l.violationPoints),
        }));

      const activeReq = q.approvalRequests.find((a) => a.status === ApprovalStatus.PENDING);

      return {
        requestId: activeReq?.id || `req-${q.id}`,
        quotationId: q.id,
        quoteNumber: q.quoteNumber,
        customerName: q.customer.name,
        customerTier: q.customer.tier,
        salesRep: {
          name: q.salesRep.name,
          email: q.salesRep.email,
        },
        blendedRiskScore: Number(q.blendedRiskScore),
        tierLevel: activeReq?.tierLevel || 1,
        proposedDiscount: Number(q.totalDiscountAmount) > 0
          ? Number(((Number(q.totalDiscountAmount) / Number(q.subtotalAmount)) * 100).toFixed(1))
          : 0,
        dealMarginPercent: Number(q.dealMarginPercent),
        violatingLines,
        requestedAt: activeReq?.requestedAt.toISOString() || q.updatedAt.toISOString(),
      };
    });

    return { pendingApprovals };
  }
}

export const approvalService = new ApprovalService();
