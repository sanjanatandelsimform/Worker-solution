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
    addon: "text-utility-brand-500",
    addonButton: "hover:bg-utility-brand-100 text-utility-brand-400 hover:text-utility-brand-500",
  },
  error: {
    root: "bg-utility-error-50 text-utility-error-700 ring-utility-error-200",
    addon: "text-utility-error-500",
    addonButton: "hover:bg-utility-error-100 text-utility-error-400 hover:text-utility-error-500",
  },
  warning: {
    root: "bg-utility-warning-50 text-utility-warning-700 ring-utility-warning-200",
    addon: "text-utility-warning-500",
    addonButton:
      "hover:bg-utility-warning-100 text-utility-warning-400 hover:text-utility-warning-500",
  },
  success: {
    root: "bg-utility-success-50 text-utility-success-700 ring-utility-success-200",
    addon: "text-utility-success-500",
    addonButton:
      "hover:bg-utility-success-100 text-utility-success-400 hover:text-utility-success-500",
  },
  slate: {
    root: "bg-utility-slate-50 text-utility-slate-700 ring-utility-slate-200",
    addon: "text-utility-slate-500",
    addonButton: "hover:bg-utility-slate-100 text-utility-slate-400 hover:text-utility-slate-500",
  },
  sky: {
    root: "bg-utility-sky-50 text-utility-sky-700 ring-utility-sky-200",
    addon: "text-utility-sky-500",
    addonButton: "hover:bg-utility-sky-100 text-utility-sky-400 hover:text-utility-sky-500",
  },
  "gray-blue": {
    root: "bg-utility-gray-blue-50 text-utility-gray-blue-700 ring-utility-gray-blue-200",
    addon: "text-utility-gray-blue-500",
    addonButton:
      "hover:bg-utility-gray-blue-100 text-utility-gray-blue-400 hover:text-utility-gray-blue-500",
  },
  "blue-light": {
    root: "bg-utility-blue-light-50 text-utility-blue-light-700 ring-utility-blue-light-200",
    addon: "text-utility-blue-light-500",
    addonButton:
      "hover:bg-utility-blue-light-100 text-utility-blue-light-400 hover:text-utility-blue-light-500",
  },
  blue: {
    root: "bg-utility-blue-50 text-utility-blue-700 ring-utility-blue-200",
    addon: "text-utility-blue-500",
    addonButton: "hover:bg-utility-blue-100 text-utility-blue-400 hover:text-utility-blue-500",
  },
  indigo: {
    root: "bg-utility-indigo-50 text-utility-indigo-700 ring-utility-indigo-200",
    addon: "text-utility-indigo-500",
    addonButton:
      "hover:bg-utility-indigo-100 text-utility-indigo-400 hover:text-utility-indigo-500",
  },
  purple: {
    root: "bg-utility-purple-50 text-utility-purple-700 ring-utility-purple-200",
    addon: "text-utility-purple-500",
    addonButton:
      "hover:bg-utility-purple-100 text-utility-purple-400 hover:text-utility-purple-500",
  },
  pink: {
    root: "bg-utility-pink-50 text-utility-pink-700 ring-utility-pink-200",
    addon: "text-utility-pink-500",
    addonButton: "hover:bg-utility-pink-100 text-utility-pink-400 hover:text-utility-pink-500",
  },
  orange: {
    root: "bg-utility-orange-50 text-utility-orange-700 ring-utility-orange-200",
    addon: "text-utility-orange-500",
    addonButton:
      "hover:bg-utility-orange-100 text-utility-orange-400 hover:text-utility-orange-500",
  },
  cyan: {
    root: "bg-utility-cyan-50 text-utility-cyan-700 ring-utility-cyan-200",
    addon: "text-utility-cyan-500",
    addonButton: "hover:bg-utility-cyan-100 text-utility-cyan-400 hover:text-utility-cyan-500",
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
