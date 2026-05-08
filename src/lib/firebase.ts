/* Stubbed Firebase module - all real Firebase functionality removed */
export const db = {} as any;
export const auth = {} as any;
export const storage = {} as any;
export const googleProvider = {} as any;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: Record<string, any>;
}

export function handleFirestoreError(_error: unknown, _operationType: OperationType, _path: string | null): void {
  // No-op: database errors are ignored in stub mode.
}
