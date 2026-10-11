export interface ApiErrorBody {
  code: string;
  message: string;
}

export interface HealthResponse {
  status: string;
  ai_provider: string;
  ai_available: boolean;
}
