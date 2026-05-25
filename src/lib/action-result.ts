export type ActionError = {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
};

export type ActionResult<T = void> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: ActionError };

export function success<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function failure<T = never>(message: string, code?: string, details?: Record<string, unknown>): ActionResult<T> {
  return { 
    success: false, 
    error: { message, code, details } 
  };
}
