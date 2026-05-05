import { sortCx } from "@/utils/cx";

/**
 * Gates LSI Component Library - Button Styles
 * Based on Figma design: https://www.figma.com/design/oz9eI1EjTUu3cwm1NuOirJ/-Component-Library--Gates-LSI
 *
 * Button Variants:
 * - Sizes: xs (small), sm, md, lg (large), xl
 * - Types: primary, secondary, tertiary, subtle, link, warning
 * - States: default, hover, active, disabled, loading
 */

export const styles = sortCx({
  common: {
    root: [
      // Base styles
      "group relative inline-flex items-center justify-center whitespace-nowrap cursor-pointer",
      "rounded-lg font-semibold transition-all duration-100 ease-linear",
      "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ws-border-focus-ring",
      // Icon handling
      "*:data-icon:pointer-events-none *:data-icon:shrink-0 *:data-icon:transition-all-inherit",
      // Disabled state
      "disabled:cursor-not-allowed disabled:opacity-60",
    ].join(" "),
    icon: "pointer-events-none shrink-0 inline-flex",
  },

  sizes: {
    // Extra Small - 28px height
    xs: {
      root: "h-7 gap-1 px-2 py-1.5 text-xs",
      icon: "size-3.5",
      linkRoot: "gap-1",
    },
    // Small - 32px height
    sm: {
      root: "h-8 gap-1 px-2.5 py-2 text-sm",
      icon: "size-4",
      linkRoot: "gap-1",
    },
    // Medium - 36px height (Default)
    md: {
      root: "h-9 gap-1.5 px-3 py-2.5 text-sm",
      icon: "size-4",
      linkRoot: "gap-1.5",
    },
    // Large - 44px height
    lg: {
      root: "h-11 gap-1.5 px-4 py-3 text-base",
      icon: "size-5",
      linkRoot: "gap-1.5",
    },
    // Extra Large - 48px height
    xl: {
      root: "h-12 gap-2 px-5 py-3 text-base",
      icon: "size-5",
      linkRoot: "gap-2",
    },
  },

  variants: {
    // PRIMARY VARIANT - Solid Navy Background
    primary: {
      root: [
        "bg-ws-navy-900 text-ws-base-white border-2 border-ws-gray-950/18",
        "hover:bg-ws-navy-600 hover:text-ws-base-white hover:border-ws-gray-950/18 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ws-light-teal-850",
        "active:bg-ws-navy-900 active:border-ws-gray-950/18",
        "disabled:bg-ws-gray-100 disabled:border-ws-gray-200 disabled:text-ws-gray-400 shadow-ws-shadow-xs",
        "*:data-icon:text-ws-base-white hover:*:data-icon:text-ws-base-white transition-all duration-200",
      ].join(" "),
    },

    // SECONDARY VARIANT - White Background with Navy Border
    secondary: {
      root: [
        "bg-ws-navy-800 text-ws-base-white border-2 border-ws-gray-950/18",
        "hover:bg-ws-navy-600 hover:text-ws-base-white hover:border-ws-gray-950/18 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ws-light-teal-850",
        "active:bg-ws-navy-800 active:border-ws-gray-950/18",
        "disabled:bg-ws-gray-100 disabled:border-ws-gray-200 disabled:text-ws-gray-400",
        "*:data-icon:text-ws-base-white hover:*:data-icon:text-ws-base-white transition-all duration-200",
      ].join(" "),
    },

    // TERTIARY VARIANT - Outline Only (No Background)
    tertiary: {
      root: [
        "bg-ws-base-white text-ws-navy-800 border border-ws-navy-800",
        "hover:bg-ws-navy-600 hover:text-ws-base-white hover:border-ws-navy-800 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ws-light-teal-850 focus:text-ws-navy-800",
        "active:bg-ws-base-white active:border-ws-navy-800",
        "disabled:bg-ws-gray-100 disabled:border-ws-gray-200 disabled:text-ws-gray-400",
        "*:data-icon:text-ws-navy-900 hover:*:data-icon:text-ws-base-white transition-all duration-200",
      ].join(" "),
    },

    // SUBTLE VARIANT - Light Gray Background
    subtle: {
      root: [
        "bg-ws-base-white text-ws-navy-800 border border-ws-gray-200",
        "hover:bg-ws-navy-600 hover:text-ws-base-white hover:border-ws-navy-800 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ws-light-teal-850",
        "active:bg-ws-base-white active:border-ws-gray-200",
        "disabled:bg-ws-gray-100 disabled:border-ws-gray-200 disabled:text-ws-gray-400",
        "*:data-icon:text-ws-navy-800 hover:*:data-icon:text-ws-navy-800 transition-all duration-200",
      ].join(" "),
    },

    // LINK VARIANT - Text Only (No Background/Border)
    link: {
      root: [
        "bg-transparent border-none text-ws-navy-800 underline",
        "hover:text-ws-navy-600 hover:text-ws-navy-800 hover:no-underline transition-all duration-200",
        //"focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ws-light-teal-850",
        "active:text-ws-navy-800",
        "disabled:text-ws-gray-400 disabled:no-underline",
        "*:data-icon:text-ws-navy-800 hover:*:data-icon:text-ws-navy-800 transition-all duration-200",
      ].join(" "),
    },
    error: {
      root: [
        "bg-ws-error-600 text-ws-base-white border border-ws-error-600",
        "hover:bg-ws-error-200 hover:hover:border-ws-bg-overlay/18 transition-all duration-200 hover:text-ws-error-700",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ws-light-teal-850",
        "active:bg-ws-error-800 active:border-ws-error-800",
        "disabled:bg-ws-gray-100 disabled:border-ws-gray-100 disabled:text-ws-gray-400",
        "*:data-icon:text-ws-base-white hover:*:data-icon:text-ws-base-white transition-all duration-200",
      ].join(" "),
    },

    // DESTRUCTIVE VARIANTS
    "destructive-primary": {
      root: [
        "bg-ws-error-600 text-ws-base-white border border-ws-error-600",
        "hover:bg-ws-error-700 hover:border-ws-bg-overlay/18",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ws-light-teal-850",
        "active:bg-ws-error-800 active:border-ws-error-800",
        "disabled:bg-ws-gray-100 disabled:border-ws-gray-100 disabled:text-ws-gray-400",
        "*:data-icon:text-ws-base-white hover:*:data-icon:text-ws-base-white",
      ].join(" "),
    },

    "destructive-secondary": {
      root: [
        "bg-ws-base-white text-ws-error-600 border border-ws-error-600",
        "hover:bg-ws-error-50 hover:border-ws-error-500",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ws-light-teal-850",
        "active:bg-ws-error-100 active:border-ws-error-600",
        "disabled:bg-ws-gray-50 disabled:border-ws-gray-300 disabled:text-ws-gray-400",
        "*:data-icon:text-ws-error-600 hover:*:data-icon:text-ws-error-700",
      ].join(" "),
    },

    "destructive-tertiary": {
      root: [
        "bg-transparent text-ws-error-600 border border-ws-error-500",
        "hover:bg-ws-error-25 hover:border-ws-error-400",
        "active:bg-ws-error-50 active:border-ws-error-500",
        "disabled:border-ws-gray-300 disabled:text-ws-gray-400",
        "*:data-icon:text-ws-error-600 hover:*:data-icon:text-ws-error-700",
      ].join(" "),
    },

    "destructive-link": {
      root: [
        "bg-transparent border-none text-ws-error-600 underline",
        "hover:text-ws-error-700 hover:no-underline",
        "active:text-ws-error-800",
        "disabled:text-ws-gray-400 disabled:no-underline",
        "*:data-icon:text-ws-error-600 hover:*:data-icon:text-ws-error-700",
      ].join(" "),
    },

    // SUCCESS VARIANT
    success: {
      root: [
        "bg-ws-success-600 text-ws-base-white border border-ws-success-600",
        "hover:bg-ws-success-700 hover:border-ws-success-700",
        "active:bg-ws-success-800 active:border-ws-success-800",
        "disabled:bg-ws-gray-100 disabled:border-ws-gray-100 disabled:text-ws-gray-400",
        "*:data-icon:text-ws-base-white hover:*:data-icon:text-ws-base-white",
      ].join(" "),
    },

    // WARNING VARIANT
    warning: {
      root: [
        "bg-ws-warning-600 text-ws-base-white border border-ws-warning-600",
        "hover:bg-ws-warning-700 hover:border-ws-warning-700",
        "active:bg-ws-warning-800 active:border-ws-warning-800",
        "disabled:bg-ws-gray-100 disabled:border-ws-gray-100 disabled:text-ws-gray-400",
        "*:data-icon:text-ws-base-white hover:*:data-icon:text-ws-base-white",
      ].join(" "),
    },

    // GHOST VARIANT - Minimal (for secondary actions)
    ghost: {
      root: [
        "bg-transparent text-ws-text-secondary border-none",
        "hover:bg-ws-gray-50 hover:text-ws-text-primary",
        "active:bg-ws-gray-100 active:text-ws-text-primary",
        "disabled:text-ws-gray-400",
        "*:data-icon:text-ws-text-secondary hover:*:data-icon:text-ws-text-primary",
      ].join(" "),
    },

    // BACKWARD COMPATIBILITY ALIASES
    "link-gray": {
      root: [
        "bg-transparent border-none text-ws-text-tertiary underline",
        "hover:text-ws-text-secondary hover:no-underline",
        "active:text-ws-text-primary",
        "disabled:text-ws-gray-400 disabled:no-underline",
        "*:data-icon:text-ws-text-tertiary hover:*:data-icon:text-ws-text-secondary",
      ].join(" "),
    },

    "link-color": {
      root: [
        "bg-transparent border-none text-ws-cyan underline",
        "hover:text-ws-cyan hover:no-underline",
        "active:text-ws-cyan",
        "disabled:text-ws-gray-400 disabled:no-underline",
        "*:data-icon:text-ws-cyan hover:*:data-icon:text-ws-cyan",
      ].join(" "),
    },

    "primary-destructive": {
      root: [
        "bg-ws-error-600 text-ws-base-white border border-ws-error-600",
        "hover:bg-ws-error-200 hover:border-ws-error-700 transition-all duration-200 hover:text-ws-error-700",
        "active:bg-ws-error-800 active:border-ws-error-800",
        "disabled:bg-ws-gray-100 disabled:border-ws-gray-100 disabled:text-ws-gray-400",
        "*:data-icon:text-ws-base-white hover:*:data-icon:text-ws-base-white",
      ].join(" "),
    },

    "secondary-destructive": {
      root: [
        "bg-ws-base-white text-ws-error-600 border border-ws-error-600",
        "hover:bg-ws-error-50 hover:border-ws-error-500",
        "active:bg-ws-error-100 active:border-ws-error-600",
        "disabled:bg-ws-gray-50 disabled:border-ws-gray-300 disabled:text-ws-gray-400",
        "*:data-icon:text-ws-error-600 hover:*:data-icon:text-ws-error-700",
      ].join(" "),
    },

    "tertiary-destructive": {
      root: [
        "bg-transparent text-ws-error-600 border border-ws-error-500",
        "hover:bg-ws-error-25 hover:border-ws-error-400",
        "active:bg-ws-error-50 active:border-ws-error-500",
        "disabled:border-ws-gray-300 disabled:text-ws-gray-400",
        "*:data-icon:text-ws-error-600 hover:*:data-icon:text-ws-error-700",
      ].join(" "),
    },

    "link-destructive": {
      root: [
        "bg-transparent border-none text-ws-error-600 underline",
        "hover:text-ws-error-700 hover:no-underline",
        "active:text-ws-error-800",
        "disabled:text-ws-gray-400 disabled:no-underline",
        "*:data-icon:text-ws-error-600 hover:*:data-icon:text-ws-error-700",
      ].join(" "),
    },
  },
});

export default {};
