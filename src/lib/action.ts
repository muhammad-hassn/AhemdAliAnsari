import { z } from "zod";
import { reportError } from "@/lib/report-error";

export type ActionResult<T = void> =
  | { ok: true; success: true; data: T; error?: undefined }
  | { ok: false; success: false; error: string; fieldErrors?: Record<string, string[]>; data?: undefined }
  | { success: true; ok?: boolean; data?: T; error?: undefined }
  | { success: false; ok?: boolean; error: string; fieldErrors?: Record<string, string[]>; data?: undefined };

export function actionOk<T>(data: T): ActionResult<T> {
  return { ok: true, success: true, data };
}

export function actionError(
  error: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<never> {
  return { ok: false, success: false, error, fieldErrors };
}

function parseZodError(err: z.ZodError): Record<string, string[]> {
  return err.flatten().fieldErrors as Record<string, string[]>;
}

export async function safeAction<TSchema extends z.ZodType, TData>(
  schema: TSchema,
  raw: unknown,
  handler: (input: z.infer<TSchema>) => Promise<ActionResult<TData>>,
): Promise<ActionResult<TData>> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return actionError("Validation failed. Please check the form fields.", parseZodError(parsed.error));
  }
  try {
    return await handler(parsed.data);
  } catch (err) {
    reportError(err, "safeAction");
    return actionError("An unexpected error occurred. Please try again.");
  }
}
