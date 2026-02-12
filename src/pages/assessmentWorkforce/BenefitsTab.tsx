import { useState } from "react";
import { RadioButton, RadioGroup } from "@/components/base/radio-buttons/radio-buttons";
import { Select } from "@/components/base/select/select";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import type { SelectItemType } from "@/components/base/select/select";
import { Label } from "@/components/base/input/label";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { InfoCircle } from "@untitledui/icons";

// Month options for enrollment period
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

// Retirement provider options
const retirementProviders: SelectItemType[] = [
  { id: "fidelity", label: "Fidelity" },
  { id: "vanguard", label: "Vanguard" },
  { id: "schwab", label: "Charles Schwab" },
  { id: "empower", label: "Empower" },
  { id: "principal", label: "Principal" },
  { id: "other", label: "Other" },
];

export default function BenefitsTab() {
  // Benefits section state
  const [worksBenefitsBroker, setWorksBenefitsBroker] = useState("");
  const [brokerName, setBrokerName] = useState("");

  // Retirement section state
  const [offersRetirement, setOffersRetirement] = useState("");
  const [retirementProvider, setRetirementProvider] = useState("");
  const [enrollmentPercentage, setEnrollmentPercentage] = useState("");
  const [employerMatch, setEmployerMatch] = useState("");
  const [employerMatchPercentage, setEmployerMatchPercentage] = useState("");
  const [vestingPeriod, setVestingPeriod] = useState("");
  const [autoEnroll, setAutoEnroll] = useState("");
  const [hardshipWithdrawals, setHardshipWithdrawals] = useState("");
  const [hardshipWithdrawalsPercentage, setHardshipWithdrawalsPercentage] = useState("");

  // Healthcare section state
  const [offersHealthcare, setOffersHealthcare] = useState("");
  const [monthlyPremium, setMonthlyPremium] = useState("");
  const [insuranceType, setInsuranceType] = useState("");
  const [dontParticipate, setDontParticipate] = useState("");
  const [employeeOnly, setEmployeeOnly] = useState("");
  const [employeeSpouse, setEmployeeSpouse] = useState("");
  const [employeeChildren, setEmployeeChildren] = useState("");
  const [employeeFamily, setEmployeeFamily] = useState("");

  const healthcarePlanOptions: SelectItemType[] = [
    { id: "hmo", label: "HMO" },
    { id: "ppo", label: "PPO" },
    { id: "epo", label: "EPO" },
    { id: "pos", label: "POS" },
    { id: "hdhp", label: "HDHP" },
  ];

  return (
    <div className="flex w-full flex-col gap-8">
      {/* Benefits Section */}
      <div className="flex w-full flex-col gap-6 rounded-xl border border-ws-gray-50 bg-ws-white px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-medium leading-9.5 text-ws-black-90">Benefits</h2>
          <p className=" text-base leading-6 text-ws-gray-100">
            To understand what gaps may exist in your current benefits offerings, please select all
            relevant options that you currently offer.
          </p>
        </div>

        {/* Questions Container */}
        <div className="flex w-full flex-col gap-6">
          {/* Question 1 */}
          <div className="flex w-full flex-col gap-2">
            <Label>
              1. Do you currently offer any of the following supplemental benefits to your
              employees?
            </Label>

            <div className="flex w-full flex-col gap-4">
              {/* Retirement and Savings */}
              <p className="text-sm font-medium leading-5 text-black">Retirement and Savings</p>

              <div className="flex flex-col gap-4">
                <Checkbox label="Earned Wage Access" />

                <Checkbox label="Loans for employees" />

                <Checkbox label="Employee hardship grants" />

                <Checkbox label="Financial coaching and/or education" />

                <Checkbox label="Emergency savings benefits" />

                <Checkbox label="Education support (e.g. tuition reimbursement)" />

                <Checkbox label="Student loan support" />

                <Checkbox label="Credit building services" />
                <Checkbox label="Retirement account migration and consolidation" />
              </div>

              {/* Health and Wellness */}
              <p className="text-sm font-medium leading-5 text-black">Health and Wellness</p>

              <div className="flex flex-col gap-4">
                <Checkbox label="Medical expense assistance" />

                <Checkbox label="Mental health support" />

                <Checkbox label="Care navigation services" />
              </div>

              {/* Other Supplemental Benefits */}
              <p className="text-sm font-medium leading-5 text-black">
                Other Supplemental Benefits
              </p>

              <div className="flex flex-col gap-4">
                <Checkbox label="Workplace benefits navigation" />

                <Checkbox label="Employer Assistance Program (EAP)" />

                <Checkbox label="Other (option for written answer if this is selected)" />

                <Checkbox label="Unsure" />

                <Checkbox label="My company does not offer any supplemental benefits." />
              </div>
            </div>
          </div>

          {/* Question 3 - Benefits Broker */}
          <div className="flex w-full flex-col gap-2">
            <Label isRequired className="text-base">
              3. Do you work with a benefits broker?
            </Label>
            <RadioGroup
              aria-label="Benefits broker"
              value={worksBenefitsBroker}
              onChange={setWorksBenefitsBroker}
            >
              <div className="flex w-full flex-col gap-4">
                <RadioButton label="Yes" value="yes" />
                {worksBenefitsBroker === "yes" && (
                  <div className="flex w-80 flex-col gap-1.5 pl-6">
                    <Label className="text-sm font-medium text-ws-black-20">
                      If yes, please provide your broker name
                    </Label>
                    <Input
                      size="md"
                      placeholder="Enter broker name"
                      value={brokerName}
                      onChange={setBrokerName}
                    />
                  </div>
                )}
                <RadioButton label="No" value="no" />
                <RadioButton label="Unsure" value="unsure" />
              </div>
            </RadioGroup>
          </div>

          {/* Question 4 - Enrollment Period */}
          <div className="flex w-full flex-col gap-2">
            <Label>4. When is your benefits enrollment period?</Label>

            <div className="w-80">
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
          </div>
        </div>
      </div>

      {/* Retirement Section */}
      <div className="flex w-full flex-col gap-6 rounded-xl border border-ws-gray-50 bg-ws-white px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium leading-8 text-ws-black-90">Retirement</h2>
          <div className="h-px w-full bg-gray-300" />
        </div>

        {/* Questions Container */}
        <div className="flex w-full flex-col gap-6">
          {/* Question 1 */}
          <div className="flex w-full flex-col gap-2">
            <Label isRequired className="text-base">
              1. Do you offer a company-sponsored retirement benefit to your workers?
            </Label>
            <RadioGroup
              aria-label="Retirement benefit"
              value={offersRetirement}
              onChange={setOffersRetirement}
            >
              <div className="flex w-full flex-col gap-4">
                <RadioButton label="Yes" value="yes" />
                <RadioButton label="No" value="no" />
              </div>
            </RadioGroup>
          </div>

          {/* Question 2 */}
          <div className="flex w-full flex-col gap-2">
            <Label isRequired className="text-base">
              2. Who is your retirement benefits record keeper or provider?
            </Label>

            <div className="w-80">
              <Select
                className="w-full flex items-start"
                size="md"
                placeholder="Select"
                items={retirementProviders}
                selectedKey={retirementProvider}
                onSelectionChange={key => setRetirementProvider(key as string)}
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

          {/* Question 3 */}
          <div className="flex w-full flex-col gap-2">
            <Label isRequired className="text-base">
              3. What percentage of employees do you estimate are enrolled in retirement benefits?
            </Label>
            <RadioGroup
              aria-label="Enrollment percentage"
              value={enrollmentPercentage}
              onChange={setEnrollmentPercentage}
            >
              <div className="flex w-full flex-col gap-4">
                <RadioButton label="Less than 25%" value="less25" />
                <RadioButton label="25% - 50%" value="25-50" />
                <RadioButton label="50% - 75%" value="50-75" />
                <RadioButton label="75%+" value="75plus" />
              </div>
            </RadioGroup>
          </div>

          {/* Question 4 */}
          <div className="flex w-full flex-col gap-2">
            <Label isRequired className="text-base">
              4. Does your retirement plan feature an employer match?
            </Label>
            <RadioGroup
              aria-label="Employer match"
              value={employerMatch}
              onChange={setEmployerMatch}
            >
              <div className="flex w-full flex-col gap-4">
                <RadioButton label="Yes" value="yes" />
                {employerMatch === "yes" && (
                  <div className="flex w-80 flex-col gap-1.5 pl-6">
                    <Label className="text-base font-normal text-ws-black-90">
                      If yes, What is the percentage?
                    </Label>
                    <Input
                      size="md"
                      placeholder="Enter percentage"
                      value={employerMatchPercentage}
                      onChange={setEmployerMatchPercentage}
                    />
                  </div>
                )}
                <RadioButton label="No" value="no" />
              </div>
            </RadioGroup>
          </div>

          {/* Question 5 */}
          <div className="flex w-full flex-col gap-2">
            <Label isRequired className="text-base">
              5. What is the vesting period of your business's retirement plan?
            </Label>
            <RadioGroup
              aria-label="Vesting period"
              value={vestingPeriod}
              onChange={setVestingPeriod}
            >
              <div className="flex w-full flex-col gap-4">
                <RadioButton label="6 months or less" value="6months" />
                <RadioButton label="Greater than 6 months - 1 year" value="6to12" />
                <RadioButton label="Greater than 1 year - 2 years" value="1to2" />
                <RadioButton label="Greater than 2 years - 4 years" value="2to4" />
                <RadioButton label="Greater than 4 years" value="4plus" />
              </div>
            </RadioGroup>
          </div>

          {/* Question 6 */}
          <div className="flex w-full flex-col gap-2">
            <Label isRequired className="text-base">
              6. Does your company auto-enroll employees in retirement benefits?
            </Label>
            <RadioGroup aria-label="Auto enroll" value={autoEnroll} onChange={setAutoEnroll}>
              <div className="flex w-full flex-col gap-4">
                <RadioButton label="Yes" value="yes" />
                <RadioButton label="No" value="no" />
              </div>
            </RadioGroup>
          </div>

          {/* Question 7 */}
          <div className="flex w-full flex-col gap-2">
            <Label isRequired className="text-base">
              7. Does your company's retirement plan allows for hardship withdrawals and/or loans?
            </Label>
            <RadioGroup
              aria-label="Hardship withdrawals"
              value={hardshipWithdrawals}
              onChange={setHardshipWithdrawals}
            >
              <div className="flex w-full flex-col gap-4">
                <RadioButton label="Yes" value="yes" />
                {hardshipWithdrawals === "yes" && (
                  <div className="flex w-full flex-col gap-1.5 pl-6">
                    <Label className="text-base font-normal text-ws-black-90">
                      If yes, What is the percentage?
                    </Label>
                    <Input
                      size="md"
                      placeholder="Enter percentage"
                      value={hardshipWithdrawalsPercentage}
                      onChange={setHardshipWithdrawalsPercentage}
                    />
                  </div>
                )}
                <RadioButton label="No" value="no" />
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Healthcare Section */}
      <div className="flex w-full flex-col gap-6 rounded-xl border border-ws-gray-50 bg-ws-white px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium leading-8 text-ws-black-90">Healthcare</h2>
          <div className="h-px w-full bg-gray-300" />
        </div>

        {/* Questions Container */}
        <div className="flex w-full flex-col gap-6">
          {/* Question 1 */}
          <div className="flex w-full flex-col gap-2">
            <Label isRequired className="text-base">
              1. Does your company offer a company-sponsored healthcare insurance benefit to your
              workers?
            </Label>
            <RadioGroup
              aria-label="Healthcare benefit"
              value={offersHealthcare}
              onChange={setOffersHealthcare}
            >
              <div className="flex w-full flex-col gap-4">
                <RadioButton label="Yes" value="yes" />
                {offersHealthcare === "yes" && (
                  <div className="flex w-full flex-col gap-1.5 px-6">
                    <Label className="text-sm font-medium text-ws-black-20">
                      if yes, What types of healthcare plans does your company offer?
                    </Label>
                    <div className="w-full">
                      <Select
                        className="w-full flex items-start"
                        size="md"
                        placeholder="Select healthcare plans"
                        items={healthcarePlanOptions}
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
                )}
                <RadioButton label="No" value="no" />
              </div>
            </RadioGroup>
          </div>

          {/* Question 2 */}
          <div className="flex w-full flex-col gap-2">
            <Label isRequired className="text-base">
              2. What is the employee-only monthly premium for the lowest-cost health plan your
              company offers?
            </Label>
            <div className="flex w-80 flex-col gap-1.5 px-6">
              <Input
                size="md"
                placeholder="Enter amount"
                value={monthlyPremium}
                onChange={setMonthlyPremium}
              />
              <p className="text-sm leading-5 text-ws-black-10">i.e. $300</p>
            </div>
          </div>

          {/* Question 3 */}
          <div className="flex w-full flex-col gap-2">
            <Label className="text-base">
              3. Are your healthcare benefit plans fully insured or self-insured?
            </Label>
            <RadioGroup
              aria-label="Insurance type"
              value={insuranceType}
              onChange={setInsuranceType}
            >
              <div className="flex w-full flex-col gap-4">
                <RadioButton label="Fully insured (Traditional Group Plans)" value="fully" />
                <RadioButton label="Self Insured (Group Health Insurance )" value="self" />
              </div>
            </RadioGroup>
          </div>

          {/* Question 4 */}
          <div className="flex w-full flex-col gap-2">
            <Label>
              4. Please select any of the following reimbursement arrangements you utilize:
            </Label>

            <div className="flex flex-col gap-4">
              <Checkbox label="Individual Coverage Health Reimbursement Accounts (ICHRA)" />

              <Checkbox label="Qualified Small Employer Health Reimbursement Arrangements (QSEHRA)" />

              <Checkbox label="Other" />
            </div>
          </div>

          {/* Question 5 - Multi-form with percentage inputs */}
          <div className="flex w-full flex-col gap-4">
            <Label>5. What percentage of employees participate in the following:</Label>
            {/* Don't participate */}
            <div className="flex w-full items-start gap-4">
              <div className="flex w-84.75 items-center gap-2 px-3 py-2">
                <p className="overflow-hidden text-ellipsis text-base font-medium leading-6 text-gray-800 flex items-center gap-3">
                  Don't participate
                  <Tooltip title="This is a tooltip">
                    <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                      <InfoCircle className="size-5 text-ws-gray-70" />
                    </TooltipTrigger>
                  </Tooltip>
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Input
                  size="md"
                  placeholder="Percentage"
                  value={dontParticipate}
                  className="flex-1"
                  onChange={setDontParticipate}
                />
                <p className="text-sm leading-5 text-ws-black-10">i.e. 30%</p>
              </div>
            </div>

            {/* Employee only */}
            <div className="flex w-full items-start gap-4">
              <div className="flex w-84.75 items-center gap-2 px-3 py-2">
                <p className="overflow-hidden text-ellipsis text-base font-medium leading-6 text-gray-800 flex items-center gap-3">
                  Employee only
                  <Tooltip title="This is a tooltip">
                    <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                      <InfoCircle className="size-5 text-ws-gray-70" />
                    </TooltipTrigger>
                  </Tooltip>
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Input
                  size="md"
                  placeholder="Percentage"
                  className="flex-1"
                  value={employeeOnly}
                  onChange={setEmployeeOnly}
                />
                <p className="text-sm leading-5 text-ws-black-10">i.e. 30%</p>
              </div>
            </div>

            {/* Employee + Spouse/Domestic Partner */}
            <div className="flex w-full items-start gap-4">
              <div className="flex w-84.75 items-center gap-2 px-3 py-2">
                <p className="overflow-hidden text-ellipsis text-base font-medium leading-6 text-gray-800 flex items-center gap-3">
                  Employee + Spouse/Domestic Partner
                  <Tooltip title="This is a tooltip">
                    <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                      <InfoCircle className="size-5 text-ws-gray-70" />
                    </TooltipTrigger>
                  </Tooltip>
                </p>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <Input
                  size="md"
                  placeholder="Percentage"
                  value={employeeSpouse}
                  onChange={setEmployeeSpouse}
                />
                <p className="text-sm leading-5 text-ws-black-10">i.e. 30%</p>
              </div>
            </div>

            {/* Employee + Children */}
            <div className="flex w-full items-start gap-4">
              <div className="flex w-84.75 items-center gap-2 px-3 py-2">
                <p className="overflow-hidden text-ellipsis text-base font-medium leading-6 text-gray-800 flex items-center gap-3">
                  Employee + Children
                  <Tooltip title="This is a tooltip">
                    <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                      <InfoCircle className="size-5 text-ws-gray-70" />
                    </TooltipTrigger>
                  </Tooltip>
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Input
                  size="md"
                  placeholder="Percentage"
                  className="flex-1"
                  value={employeeChildren}
                  onChange={setEmployeeChildren}
                />
                <p className="text-sm leading-5 text-ws-black-10">i.e. 30%</p>
              </div>
            </div>

            {/* Employee + Family (not spouse) */}
            <div className="flex w-full items-start gap-4">
              <div className="flex w-84.75 items-center gap-2 px-3 py-2">
                <p className="overflow-hidden text-ellipsis text-base font-medium leading-6 text-gray-800 flex items-center gap-3">
                  Employee + Family (not spouse)
                  <Tooltip title="This is a tooltip">
                    <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                      <InfoCircle className="size-5 text-ws-gray-70" />
                    </TooltipTrigger>
                  </Tooltip>
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Input
                  size="md"
                  placeholder="Percentage"
                  className="flex-1"
                  value={employeeFamily}
                  onChange={setEmployeeFamily}
                />
                <p className="text-sm leading-5 text-ws-black-10">i.e. 30%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
