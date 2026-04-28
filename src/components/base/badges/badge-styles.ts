import type { BadgeColors } from "./badge-types";
import { badgeTypes } from "./badge-types";

export const filledColors: Record<
  BadgeColors,
  { root: string; addon: string; addonButton: string }
> = {
  gray: {
    root: "bg-ws-gray-50 text-ws-text-primary ring-ws-gray-200",
    addon: "text-ws-gray-100",
    addonButton: "hover:bg-ws-gray-100 text-ws-gray-70 hover:text-ws-gray-100",
  },
  brand: {
    root: "bg-ws-base-white text-ws-text-primary ring-ws-border-primary",
    addon: "text-ws-light-teal-800",
    addonButton: "hover:bg-ws-light-teal-25 text-ws-light-teal-600 hover:text-ws-light-teal-500",
  },
  error: {
    root: "bg-ws-error-50 text-ws-error-700 ring-ws-error-200",
    addon: "text-ws-error-500",
    addonButton: "hover:bg-ws-error-100 text-ws-error-400 hover:text-ws-error-500",
  },
  warning: {
    root: "bg-ws-warning-50 text-ws-warning-700 ring-ws-warning-200",
    addon: "text-ws-warning-500",
    addonButton:
      "hover:bg-ws-warning-100 text-ws-warning-400 hover:text-ws-warning-500",
  },
  success: {
    root: "bg-ws-success-50 text-ws-success-700 ring-ws-success-200",
    addon: "text-ws-success-500",
    addonButton:
      "hover:bg-ws-success-100 text-ws-success-400 hover:text-ws-success-500",
  },
};

export const addonOnlyColors = Object.fromEntries(
  Object.entries(filledColors).map(([key, value]) => [key, { root: "", addon: value.addon }])
) as Record<BadgeColors, { root: string; addon: string }>;

export const withPillTypes = {
  [badgeTypes.pillColor]: {
    common: "size-max flex items-center whitespace-nowrap rounded-full ring-1 ring-inset",
    styles: filledColors,
  },
  [badgeTypes.badgeColor]: {
    common: "size-max flex items-center whitespace-nowrap rounded-md ring-1 ring-inset",
    styles: filledColors,
  },
  [badgeTypes.badgeModern]: {
    common: "size-max flex items-center whitespace-nowrap rounded-md ring-1 ring-inset shadow-xs",
    styles: {
      gray: {
        root: "bg-ws-base-white text-secondary ring-primary",
        addon: "text-ws-gray-100",
        addonButton: "hover:bg-utility-gray-100 text-utility-gray-400 hover:text-utility-gray-500",
      },
    },
  },
};

export const withBadgeTypes = {
  [badgeTypes.pillColor]: {
    common: "size-max flex items-center whitespace-nowrap rounded-full ring-1 ring-inset",
    styles: filledColors,
  },
  [badgeTypes.badgeColor]: {
    common: "size-max flex items-center whitespace-nowrap rounded-md ring-1 ring-inset",
    styles: filledColors,
  },
  [badgeTypes.badgeModern]: {
    common:
      "size-max flex items-center whitespace-nowrap rounded-md ring-1 ring-inset bg-ws-base-white text-secondary ring-primary shadow-xs",
    styles: addonOnlyColors,
  },
};

export default {};
