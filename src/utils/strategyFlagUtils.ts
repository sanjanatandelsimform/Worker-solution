import type { StrategyFlagStatus } from "@/types/strategyFlagTypes";

const VALID_FLAGS: ReadonlySet<string> = new Set(["green", "yellow", "hidden"]);

/**
 * Normalise an unknown API value to a valid StrategyFlagStatus.
 * Any unrecognised, absent, or boolean value defaults to "hidden".
 */
export function normaliseFlag(raw: unknown): StrategyFlagStatus {
  return typeof raw === "string" && VALID_FLAGS.has(raw) ? (raw as StrategyFlagStatus) : "hidden";
}
