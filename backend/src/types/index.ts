export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string | Record<string, unknown>;
  timestamp: string;
}

export interface IHealthStatus {
  status: 'ok' | 'degraded' | 'down';
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
  database: {
    connected: boolean;
    type: string;
    latencyMs?: number;
    error?: string;
  };
  memory: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
  };
}

export interface IAuthUser {
  id: string;
  email: string;
}

export interface IUserResponse {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface IAuthResponse {
  user: IUserResponse;
  tokens: IAuthTokens;
}

declare global {
  namespace Express {
    interface Request {
      user?: IAuthUser;
    }
  }
}
