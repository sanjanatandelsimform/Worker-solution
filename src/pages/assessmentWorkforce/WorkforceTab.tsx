import { useState } from "react";
import { Plus, Trash01 } from "@untitledui/icons";
import { useListData } from "react-stately";
import { RadioButton, RadioGroup } from "@/components/base/radio-buttons/radio-buttons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import type { SelectItemType } from "@/components/base/select/select";
import { MultiSelect } from "@/components/base/select/multi-select";
import { Label } from "@/components/base/input/label";

// Helper component for location inputs
interface LocationInputProps {
  onRemove?: () => void;
  showRemoveButton: boolean;
}
// Helper component for occupation inputs with delete
interface OccupationInputProps {
  onRemove?: () => void;
  showRemoveButton: boolean;
}

function OccupationInput({ onRemove, showRemoveButton }: OccupationInputProps) {
  return (
    <div className="flex w-full gap-4 items-start">
      <div className="flex flex-col gap-1.5 w-2/3">
        <Input placeholder="Occupation" size="md" />
        <p className="text-sm leading-5 text-ws-black-10">i.e. Document Specialist</p>
      </div>
      <div className="flex flex-col gap-1.5 w-1/3">
        <Input placeholder="Percentage" size="md" />
        <p className="text-sm leading-5 text-ws-black-10">i.e. 30%</p>
      </div>
      {showRemoveButton && (
        <Button
          color="secondary"
          size="md"
          iconLeading={Trash01}
          onClick={onRemove}
          className="h-10 shrink-0 px-2 bg-ws-gray-30"
          aria-label="Remove occupation"
        />
      )}
    </div>
  );
}

export default function WorkforceTab() {
  const [workLocations, setWorkLocations] = useState([{ id: 1 }]);
  const [resideLocations, setResideLocations] = useState([{ id: 1 }]);
  const [occupations, setOccupations] = useState([{ id: 1 }]);
  const [resideSameZip, setResideSameZip] = useState<string>("");
  const [commuteMoreThan15Miles, setCommuteMoreThan15Miles] = useState<string>("");

  // Multi-select for commute methods
  const selectedCommuteMethods = useListData<SelectItemType>({
    initialItems: [],
  });

  const educationLevels: SelectItemType[] = [
    { id: "hs", label: "High School" },
    { id: "associate", label: "Associate Degree" },
    { id: "bachelor", label: "Bachelor's Degree" },
    { id: "master", label: "Master's Degree" },
    { id: "doctorate", label: "Doctorate" },
  ];

  const locationStates: SelectItemType[] = [
    { id: "california", label: "California" },
    { id: "texas", label: "Texas" },
    { id: "florida", label: "Florida" },
    { id: "new_york", label: "New York" },
    { id: "illinois", label: "Illinois" },
  ];

  const commuteMethodOptions = [
    { id: "train", label: "Train" },
    { id: "bus", label: "Bus" },
    { id: "walking", label: "Walking" },
    { id: "bike", label: "Bike" },
    { id: "car", label: "Car" },
  ];

  function LocationInput({ onRemove, showRemoveButton }: LocationInputProps) {
    return (
      <div className="flex w-full items-end gap-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <Select
            className="w-full flex items-start"
            label="State"
            size="md"
            placeholder="Select a state"
            items={locationStates}
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
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="flex gap-0.5 text-sm font-medium text-ws-black-20">
            <span>Zip Code</span>
            <span className="text-ws-red-30">*</span>
          </label>
          <Input placeholder="Zip code" size="md" />
        </div>
        {showRemoveButton && (
          <Button
            color="secondary"
            size="md"
            iconLeading={Trash01}
            onClick={onRemove}
            className="h-10 shrink-0 px-2 bg-ws-gray-30"
            aria-label="Remove location"
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 rounded-xl border border-ws-gray-50 bg-ws-white px-6 py-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-medium leading-[38px] text-ws-black-90">Workforce</h2>
        <p className="w-full max-w-[676px] text-base leading-6 text-ws-gray-100">
          We'd like to get a better understanding of your workforce and how they're structured. This
          will help us customize relevant solution providers.
        </p>
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-6">
        {/* Question 1 */}
        <div className="flex w-full flex-col gap-2">
          <Label isRequired className="text-base">
            1. Headcount size (all employees){" "}
          </Label>
          <RadioGroup aria-label="Headcount size">
            <div className="flex flex-col gap-4 text-sm">
              <RadioButton label="Less than 25 employees" value="employee25" />
              <RadioButton label="25 - 50 employees" value="employee50" />
              <RadioButton label="50 - 100 employees" value="employee100" />
              <RadioButton label="100 - 500 employees" value="employee500" />
              <RadioButton label="500 - 1000 employees" value="employee1000" />
              <RadioButton label="1000+ employees" value="employee1000plus" />
            </div>
          </RadioGroup>
        </div>

        {/* Question 2 */}
        <div className="flex w-full flex-col gap-2">
          <Label isRequired className="text-base">
            2. How do they get their benefits updates?
          </Label>
          <RadioGroup aria-label="Benefits updates">
            <div className="flex w-full flex-col gap-4">
              <RadioButton label="Work email" value="work" />
              <RadioButton label="Personal device (personal email and/or text)" value="personal" />
              <RadioButton label="Office flyer, in-office, experience" value="office" />
            </div>
          </RadioGroup>
        </div>

        {/* Question 3 */}
        <div className="flex w-full flex-col gap-2">
          <Label isRequired className="text-base">
            3. Are many employees deskless (performing job duties outside of an office
            setting)?{" "}
          </Label>
          <RadioGroup aria-label="Deskless employees">
            <div className="flex w-full max-w-[344px] flex-col gap-4">
              <RadioButton label="Yes" value="yes" />
              <RadioButton label="No" value="no" />
            </div>
          </RadioGroup>
        </div>

        {/* Question 4 */}
        <div className="flex w-full flex-col gap-2">
          <Label isRequired className="text-base">
            4. Do most employees commute more than 15 miles to work?
          </Label>
          <RadioGroup
            aria-label="Commute distance"
            value={commuteMoreThan15Miles}
            onChange={setCommuteMoreThan15Miles}
          >
            <div className="flex w-full flex-col gap-4">
              <RadioButton label="Yes" value="yes" />
              {commuteMoreThan15Miles === "yes" && (
                <div className="flex w-full flex-col gap-4 pl-6">
                  <MultiSelect
                    size="md"
                    label="If yes, select the methods they use to commute"
                    placeholder=""
                    items={commuteMethodOptions}
                    selectedItems={selectedCommuteMethods}
                    aria-label="Commute methods"
                  >
                    {item => (
                      <MultiSelect.Item id={item.id} textValue={item.label}>
                        {item.label}
                      </MultiSelect.Item>
                    )}
                  </MultiSelect>
                </div>
              )}
              <RadioButton label="No" value="no" />
            </div>
          </RadioGroup>
        </div>

        {/* Question 5 */}
        <div className="flex w-full flex-col gap-2">
          <Label isRequired className="text-base">
            5. Do independent contractors and/or seasonal employees make up a large portion (greater
            than 30%) of your workforce?{" "}
          </Label>
          <RadioGroup aria-label="Contractors and seasonal employees">
            <div className="flex w-full max-w-[344px] flex-col gap-4">
              <RadioButton label="Yes" value="yes" />
              <RadioButton label="No" value="no" />
            </div>
          </RadioGroup>
        </div>

        {/* Question 6 */}
        <div className="flex w-full flex-col gap-4 relative">
          <Label isRequired className="text-base">
            6. What are the most common job titles or functions that make up most of your workforce
            and percentage of those roles?
          </Label>
          {occupations.map(occupation => (
            <OccupationInput
              key={occupation.id}
              showRemoveButton={occupations.length > 1}
              onRemove={() => setOccupations(occupations.filter(o => o.id !== occupation.id))}
            />
          ))}
          <Button
            color="secondary"
            size="md"
            className="max-w-60"
            iconLeading={Plus}
            onClick={() => setOccupations([...occupations, { id: Date.now() }])}
          >
            Add another occupation
          </Button>
        </div>

        {/* Question 7 */}
        <div className="flex w-full flex-col gap-2">
          <Label isRequired className="text-base">
            7. Estimated % of hourly employees
          </Label>
          <div className="flex w-full">
            <Input placeholder="Percentage" size="md" className="flex-1" />
          </div>
        </div>

        {/* Question 8 */}
        <div className="flex w-full flex-col gap-2">
          <Label isRequired className="text-base">
            8. Estimated % of salary employees
          </Label>
          <div className="flex w-full">
            <Input placeholder="Percentage" size="md" className="flex-1" />
          </div>
        </div>

        {/* Question 9 */}
        <div className="flex w-full flex-col gap-2">
          <Label isRequired className="text-base">
            9. Where do your employees work from? Add up to 5
          </Label>
          <div className="flex flex-col gap-4">
            {workLocations.map(location => (
              <LocationInput
                key={location.id}
                showRemoveButton={workLocations.length > 1}
                onRemove={() =>
                  setWorkLocations(workLocations.filter(loc => loc.id !== location.id))
                }
              />
            ))}
            <Button
              color="secondary"
              size="md"
              className="max-w-60"
              iconLeading={Plus}
              onClick={() => setWorkLocations([...workLocations, { id: Date.now() }])}
            >
              Add another location
            </Button>
          </div>
        </div>

        {/* Question 10 */}
        <div className="flex w-full flex-col gap-2">
          <Label isRequired className="text-base">
            10. Do the majority of employees work in the same metro area/city/county?
          </Label>
          <RadioGroup
            aria-label="Employee residence"
            value={resideSameZip}
            onChange={setResideSameZip}
          >
            <div className="flex w-full flex-col gap-4">
              <RadioButton label="Yes" value="yes" />
              <RadioButton label="No" value="no" />
              {resideSameZip === "no" && (
                <div className="flex w-full flex-col gap-4 pl-6">
                  <p className="text-base text-ws-black-90">
                    If no, where do most of your employees reside?
                  </p>
                  {resideLocations.map(location => (
                    <LocationInput
                      key={location.id}
                      showRemoveButton={resideLocations.length > 1}
                      onRemove={() =>
                        setResideLocations(resideLocations.filter(loc => loc.id !== location.id))
                      }
                    />
                  ))}
                  <Button
                    color="secondary"
                    size="md"
                    className="max-w-60"
                    iconLeading={Plus}
                    onClick={() => setResideLocations([...resideLocations, { id: Date.now() }])}
                  >
                    Add another location
                  </Button>
                </div>
              )}
            </div>
          </RadioGroup>
        </div>

        {/* Question 11 */}
        <div className="flex w-full flex-col gap-2">
          <Label isRequired className="text-base">
            11. What level of education do majority of your workers have?
          </Label>
          <Select
            className="w-full flex items-start"
            isRequired
            size="md"
            placeholder="Education Level"
            items={educationLevels}
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

        {/* Question 12 */}
        <div className="flex w-full flex-col gap-2">
          <Label isRequired className="text-base">
            12. What is your involuntary turnover rate?
          </Label>
          <div className="flex w-full">
            <Input placeholder="Percentage" size="md" className="flex-1" />
          </div>
        </div>

        {/* Question 13 */}
        <div className="flex w-full flex-col gap-2">
          <Label isRequired className="text-base">
            13. What is your voluntary turnover rate?
          </Label>
          <div className="flex w-full">
            <Input placeholder="Percentage" size="md" className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
