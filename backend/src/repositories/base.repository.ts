/**
 * Generic Base Repository Contract
 * Standard interface for CRUD operations across database models.
 */
export interface IBaseRepository<T, ID = string, C = any> {
  findById(id: ID): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  create(data: C): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
}
