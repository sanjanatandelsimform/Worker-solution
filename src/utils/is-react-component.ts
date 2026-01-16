import type { ComponentType } from "react";

/**
 * Checks if a value is a React component.
 */
export const isReactComponent = (
  value: unknown,
): value is ComponentType<unknown> => {
  return (
    typeof value === "function" &&
    (value.prototype?.isReactComponent ||
      String(value).includes("return React.createElement") ||
      String(value).includes("return _jsx"))
  );
};
