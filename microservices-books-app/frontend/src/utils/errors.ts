export const createAppError = (
  message: string,
  type: string = 'APP_ERROR',
  status?: number,
  details?: any
) => {
  const err: any = new Error(message || 'An error occurred');
  err.type = type;
  if (status) err.status = status;
  if (details) err.details = details;
  return err as Error & { type: string; status?: number; details?: any };
};

export default createAppError;
