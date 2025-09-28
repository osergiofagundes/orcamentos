export function isDatabaseQuotaError(error: any): boolean {
  const errorMessage = error?.message?.toLowerCase() || '';
  return (
    errorMessage.includes('data transfer quota') ||
    errorMessage.includes('exceeded') ||
    errorMessage.includes('quota') ||
    error?.code === 'QUOTA_EXCEEDED'
  );
}

export function handleDatabaseError(error: any, fallbackValue: any = null) {
  console.error("Database error:", error);
  
  if (isDatabaseQuotaError(error)) {
    console.warn("Database quota exceeded - using fallback behavior");
    return { success: false, data: fallbackValue, isQuotaError: true };
  }
  
  return { success: false, data: fallbackValue, isQuotaError: false };
}

export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  fallbackValue: T
): Promise<{ success: boolean; data: T; isQuotaError: boolean }> {
  try {
    const result = await operation();
    return { success: true, data: result, isQuotaError: false };
  } catch (error) {
    return handleDatabaseError(error, fallbackValue);
  }
}