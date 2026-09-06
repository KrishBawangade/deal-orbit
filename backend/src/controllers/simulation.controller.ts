/**
 * Deal Strategy Simulator Controller
 * Aligned with API.md §6
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { simulationService } from '../services/simulation.service';
import { chatBehavioralExtractorService } from '../services/chatBehavioralExtractor.service';
import { geminiReplyService } from '../services/geminiReply.service';

export class SimulationController {
  /**
   * POST /api/v1/simulations/run
   * Executes dual-sided simulation and returns synthesized scenarios A, B, C (+ custom What-If)
   */
  public runSimulation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { quotationId, whatIfOverrides, chatMessage, isNewCustomer } = req.body;

    const result = await simulationService.runSimulation({
      quotationId,
      whatIfOverrides,
      chatMessage,
      isNewCustomer,
    });

    sendSuccess(res, result, 'Simulation executed successfully', 200);
  });

  /**
   * POST /api/v1/simulations/analyze-chat
   * Analyzes raw customer inquiry or counter-proposal message for cold-start profiling
   */
  public analyzeChat = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { message, isNewCustomer } = req.body;

    const profile = chatBehavioralExtractorService.analyzeChat(message, isNewCustomer);
    sendSuccess(res, profile, 'Chat behavioral profiling completed', 200);
  });

  /**
   * POST /api/v1/simulations/apply
   * Applies simulated scenario or what-if overrides directly to the active quotation
   */
  public applySimulation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { quotationId, scenarioId, customOverrides, syncNegotiationThread, replyMessage } = req.body;

    const result = await simulationService.applySimulation(
      {
        quotationId,
        scenarioId,
        customOverrides,
        syncNegotiationThread,
        replyMessage,
      },
      req.user?.id
    );

    sendSuccess(res, result, `Scenario ${scenarioId} successfully applied to quotation`, 200);
  });

  /**
   * POST /api/v1/simulations/generate-reply
   * Generates tailored negotiation reply draft using Gemini prompt pipeline
   */
  public generateReply = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await geminiReplyService.generateReply(req.body);
    sendSuccess(res, result, 'Negotiation reply generated successfully', 200);
  });
}

export const simulationController = new SimulationController();
