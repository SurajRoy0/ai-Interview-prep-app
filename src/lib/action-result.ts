export type ActionError = {
  message: string;
  code?: string;
  details?: Record<string, any>;
};

export type ActionResult<T = void> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: ActionError };

export function success<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function failure(message: string, code?: string, details?: Record<string, any>): ActionResult<any> {
  return { 
    success: false, 
    error: { message, code, details } 
  };
}
