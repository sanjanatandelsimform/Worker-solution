import React from "react";

export interface IndustryOption {
  id: string;
  label: string;
  supportingText?: string;
  isDisabled?: boolean;
  icon?: React.FC | React.ReactNode;
  avatarUrl?: string;
}

export interface CountryCodeOption {
  label: string;
  value: string;
}

export const COUNTRY_CODES: CountryCodeOption[] = [
  { label: "US +1", value: "US" },
  { label: "UK +44", value: "UK" },
  { label: "IN +91", value: "IN" },
  { label: "CA +1", value: "CA" },
  { label: "AU +61", value: "AU" },
  { label: "DE +49", value: "DE" },
  { label: "FR +33", value: "FR" },
  { label: "JP +81", value: "JP" },
  { label: "CN +86", value: "CN" },
];
