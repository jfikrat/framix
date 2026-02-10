import type { VideoConfig, AnimationProps } from "./animations";
import type { TimelineSegment } from "./templates/types";

// ─── Input Types ─────────────────────────────────────

export type InputType = "text" | "number" | "color" | "image" | "select" | "boolean";

export interface InputField {
  type: InputType;
  label: string;
  default: string | number | boolean;
  required?: boolean;
  options?: string[];     // for "select" type
  min?: number;           // for "number" type
  max?: number;           // for "number" type
  placeholder?: string;   // for "text" type
}

export type InputSchema = Record<string, InputField>;
export type InputValues = Record<string, string | number | boolean>;

// ─── Resolve & Validate ──────────────────────────────

/**
 * Merge provided values with schema defaults.
 * Missing values get their defaults. Extra keys are ignored.
 */
export function resolveInputs(
  schema: InputSchema,
  values?: Partial<InputValues>,
): InputValues {
  const result: InputValues = {};

  for (const [key, field] of Object.entries(schema)) {
    const provided = values?.[key];

    if (provided !== undefined && provided !== null) {
      switch (field.type) {
        case "number":
          result[key] = Number(provided);
          break;
        case "boolean":
          result[key] = Boolean(provided);
          break;
        default:
          result[key] = String(provided);
      }
    } else {
      result[key] = field.default;
    }
  }

  return result;
}

/**
 * Validate inputs against schema. Returns array of error messages.
 * Empty array = valid.
 */
export function validateInputs(
  schema: InputSchema,
  values: InputValues,
): string[] {
  const errors: string[] = [];

  for (const [key, field] of Object.entries(schema)) {
    const value = values[key];

    if (field.required && (value === undefined || value === null || value === "")) {
      errors.push(`${field.label} is required`);
      continue;
    }

    if (field.type === "number" && typeof value === "number") {
      if (field.min !== undefined && value < field.min) {
        errors.push(`${field.label} must be at least ${field.min}`);
      }
      if (field.max !== undefined && value > field.max) {
        errors.push(`${field.label} must be at most ${field.max}`);
      }
    }

    if (field.type === "select" && field.options && !field.options.includes(String(value))) {
      errors.push(`${field.label} must be one of: ${field.options.join(", ")}`);
    }
  }

  return errors;
}

// ─── Template Helper Type ────────────────────────────

export interface TemplateWithInputs<T extends InputValues = InputValues> {
  meta: import("./templates/types").ProjectMeta;
  Component: React.FC<AnimationProps & { inputs: T }>;
  templateConfig?: Partial<VideoConfig>;
  timeline?: TimelineSegment[];
}
