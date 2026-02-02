import { useState } from "react";
import { RadioButton, RadioGroup } from "@/components/base/radio-buttons/radio-buttons";
import { Select } from "@/components/base/select/select";
import type { SelectItemType } from "@/components/base/select/select";

// Payroll provider options
const payrollProviders: SelectItemType[] = [
  { id: "adp", label: "ADP" },
  { id: "paychex", label: "Paychex" },
  { id: "paycom", label: "Paycom" },
  { id: "paylocity", label: "Paylocity" },
  { id: "gusto", label: "Gusto" },
  { id: "quickbooks", label: "QuickBooks Payroll" },
  { id: "trinet", label: "TriNet" },
  { id: "deel", label: "Deel" },
  { id: "rippling", label: "Rippling" },
  { id: "paycor", label: "Paycor" },
  { id: "square", label: "Square" },
  { id: "patriot-software", label: "Patriot Software" },
  { id: "onpay", label: "OnPay" },
  { id: "superpayroll", label: "SuperPayroll" },
  { id: "insperity", label: "Insperity" },
  { id: "other", label: "Other" },
];

// Month options for annual raises
const months: SelectItemType[] = [
  { id: "january", label: "January" },
  { id: "february", label: "February" },
  { id: "march", label: "March" },
  { id: "april", label: "April" },
  { id: "may", label: "May" },
  { id: "june", label: "June" },
  { id: "july", label: "July" },
  { id: "august", label: "August" },
  { id: "september", label: "September" },
  { id: "october", label: "October" },
  { id: "november", label: "November" },
  { id: "december", label: "December" },
];

export default function CompensationTab() {
  const [medianEarnings, setMedianEarnings] = useState("");
  const [hourlyEarnings, setHourlyEarnings] = useState("");
  const [salariedEarnings, setSalariedEarnings] = useState("");
  const [offersRaises, setOffersRaises] = useState("");
  const [handlesPayrollInHouse, setHandlesPayrollInHouse] = useState("");

  return (
    <div className="flex w-full flex-col gap-6 rounded-xl border border-gray-300 bg-white px-6 py-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-medium leading-9.5 text-gray-900">Compensation</h2>
        <p className="text-base leading-6 text-gray-500">
          Select salary that apply best to your workforce. This doesn't have to be exact.
        </p>
      </div>

      {/* Questions Container */}
      <div className="flex w-full flex-col gap-4">
        {/* Question 1 */}
        <div className="flex w-full flex-col gap-2">
          <ol className="ml-0 list-decimal pl-6" start={1}>
            <li className="text-base leading-6 text-gray-900">
              What range best describes your employees' median annual earnings?{" "}
              <span className="text-red-600">*</span>
            </li>
          </ol>
          <RadioGroup value={medianEarnings} onChange={setMedianEarnings}>
            <RadioButton value="less-30k" label="Less than $30,000" />
            <RadioButton value="30k-50k" label="$30,000 - $50,000" />
            <RadioButton value="50k-70k" label="$50,000 - $70,000" />
            <RadioButton value="75k-100k" label="$75,000 - $100,000" />
            <RadioButton value="100k-plus" label="$100,000+" />
          </RadioGroup>
        </div>

        {/* Question 2 */}
        <div className="flex w-full flex-col gap-2">
          <ol className="ml-0 list-decimal pl-6" start={2}>
            <li className="text-base leading-6 text-gray-900">
              What range best describes your HOURLY employees' median annual earnings?
            </li>
          </ol>
          <RadioGroup value={hourlyEarnings} onChange={setHourlyEarnings}>
            <RadioButton value="less-30k" label="Less than $30,000" />
            <RadioButton value="30k-50k" label="$30,000 - $50,000" />
            <RadioButton value="50k-70k" label="$50,000 - $70,000" />
            <RadioButton value="75k-100k" label="$75,000 - $100,000" />
            <RadioButton value="100k-plus" label="$100,000+" />
          </RadioGroup>
        </div>

        {/* Question 3 */}
        <div className="flex w-full flex-col gap-2">
          <ol className="ml-0 list-decimal pl-6" start={3}>
            <li className="text-base leading-6 text-gray-900">
              What range best describes your SALARIED employees' median annual earnings?
            </li>
          </ol>
          <RadioGroup value={salariedEarnings} onChange={setSalariedEarnings}>
            <RadioButton value="less-30k" label="Less than $30,000" />
            <RadioButton value="30k-50k" label="$30,000 - $50,000" />
            <RadioButton value="50k-70k" label="$50,000 - $70,000" />
            <RadioButton value="75k-100k" label="$75,000 - $100,000" />
            <RadioButton value="100k-plus" label="$100,000+" />
          </RadioGroup>
        </div>

        {/* Question 4 */}
        <div className="flex w-full flex-col gap-2">
          <ol className="ml-0 list-decimal pl-6" start={4}>
            <li className="text-base leading-6 text-gray-900">Do you offer annual raises?</li>
          </ol>
          <RadioGroup
            value={offersRaises}
            onChange={value => {
              setOffersRaises(value);
            }}
          >
            <RadioButton value="yes" label="Yes" />

            {/* Conditional question for "If yes, when?" */}
            {offersRaises === "yes" && (
              <div className="ml-6 flex w-80 flex-col gap-4">
                <p className="text-base text-gray-900">If yes, when?</p>
                <Select
                  className="w-full flex items-start"
                  size="md"
                  placeholder="Select Month"
                  items={months}
                >
                  {item => (
                    <Select.Item
                      id={item.id}
                      supportingText={item.supportingText}
                      isDisabled={item.isDisabled}
                      icon={item.icon}
                      avatarUrl={item.avatarUrl}
                    >
                      {item.label}
                    </Select.Item>
                  )}
                </Select>
              </div>
            )}

            <RadioButton value="no" label="No" />
          </RadioGroup>
        </div>

        {/* Question 5 */}
        <div className="flex w-full flex-col gap-2">
          <ol className="ml-0 list-decimal pl-6" start={5}>
            <li className="text-base leading-6 text-gray-900">
              Do you handle HR/payroll in-house?
            </li>
          </ol>
          <RadioGroup value={handlesPayrollInHouse} onChange={setHandlesPayrollInHouse}>
            <RadioButton value="yes" label="Yes" />
            <RadioButton value="no" label="No" />
            <RadioButton value="unsure" label="Unsure" />
          </RadioGroup>
        </div>

        {/* Question 6 */}
        <div className="flex w-full flex-col gap-2">
          <ol className="ml-0 list-decimal pl-6" start={6}>
            <li className="text-base leading-6 text-gray-900">
              Who is your company's payroll provider?
            </li>
          </ol>
          <div className="w-80">
            <Select
              className="w-full flex items-start"
              size="md"
              placeholder="Select payroll provider"
              items={payrollProviders}
            >
              {item => (
                <Select.Item
                  id={item.id}
                  supportingText={item.supportingText}
                  isDisabled={item.isDisabled}
                  icon={item.icon}
                  avatarUrl={item.avatarUrl}
                >
                  {item.label}
                </Select.Item>
              )}
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
