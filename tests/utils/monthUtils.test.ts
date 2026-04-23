import { describe, it, expect } from "vitest";
import { mapMonthToApiValue, MONTH_MAP } from "@/utils/monthUtils";

describe("monthUtils", () => {
  describe("MONTH_MAP", () => {
    it("should contain all month mappings", () => {
      expect(MONTH_MAP).toBeDefined();
      expect(Object.keys(MONTH_MAP).length).toBeGreaterThan(0);
    });

    it("should map full month names to 3-letter codes", () => {
      expect(MONTH_MAP.january).toBe("Jan");
      expect(MONTH_MAP.february).toBe("Feb");
      expect(MONTH_MAP.march).toBe("Mar");
      expect(MONTH_MAP.april).toBe("Apr");
      expect(MONTH_MAP.may).toBe("May");
      expect(MONTH_MAP.june).toBe("Jun");
      expect(MONTH_MAP.july).toBe("Jul");
      expect(MONTH_MAP.august).toBe("Aug");
      expect(MONTH_MAP.september).toBe("Sep");
      expect(MONTH_MAP.october).toBe("Oct");
      expect(MONTH_MAP.november).toBe("Nov");
      expect(MONTH_MAP.december).toBe("Dec");
    });

    it("should map abbreviated month names to 3-letter codes", () => {
      expect(MONTH_MAP.jan).toBe("Jan");
      expect(MONTH_MAP.feb).toBe("Feb");
      expect(MONTH_MAP.mar).toBe("Mar");
      expect(MONTH_MAP.apr).toBe("Apr");
      expect(MONTH_MAP.june).toBe("Jun");
      expect(MONTH_MAP.jun).toBe("Jun");
      expect(MONTH_MAP.july).toBe("Jul");
      expect(MONTH_MAP.jul).toBe("Jul");
      expect(MONTH_MAP.august).toBe("Aug");
      expect(MONTH_MAP.aug).toBe("Aug");
      expect(MONTH_MAP.september).toBe("Sep");
      expect(MONTH_MAP.sept).toBe("Sep");
      expect(MONTH_MAP.sep).toBe("Sep");
      expect(MONTH_MAP.october).toBe("Oct");
      expect(MONTH_MAP.oct).toBe("Oct");
      expect(MONTH_MAP.november).toBe("Nov");
      expect(MONTH_MAP.nov).toBe("Nov");
      expect(MONTH_MAP.december).toBe("Dec");
      expect(MONTH_MAP.dec).toBe("Dec");
    });
  });

  describe("mapMonthToApiValue", () => {
    describe("Full month names", () => {
      it("should convert full month name to API format (January)", () => {
        expect(mapMonthToApiValue("january")).toBe("Jan");
      });

      it("should convert full month name to API format (February)", () => {
        expect(mapMonthToApiValue("february")).toBe("Feb");
      });

      it("should convert full month name to API format (March)", () => {
        expect(mapMonthToApiValue("march")).toBe("Mar");
      });

      it("should convert full month name to API format (April)", () => {
        expect(mapMonthToApiValue("april")).toBe("Apr");
      });

      it("should convert full month name to API format (May)", () => {
        expect(mapMonthToApiValue("may")).toBe("May");
      });

      it("should convert full month name to API format (June)", () => {
        expect(mapMonthToApiValue("june")).toBe("Jun");
      });

      it("should convert full month name to API format (July)", () => {
        expect(mapMonthToApiValue("july")).toBe("Jul");
      });

      it("should convert full month name to API format (August)", () => {
        expect(mapMonthToApiValue("august")).toBe("Aug");
      });

      it("should convert full month name to API format (September)", () => {
        expect(mapMonthToApiValue("september")).toBe("Sep");
      });

      it("should convert full month name to API format (October)", () => {
        expect(mapMonthToApiValue("october")).toBe("Oct");
      });

      it("should convert full month name to API format (November)", () => {
        expect(mapMonthToApiValue("november")).toBe("Nov");
      });

      it("should convert full month name to API format (December)", () => {
        expect(mapMonthToApiValue("december")).toBe("Dec");
      });
    });

    describe("Abbreviated month names - 3 letters", () => {
      it("should convert abbreviated month Jan", () => {
        expect(mapMonthToApiValue("jan")).toBe("Jan");
      });

      it("should convert abbreviated month Feb", () => {
        expect(mapMonthToApiValue("feb")).toBe("Feb");
      });

      it("should convert abbreviated month Mar", () => {
        expect(mapMonthToApiValue("mar")).toBe("Mar");
      });

      it("should convert abbreviated month Apr", () => {
        expect(mapMonthToApiValue("apr")).toBe("Apr");
      });

      it("should convert abbreviated month Oct", () => {
        expect(mapMonthToApiValue("oct")).toBe("Oct");
      });

      it("should convert abbreviated month Nov", () => {
        expect(mapMonthToApiValue("nov")).toBe("Nov");
      });

      it("should convert abbreviated month Dec", () => {
        expect(mapMonthToApiValue("dec")).toBe("Dec");
      });
    });

    describe("Alternative abbreviated month names", () => {
      it("should convert Sept (September alternative)", () => {
        expect(mapMonthToApiValue("sept")).toBe("Sep");
      });

      it("should convert Sep (September alternative)", () => {
        expect(mapMonthToApiValue("sep")).toBe("Sep");
      });

      it("should convert Jun (June alternative)", () => {
        expect(mapMonthToApiValue("jun")).toBe("Jun");
      });

      it("should convert Jul (July alternative)", () => {
        expect(mapMonthToApiValue("jul")).toBe("Jul");
      });

      it("should convert Aug (August alternative)", () => {
        expect(mapMonthToApiValue("aug")).toBe("Aug");
      });
    });

    describe("Case insensitivity", () => {
      it("should convert uppercase month names", () => {
        expect(mapMonthToApiValue("JANUARY")).toBe("Jan");
      });

      it("should convert mixed case month names", () => {
        expect(mapMonthToApiValue("January")).toBe("Jan");
        expect(mapMonthToApiValue("FeBrUaRy")).toBe("Feb");
        expect(mapMonthToApiValue("MaRcH")).toBe("Mar");
      });

      it("should convert uppercase abbreviated names", () => {
        expect(mapMonthToApiValue("JAN")).toBe("Jan");
        expect(mapMonthToApiValue("FEB")).toBe("Feb");
        expect(mapMonthToApiValue("DEC")).toBe("Dec");
      });

      it("should convert mixed case abbreviated names", () => {
        expect(mapMonthToApiValue("Jan")).toBe("Jan");
        expect(mapMonthToApiValue("jAn")).toBe("Jan");
      });
    });

    describe("Whitespace handling", () => {
      it("should trim leading whitespace", () => {
        expect(mapMonthToApiValue("  january")).toBe("Jan");
      });

      it("should trim trailing whitespace", () => {
        expect(mapMonthToApiValue("january  ")).toBe("Jan");
      });

      it("should trim both leading and trailing whitespace", () => {
        expect(mapMonthToApiValue("  january  ")).toBe("Jan");
      });

      it("should trim whitespace with abbreviated names", () => {
        expect(mapMonthToApiValue("  jan  ")).toBe("Jan");
      });
    });

    describe("Null and undefined handling", () => {
      it("should return null for null input", () => {
        expect(mapMonthToApiValue(null)).toBeNull();
      });

      it("should return null for undefined input", () => {
        expect(mapMonthToApiValue(undefined)).toBeNull();
      });

      it("should return null for empty string", () => {
        expect(mapMonthToApiValue("")).toBeNull();
      });

      it("should return the original value for whitespace-only string", () => {
        expect(mapMonthToApiValue("   ")).toBe("   ");
      });
    });

    describe("Unknown month handling - fallback to original", () => {
      it("should return original value for unknown month name", () => {
        expect(mapMonthToApiValue("invalid")).toBe("invalid");
      });

      it("should return original value for random string", () => {
        expect(mapMonthToApiValue("notamonth")).toBe("notamonth");
      });

      it("should return original value with whitespace intact", () => {
        expect(mapMonthToApiValue("  unknown  ")).toBe("  unknown  ");
      });

      it("should return original value for numeric string not in map", () => {
        expect(mapMonthToApiValue("13")).toBe("13");
      });

      it("should preserve original case when returning unknown month", () => {
        expect(mapMonthToApiValue("Unknown")).toBe("Unknown");
      });
    });

    describe("Edge cases", () => {
      it("should handle string with special characters", () => {
        expect(mapMonthToApiValue("jan@")).toBe("jan@");
      });

      it("should handle numeric strings", () => {
        expect(mapMonthToApiValue("1")).toBe("1");
        expect(mapMonthToApiValue("12")).toBe("12");
      });

      it("should not match partial month names", () => {
        expect(mapMonthToApiValue("jan1")).toBe("jan1");
      });

      it("should handle month name with extra characters", () => {
        expect(mapMonthToApiValue("januaryx")).toBe("januaryx");
      });
    });

    describe("API format consistency", () => {
      it("all valid months should return 3-letter API format", () => {
        const validMonths = [
          "january",
          "february",
          "march",
          "april",
          "may",
          "june",
          "july",
          "august",
          "september",
          "october",
          "november",
          "december",
        ];

        validMonths.forEach((month) => {
          const result = mapMonthToApiValue(month);
          expect(result).toMatch(/^[A-Z][a-z]{2}$/);
        });
      });

      it("all abbreviated inputs should normalize to 3-letter format", () => {
        const inputs = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

        inputs.forEach((input) => {
          const result = mapMonthToApiValue(input);
          expect(result).toMatch(/^[A-Z][a-z]{2}$/);
        });
      });
    });

    describe("Type coercion safety", () => {
      it("should handle month values that come from string conversion", () => {
        expect(mapMonthToApiValue(String("january"))).toBe("Jan");
      });

      it("should maintain lowercase conversion before lookup", () => {
        const mixed = "JaNuArY";
        expect(mapMonthToApiValue(mixed)).toBe("Jan");
      });
    });
  });
});
