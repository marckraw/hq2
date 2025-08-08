/**
 * Common serializers for API responses
 */

/**
 * Serializes an object with date fields to ensure they are ISO strings
 */
export function serializeDates<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  
  for (const key in result) {
    if (result[key] && typeof result[key].getTime === 'function') {
      (result as any)[key] = result[key].toISOString();
    } else if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      // Recursively handle nested objects
      (result as any)[key] = serializeDates(result[key]);
    } else if (Array.isArray(result[key])) {
      // Handle arrays of objects
      (result as any)[key] = result[key].map((item: any) => 
        item && typeof item === 'object' ? serializeDates(item) : item
      );
    }
  }
  
  return result;
}

/**
 * Serializes common database record fields
 */
export function serializeRecord<T extends { createdAt?: any; updatedAt?: any; [key: string]: any }>(
  record: T | undefined | null
): T | undefined | null {
  if (!record) return record;
  return serializeDates(record);
}

/**
 * Serializes an array of records
 */
export function serializeRecords<T extends { createdAt?: any; updatedAt?: any; [key: string]: any }>(
  records: (T | undefined | null)[]
): (T | undefined | null)[] {
  return records.map(serializeRecord);
}