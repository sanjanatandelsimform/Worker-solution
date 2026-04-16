import { sortCx } from "@/utils/cx";

export const styles = sortCx({
  common: {
    root: [
      "group relative inline-flex h-max cursor-pointer items-center justify-center whitespace-nowrap outline-brand transition duration-100 ease-linear before:absolute focus-visible:outline-2 focus-visible:outline-offset-2",
      "in-data-input-wrapper:shadow-xs in-data-input-wrapper:focus:!z-50 in-data-input-wrapper:in-data-leading:-mr-px in-data-input-wrapper:in-data-leading:rounded-r-none in-data-input-wrapper:in-data-leading:before:rounded-r-none in-data-input-wrapper:in-data-trailing:-ml-px in-data-input-wrapper:in-data-trailing:rounded-l-none in-data-input-wrapper:in-data-trailing:before:rounded-l-none",
      "disabled:cursor-not-allowed disabled:bg-ws-light-teal-25! disabled:ring-ws-border-secondary! disabled:text-ws-gray-300 disabled:border border-ws-border-secondary",
      "disabled:*:data-icon:text-fg-disabled_subtle",
      "*:data-icon:pointer-events-none *:data-icon:size-5 *:data-icon:shrink-0 *:data-icon:transition-inherit-all",
    ].join(" "),
    icon: "pointer-events-none size-5 shrink-0 transition-inherit-all",
  },
  sizes: {
    sm: {
      root: [
        "gap-1 rounded-lg px-3 py-2 text-sm font-semibold before:rounded-[7px] data-icon-only:p-2",
        "in-data-input-wrapper:px-3.5 in-data-input-wrapper:py-2.5 in-data-input-wrapper:data-icon-only:p-2.5",
      ].join(" "),
      linkRoot: "gap-1",
    },
    md: {
      root: [
        "gap-1 rounded-lg px-3.5 py-2.5 text-sm font-semibold before:rounded-[7px] data-icon-only:p-2.5",
        "in-data-input-wrapper:gap-1.5 in-data-input-wrapper:px-4 in-data-input-wrapper:text-md in-data-input-wrapper:data-icon-only:p-3",
      ].join(" "),
      linkRoot: "gap-1",
    },
    lg: {
      root: "gap-1.5 rounded-lg px-4 py-2.5 text-md font-semibold before:rounded-[7px] data-icon-only:p-3",
      linkRoot: "gap-1.5",
    },
    xl: {
      root: "gap-1.5 rounded-lg px-4.5 py-3 text-md font-semibold before:rounded-[7px] data-icon-only:p-3.5",
      linkRoot: "gap-1.5",
    },
  },

  colors: {
    primary: {
      root: [
        "bg-ws-navy-900 text-ws-base-white ring-1 ring-transparent ring-inset hover:bg-ws-navy-900 data-loading:bg-ws-navy-900 text-base font-semibold",
        "before:absolute before:inset-px before:border before:border-white/12 before:mask-b-from-0%",
        "disabled:bg-disabled disabled:shadow-xs disabled:ring-disabled_subtle",
        "*:data-icon:text-button-primary-icon hover:*:data-icon:text-button-primary-icon_hover",
      ].join(" "),
    },
    secondary: {
      root: [
        "bg-ws-base-white text-secondary ring-1 ring-ws-border-primary ring-inset hover:bg-primary_hover hover:text-secondary_hover data-loading:bg-primary_hover text-base font-semibold",
        "disabled:shadow-xs disabled:ring-disabled_subtle",
        "*:data-icon:text-fg-quaternary hover:*:data-icon:text-fg-quaternary_hover",
      ].join(" "),
    },
    tertiary: {
      root: [
        "text-ws-text-tertiary hover:bg-primary_hover hover:text-ws-text-tertiary_hover data-loading:bg-primary_hover text-base font-semibold",
        "*:data-icon:text-fg-quaternary hover:*:data-icon:text-fg-quaternary_hover",
      ].join(" "),
    },
    "link-gray": {
      root: [
        "justify-normal rounded p-0! text-ws-text-tertiary hover:text-ws-text-tertiary_hover",
        "*:data-text:underline *:data-text:decoration-transparent *:data-text:underline-offset-2 hover:*:data-text:decoration-current",
        "*:data-icon:text-fg-quaternary hover:*:data-icon:text-fg-quaternary_hover",
      ].join(" "),
    },
    "link-color": {
      root: [
        "justify-normal rounded p-0! text-ws-cyan-60 hover:text-ws-cyan-60_hover",
        "*:data-text:underline *:data-text:decoration-transparent *:data-text:underline-offset-2 hover:*:data-text:decoration-current",
        "*:data-icon:text-fg-brand-secondary_alt hover:*:data-icon:text-fg-brand-secondary_hover",
      ].join(" "),
    },
    "primary-destructive": {
      root: [
        "bg-ws-error-600 text-ws-base-white shadow-xs-skeumorphic ring-1 ring-transparent outline-error ring-inset hover:bg-ws-error-600 data-loading:bg-ws-error-600",
        "before:absolute before:inset-px before:border before:border-ws-base-white/12 before:mask-b-from-0%",
        "disabled:bg-disabled disabled:shadow-xs disabled:ring-ws-error-600",
        "*:data-icon:text-button-destructive-primary-icon hover:*:data-icon:text-button-destructive-primary-icon_hover",
      ].join(" "),
    },
    "secondary-destructive": {
      root: [
        "bg-ws-base-white text-ws-error-600 shadow-xs-skeumorphic ring-1 ring-ws-error-600 outline-error ring-inset hover:bg-ws-error-600 hover:text-ws-error-600 data-loading:bg-ws-error-600",
        "disabled:bg-ws-base-white disabled:shadow-xs disabled:ring-disabled_subtle",
        "*:data-icon:text-ws-error-600 hover:*:data-icon:text-ws-error-600",
      ].join(" "),
    },
    "tertiary-destructive": {
      root: [
        "text-ws-error-600 outline-error hover:bg-error-primary hover:text-error-primary_hover data-loading:bg-error-primary",
        "*:data-icon:text-ws-error-600 hover:*:data-icon:text-ws-error-600",
      ].join(" "),
    },
    "link-destructive": {
      root: [
        "justify-normal rounded p-0! text-ws-error-600 outline-error hover:text-error-primary_hover",
        "*:data-text:underline *:data-text:decoration-transparent *:data-text:underline-offset-2 hover:*:data-text:decoration-current",
        "*:data-icon:text-ws-error-600 hover:*:data-icon:text-ws-error-600",
      ].join(" "),
    },
    "link-disable-color": {
      root: [
        "max-w-38 justify-normal rounded py-1! px-3! text-ws-cyan-60 hover:text-ws-cyan-60_hover",
        "*:data-text:underline *:data-text:decoration-transparent *:data-text:underline-offset-2 hover:*:data-text:decoration-current shadow-none! ring-0! border-0!",
        "*:data-icon:text-ws-text-secondary_alt hover:*:data-icon:text-ws-text-secondary_hover",
      ].join(" "),
    },
  },
});

export default {};
