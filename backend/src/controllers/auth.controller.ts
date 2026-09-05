import { Request, Response } from 'express';
import { AuthService, authService } from '../services/auth.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  public register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.register(req.body);
    sendSuccess(res, result, 'User registered successfully', 201);
  });

  public login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.login(req.body);
    sendSuccess(res, result, 'Login successful', 200);
  });

  public refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.refreshToken(req.body.refreshToken);
    sendSuccess(res, result, 'Access token refreshed successfully', 200);
  });

  public logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (req.body.refreshToken) {
      await this.service.logout(req.body.refreshToken);
    }
    sendSuccess(res, null, 'Logged out successfully', 200);
  });

  public getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const profile = await this.service.getProfile(req.user!.id);
    sendSuccess(res, profile, 'Profile retrieved successfully', 200);
  });
}

export const authController = new AuthController();
