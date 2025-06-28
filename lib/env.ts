export function getEnv(name: string, required = true): string {
  const value = process.env[name];
  if ((value === undefined || value === '') && required) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value ?? '';
}
