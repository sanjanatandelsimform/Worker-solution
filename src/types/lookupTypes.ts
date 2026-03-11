/**
 * TypeScript types for the Zip Code Lookup API.
 *
 * These types model the response from `GET /api/v1/lookup/zip-codes?search={query}&limit=5`.
 * Used by `lookupZipCodes()` in assessmentApi.ts and by the
 * `ZipCodeAutocomplete` component.
 *
 * @see specs/001-zipcode-api-integration/contracts/zipcode-lookup-api.yaml
 * @see specs/001-zipcode-api-integration/data-model.md
 */

/** A single zip code result returned by the lookup API. */
export interface ZipCodeSuggestion {
  /** 5-digit US zip code (e.g. "39401") */
  zip: string;
  /** Full state name (e.g. "Mississippi") */
  stateName: string;
  /** 2-letter state abbreviation (e.g. "MS") */
  stateAbbreviation: string;
  /** State FIPS code (e.g. "28") */
  stateFips: string;
}

/** Pagination metadata (informational — not consumed by the UI). */
export interface Pagination {
  /** Current page number */
  page: number;
  /** Results per page */
  limit: number;
  /** Total matching records */
  totalRecords: number;
  /** Total pages available */
  totalPages: number;
}

/** Top-level response envelope from the zip code lookup endpoint. */
export interface ZipCodeLookupResponse {
  /** Whether the request succeeded */
  success: boolean;
  /** Payload containing zip code results and pagination */
  data: {
    zipCodes: ZipCodeSuggestion[];
    pagination: Pagination;
  };
  /** Human-readable status message */
  message: string;
}
