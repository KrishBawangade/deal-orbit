import { z } from 'zod';

export const approvalDecisionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Quotation ID or Approval Request ID is required'),
  }),
  body: z.object({
    decision: z.enum(
      ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'APPROVE', 'REJECT', 'RETURN'],
      {
        required_error: 'Decision is required (APPROVED, REJECTED, or CHANGES_REQUESTED)',
      }
    ),
    reason: z.string().min(1, 'Reason / audit justification is required'),
    reviewerName: z.string().optional(),
    reviewerRole: z.string().optional(),
  }),
});

export type ApprovalDecisionInput = z.infer<typeof approvalDecisionSchema>['body'];
