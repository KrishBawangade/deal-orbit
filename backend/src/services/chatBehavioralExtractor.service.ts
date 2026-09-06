/**
 * Chat Behavioral Extractor Service
 * Extracts customer psychology, price sensitivity, urgency, and negotiation posture from chat messages.
 * Solves the Cold-Start problem for new prospects with zero historical data.
 */

import { InferredCustomerChatProfile } from '../types/simulation.types';

export class ChatBehavioralExtractorService {
  /**
   * Analyze raw text from customer inquiry or negotiation counter-proposal
   */
  public analyzeChat(message: string = '', isNewCustomer: boolean = false): InferredCustomerChatProfile {
    const text = message.toLowerCase();

    // 1. Demanded discount extraction (e.g., "20% discount", "15% off", "need 25%")
    let demandedDiscount: number | undefined;
    const discountMatch = text.match(/(\d{1,2})\s*%\s*(discount|off|less|concession|reduction)?/);
    if (discountMatch && discountMatch[1]) {
      demandedDiscount = Math.min(60, Math.max(1, parseInt(discountMatch[1], 10)));
    }

    // 2. Price sensitivity indicators
    const extremePriceKeywords = [
      'too expensive',
      'slash price',
      'cannot afford',
      'budget cap',
      'hard limit',
      'hard ceiling',
      'break the deal',
      'dealbreaker',
      'walk away',
      'cancel deal',
      'out of range',
    ];

    const highPriceKeywords = [
      'tight budget',
      'discount',
      'cheaper',
      'lower price',
      'more discount',
      'margin',
      'reduce',
      'competitive price',
      'best price',
      'over budget',
      'counter offer',
    ];

    const valueKeywords = [
      'long-term',
      'partnership',
      'quality',
      'sla',
      'reliability',
      'support',
      'scalability',
      'warranty',
      'premium',
      'roadmap',
    ];

    let priceSensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' = 'MEDIUM';
    if (extremePriceKeywords.some((kw) => text.includes(kw)) || (demandedDiscount && demandedDiscount >= 20)) {
      priceSensitivity = 'EXTREME';
    } else if (highPriceKeywords.some((kw) => text.includes(kw)) || (demandedDiscount && demandedDiscount >= 12)) {
      priceSensitivity = 'HIGH';
    } else if (valueKeywords.some((kw) => text.includes(kw))) {
      priceSensitivity = 'LOW';
    }

    // 3. Urgency & Delivery indicators
    const criticalUrgencyKeywords = ['today', 'immediately', 'asap', 'within 24 hours', 'urgent', 'emergency'];
    const highUrgencyKeywords = ['this week', 'friday', 'end of month', 'deadline', 'accelerate', 'expedite', 'fast'];

    let urgencyLevel: 'NORMAL' | 'HIGH' | 'CRITICAL' = 'NORMAL';
    if (criticalUrgencyKeywords.some((kw) => text.includes(kw))) {
      urgencyLevel = 'CRITICAL';
    } else if (highUrgencyKeywords.some((kw) => text.includes(kw))) {
      urgencyLevel = 'HIGH';
    }

    // 4. Competitor presence indicators
    let competitorMentioned: string | undefined;
    const competitors = ['dell', 'hp', 'lenovo', 'cisco', 'sap', 'oracle', 'salesforce', 'competitor', 'another vendor', 'alternate bid'];
    for (const comp of competitors) {
      if (text.includes(comp)) {
        competitorMentioned = comp.charAt(0).toUpperCase() + comp.slice(1);
        break;
      }
    }

    // 5. Cash Flow & Payment terms elasticity
    const termsKeywords = ['net 60', 'net 45', 'net 90', 'payment terms', 'cash flow', 'working capital', 'quarterly billing', 'deferred'];
    const cashFlowSensitive = termsKeywords.some((kw) => text.includes(kw));

    let demandedTerms: string | undefined;
    if (text.includes('net 60')) demandedTerms = 'Net 60';
    else if (text.includes('net 45')) demandedTerms = 'Net 45';
    else if (text.includes('net 30')) demandedTerms = 'Net 30';

    // 6. Extracted Key Demands list
    const keyDemands: string[] = [];
    if (demandedDiscount) keyDemands.push(`${demandedDiscount}% price concession requested`);
    if (urgencyLevel !== 'NORMAL') keyDemands.push(`Expedited delivery commitment (${urgencyLevel} urgency)`);
    if (demandedTerms) keyDemands.push(`Extended payment terms requested (${demandedTerms})`);
    if (competitorMentioned) keyDemands.push(`Competitive pressure from ${competitorMentioned}`);
    if (keyDemands.length === 0 && message.trim().length > 0) {
      keyDemands.push('Customer inquiring on quote configuration & commercial terms');
    }

    // 7. Counter Strategy Recommendation based on psychology
    let suggestedCounterStrategy = '';
    if (priceSensitivity === 'EXTREME') {
      suggestedCounterStrategy =
        'High deal turn-off risk. Do not reject directly. Anchor discount within 10-12% and trade for higher commitment volume or bundled Care Pack.';
    } else if (urgencyLevel !== 'NORMAL') {
      suggestedCounterStrategy =
        'Customer values delivery speed over pure price. Offer 24-48hr regional fulfillment dispatch to protect gross margin.';
    } else if (cashFlowSensitive) {
      suggestedCounterStrategy =
        'Customer is cash-flow constrained. Offer Net 45/60 payment terms as a direct substitute for cash discount.';
    } else {
      suggestedCounterStrategy =
        'Balanced buyer. Propose Scenario B (10% hardware discount + bundled 2-Yr Care Pack) for optimal win-probability.';
    }

    const confidenceScore = Math.min(95, Math.max(60, 60 + keyDemands.length * 10 + (demandedDiscount ? 15 : 0)));

    return {
      isNewCustomer,
      priceSensitivity,
      urgencyLevel,
      competitorMentioned,
      cashFlowSensitive,
      demandedDiscountPercent: demandedDiscount,
      demandedPaymentTerms: demandedTerms,
      keyDemands,
      confidenceScore,
      suggestedCounterStrategy,
    };
  }
}

export const chatBehavioralExtractorService = new ChatBehavioralExtractorService();
