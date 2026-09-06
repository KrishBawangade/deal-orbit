import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName = "Acme Corp",
      tier = "GOLD",
      corridorMin = 8,
      corridorMax = 12,
      roundNumber = 1,
      repOffer = {
        hardwareDiscount: 10,
        servicesDiscount: 8,
        paymentTerms: "Net 30",
        expeditedDelivery: false,
      },
      apiKey: clientApiKey,
    } = body;

    const apiKey =
      clientApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // 1. If Gemini API Key is available, invoke Google Gemini 3.6 Flash
    if (apiKey) {
      const modelsToTry = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest", "gemini-1.5-flash"];
      
      const prompt = `You are the Chief Procurement Officer at ${customerName}, a ${tier} tier enterprise client.
Your organization's historical accepted discount corridor is ${corridorMin}% to ${corridorMax}%.
You are currently in Round ${roundNumber} of quotation commercial negotiations with the sales rep.

The sales rep has proposed the following commercial counter-quote:
- Hardware Discount: ${repOffer.hardwareDiscount}%
- Services Discount: ${repOffer.servicesDiscount}%
- Payment Terms: ${repOffer.paymentTerms}
- Delivery SLA: ${repOffer.expeditedDelivery ? "Guaranteed 48-Hour Regional Hub Dispatch" : "Standard 10-14 Business Days Dispatch"}

Act as the customer procurement officer. Evaluate this offer based on realistic B2B enterprise negotiation psychology:
- If the hardware discount is >= ${corridorMin + 2}% (or if favorable terms like Net 45/60 and 48h delivery offset it), evaluate whether to ACCEPT or push for a final concession.
- Counter with specific target discount percentages (hardware and services) and payment terms.
- If it is below ${corridorMin}%, express budget constraint and push hard for concessions.

Return ONLY valid raw JSON:
{
  "decision": "ACCEPTED" | "COUNTERED" | "REJECTED",
  "customerMessage": "Authentic procurement executive response message in quotes",
  "demandedHardwareDiscount": number,
  "demandedServicesDiscount": number,
  "demandedPaymentTerms": "Net 30" | "Net 45" | "Net 60",
  "priceSensitivity": "LOW" | "MEDIUM" | "HIGH" | "EXTREME",
  "acceptanceProbability": number,
  "counterProbability": number,
  "walkAwayRisk": number,
  "behavioralReasoning": "Brief explanation of customer rationale"
}`;

      for (const modelName of modelsToTry) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.6,
                  maxOutputTokens: 2500,
                  responseMimeType: "application/json",
                },
              }),
            }
          );

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
              const parsed = JSON.parse(cleanedText);

              // Normalize probabilities to 0-100 scale if Gemini returned decimals
              const normAccept = parsed.acceptanceProbability <= 1 ? Math.round(parsed.acceptanceProbability * 100) : parsed.acceptanceProbability;
              const normCounter = parsed.counterProbability <= 1 ? Math.round(parsed.counterProbability * 100) : parsed.counterProbability;
              const normWalk = parsed.walkAwayRisk <= 1 ? Math.round(parsed.walkAwayRisk * 100) : parsed.walkAwayRisk;

              return NextResponse.json({
                success: true,
                isAiGenerated: true,
                aiModel: modelName,
                ...parsed,
                acceptanceProbability: normAccept,
                counterProbability: normCounter,
                walkAwayRisk: normWalk,
              });
            }
          }
        } catch (modelError) {
          console.warn(`Attempt with ${modelName} failed, trying next fallback:`, modelError);
        }
      }
    }

    // 2. High-Fidelity Behavioral Simulation Engine (Dynamic Model)
    const hwDiscount = repOffer.hardwareDiscount;
    const srvDiscount = repOffer.servicesDiscount;
    const terms = repOffer.paymentTerms;
    const delivery = repOffer.expeditedDelivery;

    // Concession scoring
    const hwScore = hwDiscount - corridorMin; // e.g., 12 - 8 = +4
    const srvScore = (srvDiscount - 8) * 0.5;
    const termsScore = terms === "Net 60" ? 12 : terms === "Net 45" ? 6 : 0;
    const deliveryScore = delivery ? 8 : 0;

    const totalConcessionScore = hwScore * 4.5 + srvScore * 3.0 + termsScore + deliveryScore;

    let decision: "ACCEPTED" | "COUNTERED" | "REJECTED" = "COUNTERED";
    let acceptanceProbability = Math.max(10, Math.min(96, Math.round(50 + totalConcessionScore * 1.5)));
    let counterProbability = Math.max(5, Math.min(60, Math.round(35 - totalConcessionScore * 0.8)));
    let walkAwayRisk = Math.max(2, 100 - acceptanceProbability - counterProbability);

    let customerMessage = "";
    let demandedHwDiscount = Math.max(12, corridorMax + 2);
    let demandedSrvDiscount = 15;
    let demandedTerms = "Net 60";

    if (acceptanceProbability >= 72 || roundNumber >= 3) {
      decision = "ACCEPTED";
      acceptanceProbability = Math.max(85, acceptanceProbability);
      counterProbability = Math.min(10, counterProbability);
      walkAwayRisk = 3;
      customerMessage = `"We appreciate DealOrbit working with us on these commercial terms. A ${hwDiscount}% hardware concession alongside ${terms} payment terms${
        delivery ? " and guaranteed 48-hour delivery" : ""
      } fits within our approved Q3 IT infrastructure allocation. We are pleased to accept this proposal and are routing it for final digital signing."`;
      demandedHwDiscount = hwDiscount;
      demandedSrvDiscount = srvDiscount;
      demandedTerms = terms;
    } else if (hwDiscount < corridorMin - 1 && terms === "Net 30") {
      decision = "COUNTERED";
      demandedHwDiscount = Math.min(22, corridorMax + 3);
      demandedSrvDiscount = 18;
      demandedTerms = "Net 60";
      customerMessage = `"We reviewed the ${hwDiscount}% hardware pricing for quote QT-2026. This falls noticeably short of our enterprise budget ceiling and competing vendor proposals. We require at least ${demandedHwDiscount}% on hardware and ${demandedTerms} terms, or we will need to pause negotiations."`;
    } else {
      decision = "COUNTERED";
      demandedHwDiscount = Math.min(18, Math.max(hwDiscount + 2, corridorMax + 1));
      demandedSrvDiscount = Math.max(srvDiscount + 2, 12);
      demandedTerms = terms === "Net 30" ? "Net 45" : "Net 60";
      customerMessage = `"We are making progress, but ${hwDiscount}% on core units is still tight against our procurement benchmark. If you can meet us at ${demandedHwDiscount}% hardware discount and extend ${demandedTerms} terms, we will sign off without another round."`;
    }

    return NextResponse.json({
      success: true,
      isAiGenerated: false,
      decision,
      customerMessage,
      demandedHardwareDiscount: demandedHwDiscount,
      demandedServicesDiscount: demandedSrvDiscount,
      demandedPaymentTerms: demandedTerms,
      priceSensitivity: hwDiscount >= 14 ? "HIGH" : "EXTREME",
      acceptanceProbability,
      counterProbability,
      walkAwayRisk,
      behavioralReasoning: `Customer evaluated ${hwDiscount}% HW discount, ${srvDiscount}% Services discount, ${terms} terms, and ${
        delivery ? "48h delivery" : "standard delivery"
      } against ${tier} tier corridor (${corridorMin}% - ${corridorMax}%).`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to simulate customer response" },
      { status: 500 }
    );
  }
}
