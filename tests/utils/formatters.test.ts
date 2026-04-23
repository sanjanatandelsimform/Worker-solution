/**
 * Formatter Utility Tests
 *
 * Comprehensive unit tests for all number and currency formatters.
 * Covers: formatNumber, formatCurrency, formatCurrencyWithCents, formatPercentage,
 * formatCompactNumber, formatEmployerCostPerYear, formatToTwoDecimalPlaces
 */

import { describe, it, expect } from "vitest";
import {
  formatNumber,
  formatCurrency,
  formatCurrencyWithCents,
  formatPercentage,
  formatCompactNumber,
  formatEmployerCostPerYear,
  formatToTwoDecimalPlaces,
} from "@/utils/formatters";

describe("formatters", () => {
  describe("formatNumber", () => {
    it("should format a basic number with thousand separator", () => {
      expect(formatNumber(1250)).toBe("1,250");
    });

    it("should format a large number with thousand separators", () => {
      expect(formatNumber(1000000)).toBe("1,000,000");
    });

    it("should format a small number without separator", () => {
      expect(formatNumber(999)).toBe("999");
    });

    it("should handle zero", () => {
      expect(formatNumber(0)).toBe("0");
    });

    it("should handle negative numbers", () => {
      expect(formatNumber(-1250)).toBe("-1,250");
    });

    it("should handle decimal numbers", () => {
      expect(formatNumber(1250.5)).toBe("1,250.5");
    });

    it("should handle very large numbers", () => {
      expect(formatNumber(9999999999)).toBe("9,999,999,999");
    });

    it("should return N/A for null", () => {
      expect(formatNumber(null)).toBe("N/A");
    });

    it("should return N/A for undefined", () => {
      expect(formatNumber(undefined)).toBe("N/A");
    });
  });

  describe("formatCurrency", () => {
    it("should format a number as currency without cents", () => {
      expect(formatCurrency(52000)).toBe("$52,000");
    });

    it("should format a small currency value", () => {
      expect(formatCurrency(100)).toBe("$100");
    });

    it("should format zero as currency", () => {
      expect(formatCurrency(0)).toBe("$0");
    });

    it("should format negative currency", () => {
      expect(formatCurrency(-5000)).toBe("-$5,000");
    });

    it("should round down decimal values", () => {
      expect(formatCurrency(1234.56)).toBe("$1,235");
    });

    it("should format very large currency amounts", () => {
      expect(formatCurrency(1000000)).toBe("$1,000,000");
    });

    it("should handle one dollar", () => {
      expect(formatCurrency(1)).toBe("$1");
    });

    it("should return N/A for null", () => {
      expect(formatCurrency(null)).toBe("N/A");
    });

    it("should return N/A for undefined", () => {
      expect(formatCurrency(undefined)).toBe("N/A");
    });
  });

  describe("formatCurrencyWithCents", () => {
    it("should format currency with 2 decimal places", () => {
      expect(formatCurrencyWithCents(18.5)).toBe("$18.50");
    });

    it("should format currency with zero cents", () => {
      expect(formatCurrencyWithCents(20)).toBe("$20.00");
    });

    it("should format currency with 1 decimal place", () => {
      expect(formatCurrencyWithCents(15.5)).toBe("$15.50");
    });

    it("should format large currency with cents", () => {
      expect(formatCurrencyWithCents(1234567.89)).toBe("$1,234,567.89");
    });

    it("should format zero with cents", () => {
      expect(formatCurrencyWithCents(0)).toBe("$0.00");
    });

    it("should format negative currency with cents", () => {
      expect(formatCurrencyWithCents(-100.50)).toBe("-$100.50");
    });

    it("should round decimals properly", () => {
      expect(formatCurrencyWithCents(10.125)).toBe("$10.13");
    });

    it("should handle very small amounts", () => {
      expect(formatCurrencyWithCents(0.01)).toBe("$0.01");
    });

    it("should return N/A for null", () => {
      expect(formatCurrencyWithCents(null)).toBe("N/A");
    });

    it("should return N/A for undefined", () => {
      expect(formatCurrencyWithCents(undefined)).toBe("N/A");
    });
  });

  describe("formatPercentage", () => {
    it("should format percentage with default 1 decimal place", () => {
      expect(formatPercentage(22.5)).toBe("22.5%");
    });

    it("should format percentage with custom decimals", () => {
      expect(formatPercentage(18.24567, 2)).toBe("18.25%");
    });

    it("should format percentage with zero decimals", () => {
      expect(formatPercentage(22.5, 0)).toBe("22%");
    });

    it("should format whole number as percentage", () => {
      expect(formatPercentage(50)).toBe("50.0%");
    });

    it("should format zero percentage", () => {
      expect(formatPercentage(0)).toBe("0.0%");
    });

    it("should format negative percentage", () => {
      expect(formatPercentage(-10.5)).toBe("-10.5%");
    });

    it("should format very large percentage", () => {
      expect(formatPercentage(99.999)).toBe("100.0%");
    });

    it("should format very small percentage", () => {
      expect(formatPercentage(0.001, 3)).toBe("0.001%");
    });

    it("should handle 3 decimal places", () => {
      expect(formatPercentage(33.3333, 3)).toBe("33.333%");
    });

    it("should return N/A for null", () => {
      expect(formatPercentage(null)).toBe("N/A");
    });

    it("should return N/A for undefined", () => {
      expect(formatPercentage(undefined)).toBe("N/A");
    });

    it("should return N/A for null with custom decimals", () => {
      expect(formatPercentage(null, 2)).toBe("N/A");
    });
  });

  describe("formatCompactNumber", () => {
    it("should format millions", () => {
      expect(formatCompactNumber(1500000)).toBe("1.5M");
    });

    it("should format thousands", () => {
      expect(formatCompactNumber(2500)).toBe("2.5K");
    });

    it("should format large millions", () => {
      expect(formatCompactNumber(150000000)).toBe("150M");
    });

    it("should format billions", () => {
      expect(formatCompactNumber(2500000000)).toBe("2.5B");
    });

    it("should handle exact thousands", () => {
      expect(formatCompactNumber(1000)).toBe("1K");
    });

    it("should handle exact millions", () => {
      expect(formatCompactNumber(1000000)).toBe("1M");
    });

    it("should handle numbers less than thousand", () => {
      expect(formatCompactNumber(500)).toBe("500");
    });

    it("should handle zero", () => {
      expect(formatCompactNumber(0)).toBe("0");
    });

    it("should handle negative numbers", () => {
      expect(formatCompactNumber(-1500000)).toBe("-1.5M");
    });

    it("should return N/A for null", () => {
      expect(formatCompactNumber(null)).toBe("N/A");
    });

    it("should return N/A for undefined", () => {
      expect(formatCompactNumber(undefined)).toBe("N/A");
    });
  });

  describe("formatEmployerCostPerYear", () => {
    it("should format employer cost with thousand separator", () => {
      expect(formatEmployerCostPerYear(11240)).toBe("$11,240/yr");
    });

    it("should format zero cost", () => {
      expect(formatEmployerCostPerYear(0)).toBe("$0/yr");
    });

    it("should format small costs", () => {
      expect(formatEmployerCostPerYear(100)).toBe("$100/yr");
    });

    it("should format large costs", () => {
      expect(formatEmployerCostPerYear(500000)).toBe("$500,000/yr");
    });

    it("should format costs with decimal separator", () => {
      expect(formatEmployerCostPerYear(1234567)).toBe("$1,234,567/yr");
    });

    it("should return -- for null", () => {
      expect(formatEmployerCostPerYear(null)).toBe("--");
    });

    it("should return -- for undefined", () => {
      expect(formatEmployerCostPerYear(undefined)).toBe("--");
    });

    it("should return -- for negative values", () => {
      expect(formatEmployerCostPerYear(-500)).toBe("--");
    });

    it("should return -- for very negative values", () => {
      expect(formatEmployerCostPerYear(-1000000)).toBe("--");
    });

    it("should distinguish 0 (valid) from null (invalid)", () => {
      expect(formatEmployerCostPerYear(0)).not.toBe("--");
      expect(formatEmployerCostPerYear(null)).toBe("--");
    });
  });

  describe("formatToTwoDecimalPlaces", () => {
    it("should format number to two decimal places", () => {
      expect(formatToTwoDecimalPlaces(10.5)).toBe("10.50");
    });

    it("should format integer with two zeros", () => {
      expect(formatToTwoDecimalPlaces(20)).toBe("20.00");
    });

    it("should format number with many decimals", () => {
      expect(formatToTwoDecimalPlaces(10.12345)).toBe("10.12");
    });

    it("should round properly", () => {
      expect(formatToTwoDecimalPlaces(10.126)).toBe("10.13");
    });

    it("should format zero", () => {
      expect(formatToTwoDecimalPlaces(0)).toBe("0.00");
    });

    it("should format negative number", () => {
      expect(formatToTwoDecimalPlaces(-5.5)).toBe("-5.50");
    });

    it("should format very large number", () => {
      expect(formatToTwoDecimalPlaces(999999.99)).toBe("999999.99");
    });

    it("should format very small number", () => {
      expect(formatToTwoDecimalPlaces(0.01)).toBe("0.01");
    });

    it("should handle one decimal place", () => {
      expect(formatToTwoDecimalPlaces(5.5)).toBe("5.50");
    });

    it("should return N/A for null", () => {
      expect(formatToTwoDecimalPlaces(null)).toBe("N/A");
    });

    it("should return N/A for undefined", () => {
      expect(formatToTwoDecimalPlaces(undefined)).toBe("N/A");
    });
  });

  describe("Integration tests - consistent error handling", () => {
    it("all formatters should return N/A or -- for null values", () => {
      const nullResult = {
        formatNumber: formatNumber(null),
        formatCurrency: formatCurrency(null),
        formatCurrencyWithCents: formatCurrencyWithCents(null),
        formatPercentage: formatPercentage(null),
        formatCompactNumber: formatCompactNumber(null),
        formatEmployerCostPerYear: formatEmployerCostPerYear(null),
        formatToTwoDecimalPlaces: formatToTwoDecimalPlaces(null),
      };

      expect(nullResult.formatNumber).toBe("N/A");
      expect(nullResult.formatCurrency).toBe("N/A");
      expect(nullResult.formatCurrencyWithCents).toBe("N/A");
      expect(nullResult.formatPercentage).toBe("N/A");
      expect(nullResult.formatCompactNumber).toBe("N/A");
      expect(nullResult.formatEmployerCostPerYear).toBe("--");
      expect(nullResult.formatToTwoDecimalPlaces).toBe("N/A");
    });

    it("all formatters should handle zero appropriately", () => {
      const zeroResult = {
        formatNumber: formatNumber(0),
        formatCurrency: formatCurrency(0),
        formatCurrencyWithCents: formatCurrencyWithCents(0),
        formatPercentage: formatPercentage(0),
        formatCompactNumber: formatCompactNumber(0),
        formatEmployerCostPerYear: formatEmployerCostPerYear(0),
        formatToTwoDecimalPlaces: formatToTwoDecimalPlaces(0),
      };

      expect(zeroResult.formatNumber).toBe("0");
      expect(zeroResult.formatCurrency).toBe("$0");
      expect(zeroResult.formatCurrencyWithCents).toBe("$0.00");
      expect(zeroResult.formatPercentage).toBe("0.0%");
      expect(zeroResult.formatCompactNumber).toBe("0");
      expect(zeroResult.formatEmployerCostPerYear).toBe("$0/yr");
      expect(zeroResult.formatToTwoDecimalPlaces).toBe("0.00");
    });

    it("all formatters except formatEmployerCostPerYear should handle negative values", () => {
      const negativeValue = -100;

      expect(formatNumber(negativeValue)).toContain("-");
      expect(formatCurrency(negativeValue)).toContain("-");
      expect(formatCurrencyWithCents(negativeValue)).toContain("-");
      expect(formatPercentage(negativeValue)).toContain("-");
      expect(formatCompactNumber(negativeValue)).toContain("-");
      expect(formatToTwoDecimalPlaces(negativeValue)).toContain("-");

      // formatEmployerCostPerYear returns -- for negative
      expect(formatEmployerCostPerYear(negativeValue)).toBe("--");
    });
  });
});
