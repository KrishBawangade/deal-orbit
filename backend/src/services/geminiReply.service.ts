/**
 * Gemini Generative Negotiation Reply Service
 * Prepares structured prompt payloads and generates personalized negotiation responses.
 * Plugs directly into Google Gemini with intelligent contextual fallback generation.
 */

import { IGeminiReplyRequest, IGeminiReplyResponse } from '../types/simulation.types';

export class GeminiReplyService {
  /**
   * Generates a context-grounded negotiation reply
   */
  public async generateReply(req: IGeminiReplyRequest): Promise<IGeminiReplyResponse> {
    const { customerName, isNewCustomer, incomingCustomerMessage, inferredProfile, selectedScenario, replyTone } = req;

    const hwDiscount = selectedScenario.hardwareDiscount;
    const paymentTerms = selectedScenario.paymentTerms || 'Net 30';
    const bundleSku = selectedScenario.addedBundleSku;
    const hasExpedited = selectedScenario.expeditedDelivery;

    // Check if Gemini API Key is available in environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = this.buildGeminiPrompt(req);
        // Call Gemini 1.5/2.0 REST API
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
            }),
          }
        );

        if (response.ok) {
          const data: any = await response.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            return {
              success: true,
              replyMessage: generatedText.trim(),
              tone: replyTone,
              suggestedSubject: `Re: DealOrbit Commercial Proposal — ${customerName}`,
              strategicBulletPoints: [
                `Anchored hardware concession at ${hwDiscount}%.`,
                `Introduced ${paymentTerms} payment terms to ease working capital.`,
                bundleSku ? `Bundled ${bundleSku} at preferential pricing to enhance total engagement value.` : '',
              ].filter(Boolean),
            };
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local contextual generator:', err);
      }
    }

    // High-Fidelity Contextual Generator (Deterministic & Context-Aware)
    let replyMessage = '';
    let strategicPoints: string[] = [];

    const greeting = isNewCustomer ? `Dear ${customerName} Team,` : `Hello ${customerName},`;

    if (replyTone === 'COLLABORATIVE_VALUE') {
      replyMessage =
        `${greeting}\n\n` +
        `Thank you for following up on our proposal. We have closely reviewed your operational requirements and commercial targets.\n\n` +
        `While we cannot sustain a direct cash reduction without compromising our dedicated deployment SLA, we have structured a comprehensive package designed to deliver maximum value:\n\n` +
        `• Commercial Concession: Extending a ${hwDiscount}% discount across core hardware units.\n` +
        `• Flexible Cash Flow: Adjusting payment terms to ${paymentTerms} to accommodate your billing milestones.\n` +
        (bundleSku
          ? `• Enterprise Protection: Bundling our 2-Year Care Pack (${bundleSku}) at preferred rates, ensuring zero unexpected operational costs.\n`
          : '') +
        (hasExpedited ? `• Accelerated Logistics: Guaranteeing 24-48 hour regional hub dispatch.\n` : '') +
        `\nThis balanced configuration protects your project timeline while respecting our shared budget parameters. Please let us know if this aligns with your procurement approval process.`;

      strategicPoints = [
        `Replaced pure margin loss with a high-perceived-value Care Pack bundle.`,
        `Directly addresses cash flow constraints through ${paymentTerms} terms.`,
        `Maintains a healthy gross margin of ${selectedScenario.projectedMargin}%.`,
      ];
    } else if (replyTone === 'EXECUTIVE_PARTNERSHIP') {
      replyMessage =
        `${greeting}\n\n` +
        `We value the strategic partnership we are building with ${customerName}. In enterprise engagements of this scale, reliability and long-term continuity are paramount.\n\n` +
        `To demonstrate our commitment to this rollout, executive leadership has approved:\n` +
        `1. A tailored ${hwDiscount}% commercial discount for this deployment tier.\n` +
        `2. ${paymentTerms} commercial payment terms.\n` +
        `3. Priority allocation from our central inventory hub to secure your deployment schedule.\n\n` +
        `We are ready to initiate hardware provisioning immediately upon your digital confirmation.`;

      strategicPoints = [
        `Frames concessions as executive-level investment in long-term partnership.`,
        `Highlights supply chain allocation priority over competitor bids.`,
        `Win probability: ${selectedScenario.predictedCustomerResponse.acceptanceProbability}%.`,
      ];
    } else {
      // PRINCIPLED_BOUNDARY
      replyMessage =
        `${greeting}\n\n` +
        `Thank you for sharing your feedback on the quotation. Our pricing directly reflects our stringent hardware quality standards, genuine component sourcing, and enterprise-grade support.\n\n` +
        `Under our governed commercial framework, we can extend a ${hwDiscount}% courtesy discount along with ${paymentTerms} terms. This represents our most competitive baseline for this tier.\n\n` +
        `Please review the revised quotation and let us know if we should proceed with final staging.`;

      strategicPoints = [
        `Establishes firm margin boundaries to prevent uncontrolled discount drift.`,
        `Justifies pricing through quality standards and enterprise delivery capabilities.`,
        `Limits margin loss to protect deal viability.`,
      ];
    }

    return {
      success: true,
      replyMessage,
      tone: replyTone,
      suggestedSubject: `Re: Commercial Proposal Update — ${customerName}`,
      strategicBulletPoints: strategicPoints,
    };
  }

  private buildGeminiPrompt(req: IGeminiReplyRequest): string {
    return `
You are an expert B2B Deal Strategist and Executive Sales Negotiator for DealOrbit.
Write a professional, persuasive reply to an enterprise customer's quotation negotiation request.

Customer Context:
- Customer Name: ${req.customerName}
- Status: ${req.isNewCustomer ? 'New Prospect (Cold-Start)' : 'Existing Client'}
- Inferred Price Sensitivity: ${req.inferredProfile?.priceSensitivity || 'HIGH'}
- Inferred Urgency: ${req.inferredProfile?.urgencyLevel || 'NORMAL'}
- Customer's Incoming Message: "${req.incomingCustomerMessage || 'Requested discount and payment terms adjustment'}"

Our Selected Counter-Offer:
- Hardware Discount: ${req.selectedScenario.hardwareDiscount}%
- Service Discount: ${req.selectedScenario.serviceDiscount}%
- Payment Terms: ${req.selectedScenario.paymentTerms || 'Net 30'}
- Bundled Product: ${req.selectedScenario.addedBundleSku || 'None'}
- Expedited Delivery: ${req.selectedScenario.expeditedDelivery ? 'Yes (24-48 hr dispatch)' : 'Standard'}
- Tone: ${req.replyTone}

Goal:
Write an email response that addresses their demands, frames our concessions positively, prevents them from walking away, and encourages them to confirm the quote. Do not include markdown meta headers. Output only the email body.
`;
  }
}

export const geminiReplyService = new GeminiReplyService();
