import {
  ProductionEnvironmentError,
  assertProductionRuntimeEnv,
} from "./production-env"

export function validateProductionRuntimeOrExit(): void {
  try {
    assertProductionRuntimeEnv(process.env)
  } catch (error) {
    const message = error instanceof ProductionEnvironmentError
      ? error.message
      : "Production environment validation failed"

    process.stderr.write(`${message}\n`)
    process.exit(1)
  }
}
