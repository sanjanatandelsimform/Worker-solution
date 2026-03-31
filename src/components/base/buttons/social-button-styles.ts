import { sortCx } from "@/utils/cx";

export const styles = sortCx({
  common: {
    root: "group relative inline-flex h-max cursor-pointer items-center justify-center font-semibold whitespace-nowrap outline-focus-ring transition duration-100 ease-linear before:absolute focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:stroke-fg-disabled disabled:text-fg-disabled disabled:*:text-fg-disabled",
    icon: "pointer-events-none shrink-0 transition-inherit-all",
  },

  sizes: {
    sm: { root: "gap-2 rounded-lg px-3 py-2 text-sm before:rounded-[7px] data-icon-only:p-2" },
    md: {
      root: "gap-2.5 rounded-lg px-3.5 py-2.5 text-sm before:rounded-[7px] data-icon-only:p-2.5",
    },
    lg: { root: "gap-3 rounded-lg px-4 py-2.5 text-md before:rounded-[7px] data-icon-only:p-2.5" },
    xl: {
      root: "gap-3.5 rounded-lg px-4.5 py-3 text-md before:rounded-[7px] data-icon-only:p-3.5",
    },
    "2xl": {
      root: "gap-4 rounded-[10px] px-5.5 py-4 text-lg before:rounded-[9px] data-icon-only:p-4",
    },
  },

  colors: {
    gray: {
      root: "bg-ws-white text-secondary shadow-xs-skeumorphic ring-1 ring-ws-primary-100 ring-inset hover:bg-primary_hover hover:text-secondary_hover",
      icon: "text-fg-quaternary group-hover:text-fg-quaternary_hover",
    },
    black: {
      root: "bg-black text-ws-white shadow-xs-skeumorphic ring-1 ring-transparent ring-inset before:absolute before:inset-px before:border before:border-white/12 before:mask-b-from-0%",
      icon: "",
    },

    facebook: {
      root: "bg-[#1877F2] text-ws-white shadow-xs-skeumorphic ring-1 ring-transparent ring-inset before:absolute before:inset-px before:border before:border-white/12 before:mask-b-from-0% hover:bg-[#0C63D4]",
      icon: "",
    },

    dribble: {
      root: "bg-[#EA4C89] text-ws-white shadow-xs-skeumorphic ring-1 ring-transparent ring-inset before:absolute before:inset-px before:border before:border-white/12 before:mask-b-from-0% hover:bg-[#E62872]",
      icon: "",
    },
  },
});

export default {};
