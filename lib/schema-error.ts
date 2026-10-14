export function isMissingSchema(error: { message: string; code?: string }) {
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /schema cache|could not find the table|relation .* does not exist/i.test(
      error.message,
    )
  );
}

export class SchemaMissingError extends Error {
  constructor() {
    super("O banco ainda não tem as tabelas do Shopwag.");
    this.name = "SchemaMissingError";
  }
}

export const SCHEMA_MISSING = Symbol("schema-missing");

export async function catchSchema<T>(task: () => Promise<T>) {
  try {
    return await task();
  } catch (error) {
    if (error instanceof SchemaMissingError) return SCHEMA_MISSING;
    throw error;
  }
}
