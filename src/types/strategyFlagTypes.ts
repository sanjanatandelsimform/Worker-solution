/**
 * Tri-state flag returned by the API for proven strategy cards.
 *
 * - "green"  → strategy is implemented; show green card + green icon
 * - "yellow" → strategy is recommended but not implemented; show yellow card + yellow icon
 * - "hidden" → strategy not applicable or insufficient data; card is NOT rendered
 */
export type StrategyFlagStatus = "green" | "yellow" | "hidden";
