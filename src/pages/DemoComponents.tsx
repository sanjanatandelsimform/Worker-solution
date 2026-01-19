import { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { SocialButton } from "@/components/base/buttons/social-button";
import { Input, InputBase } from "@/components/base/input/input";
import { InputGroup } from "@/components/base/input/input-group";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { NativeSelect } from "@/components/base/select/select-native";
import { Mail01, Eye, EyeOff } from "@untitledui/icons";
import { Tabs } from "@/components/base/tabs/tabs";
import {
  RadioGroup,
  RadioButton,
} from "@/components/base/radio-buttons/radio-buttons";
import { Select } from "@/components/base/select/select";

function App() {
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [showPassword, setShowPassword] = useState(false);

  const items = [
    { label: "Phoenix Baker", id: "@phoenix", supportingText: "@phoenix" },
    { label: "Olivia Rhye", id: "@olivia", supportingText: "@olivia" },
    {
      label: "Lana Steiner",
      id: "@lana",
      supportingText: "@lana",
      disabled: true,
    },
    { label: "Demi Wilkinson", id: "@demi", supportingText: "@demi" },
    { label: "Candice Wu", id: "@candice", supportingText: "@candice" },
    { label: "Natali Craig", id: "@natali", supportingText: "@natali" },
    { label: "Abraham Baker", id: "@abraham", supportingText: "@abraham" },
    { label: "Adem Lane", id: "@adem", supportingText: "@adem" },
    { label: "Jackson Reed", id: "@jackson", supportingText: "@jackson" },
    { label: "Jessie Meyton", id: "@jessie", supportingText: "@jessie" },
  ];

  return (
    <div className="min-h-screen bg-primary text-primary transition-colors">
      <div className="container mx-auto p-8">
        {/* Demo Section for Untitled UI Inputs */}
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">Untitled UI Inputs Component</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <InputGroup label="Text Input">
                  <Input size="sm" placeholder="Small" />
                </InputGroup>
              </div>
              <div className="flex flex-wrap gap-2">
                <InputGroup label="Text Input">
                  <Input size="md" placeholder="Medium" />
                </InputGroup>
              </div>
              <div className="flex flex-wrap gap-2">
                <InputGroup label="Password Input">
                  <Input
                    hint="Must be at least 8 characters"
                    placeholder="Small"
                    size="sm"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(value) => setPassword(value)}
                    className="relative"
                  />
                  <Button
                    color="tertiary"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-0 top-0"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5 text-gray-400" />
                    ) : (
                      <Eye className="size-5 text-gray-400" />
                    )}
                  </Button>
                </InputGroup>
              </div>
              <div className="flex flex-wrap gap-2">
                <InputGroup label="Password Input">
                  <Input
                    hint="Must be at least 8 characters"
                    placeholder="Medium"
                    size="md"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(value) => setPassword(value)}
                    className="relative"
                  />
                  <Button
                    color="tertiary"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-0 top-0.5"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5 text-gray-400" />
                    ) : (
                      <Eye className="size-5 text-gray-400" />
                    )}
                  </Button>
                </InputGroup>
              </div>
              <div className="flex flex-wrap gap-2">
                <Input
                  isRequired
                  icon={Mail01}
                  size="sm"
                  label="Email"
                  hint="This is a hint text to help user."
                  placeholder="small@untitledui.com"
                  tooltip="This is a tooltip"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Input
                  isRequired
                  icon={Mail01}
                  size="md"
                  label="Email"
                  hint="This is a hint text to help user."
                  placeholder="medium@untitledui.com"
                  tooltip="This is a tooltip"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <InputGroup
                  label="Phone number"
                  hint="Enter your phone number with country code"
                  leadingAddon={
                    <NativeSelect
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      options={[
                        { label: "US +1", value: "US" },
                        { label: "UK +44", value: "UK" },
                        { label: "IN +91", value: "IN" },
                        { label: "CA +1", value: "CA" },
                        { label: "AU +61", value: "AU" },
                        { label: "DE +49", value: "DE" },
                        { label: "FR +33", value: "FR" },
                        { label: "JP +81", value: "JP" },
                        { label: "CN +86", value: "CN" },
                      ]}
                    />
                  }
                >
                  <InputBase
                    placeholder="(555) 000-0000"
                    type="tel"
                    size="sm"
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                  />
                </InputGroup>
              </div>
              <div className="flex flex-wrap gap-2">
                <InputGroup
                  label="Phone number"
                  hint="Enter your phone number with country code"
                  leadingAddon={
                    <NativeSelect
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      options={[
                        { label: "US +1", value: "US" },
                        { label: "UK +44", value: "UK" },
                        { label: "IN +91", value: "IN" },
                        { label: "CA +1", value: "CA" },
                        { label: "AU +61", value: "AU" },
                        { label: "DE +49", value: "DE" },
                        { label: "FR +33", value: "FR" },
                        { label: "JP +81", value: "JP" },
                        { label: "CN +86", value: "CN" },
                      ]}
                    />
                  }
                >
                  <InputBase
                    placeholder="(555) 000-0000"
                    type="tel"
                    size="md"
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                  />
                </InputGroup>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select
                  className="w-full flex items-start"
                  isRequired
                  size="sm"
                  label="Team member"
                  tooltip="This is a tooltip"
                  hint="This is a hint text to help user."
                  placeholder="Select team member"
                  items={items}
                >
                  {(item) => (
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
              <div className="flex flex-wrap gap-2">
                <Select
                  className="w-full flex items-start"
                  isRequired
                  size="md"
                  label="Team member"
                  tooltip="This is a tooltip"
                  hint="This is a hint text to help user."
                  placeholder="Select team member"
                  items={items}
                >
                  {(item) => (
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

        {/* Demo Section for Untitled UI Buttons */}
        <div className="mt-8 space-y-6 al">
          <h2 className="text-2xl font-bold">Untitled UI Button Component</h2>
          <div className="space-y-4">
            <div className="space-y-2 flex flex-col items-start">
              <h3 className="font-semibold">Primary Buttons</h3>
              <div className="flex flex-wrap gap-2">
                <Button color="primary" size="sm">
                  Small
                </Button>
                <Button color="primary" size="md">
                  Medium
                </Button>
                <Button color="primary" size="lg">
                  Large
                </Button>
                <Button color="primary" size="xl">
                  Extra Large
                </Button>
                <Button color="primary" size="xl" isDisabled>
                  Disabled
                </Button>
              </div>
            </div>

            <div className="space-y-2 flex flex-col items-start">
              <h3 className="font-semibold">Secondary Buttons</h3>
              <div className="flex flex-wrap gap-2">
                <Button color="secondary" size="sm">
                  Small
                </Button>
                <Button color="secondary" size="md">
                  Medium
                </Button>
                <Button color="secondary" size="lg">
                  Large
                </Button>
                <Button color="secondary" size="xl">
                  Extra Large
                </Button>
                <Button color="secondary" size="xl" isDisabled>
                  Disabled
                </Button>
              </div>
            </div>

            <div className="space-y-2 flex flex-col items-start">
              <h3 className="font-semibold">Destructive Buttons</h3>
              <div className="flex flex-wrap gap-2">
                <Button color="primary-destructive" size="sm">
                  Small
                </Button>
                <Button color="primary-destructive" size="md">
                  Medium
                </Button>
                <Button color="primary-destructive" size="lg">
                  Large
                </Button>
                <Button color="primary-destructive" size="xl">
                  Extra Large
                </Button>
                <Button color="primary-destructive" size="xl" isDisabled>
                  Disabled
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Section for Untitled UI Checkboxes */}
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">Untitled UI Checkbox Component</h2>

          <div className="space-y-4 max-w-md">
            <div className="space-y-3 flex flex-col items-start">
              <h3 className="font-semibold">Basic Checkboxes</h3>
              <Checkbox
                isSelected={agreedToTerms}
                onChange={setAgreedToTerms}
                label="I agree to the terms and conditions"
              />
              <Checkbox
                isSelected={newsletter}
                onChange={setNewsletter}
                label="Subscribe to newsletter"
              />
            </div>

            <div className="space-y-3 flex flex-col items-start">
              <h3 className="font-semibold">Checkbox with Hint Text</h3>
              <Checkbox
                label="Enable notifications"
                className="flex items-start"
                hint="We'll send you updates about your account"
              />
            </div>

            <div className="space-y-3 flex flex-col items-start">
              <h3 className="font-semibold">Checkbox Sizes</h3>
              <Checkbox label="Small checkbox (default)" size="sm" />
              <Checkbox label="Medium checkbox" size="md" />
            </div>
          </div>
        </div>

        {/* Demo Section for Untitled UI Social Buttons */}
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">
            Untitled UI Social Button Component
          </h2>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <SocialButton social="google" size="sm">
                  Continue with Google
                </SocialButton>
              </div>
              <div className="flex flex-wrap gap-3">
                <SocialButton social="google" size="md">
                  Continue with Google
                </SocialButton>
              </div>
            </div>
          </div>
        </div>

        {/* Radio Buttons Section */}
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">Untitled UI Radio Component</h2>
          <RadioGroup aria-label="Pricing plans" defaultValue="basic">
            <RadioButton label="Basic plan" value="basic" />
            <RadioButton label="Business plan" value="business" />
            <RadioButton label="Enterprise plan" value="enterprise" />
          </RadioGroup>
        </div>

        {/* Demo Section for Phone Number Input with Leading Dropdown */}
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">Untitled UI Tabs Component</h2>
          {/* Tabs Section */}
          <div className="space-y-3 flex flex-col items-start">
            <Tabs>
              <Tabs.List
                size="sm"
                type="button-border"
                items={[
                  { id: "personal", label: "Personal", badge: ">" },
                  { id: "business", label: "Business", badge: ">" },
                  { id: "other", label: "Other", badge: ">" },
                ]}
              />
              <Tabs.Panel id="personal" className="pt-4">
                <Input
                  label="Personal Phone"
                  placeholder="(555) 000-0000"
                  type="tel"
                />
              </Tabs.Panel>
              <Tabs.Panel id="business" className="pt-4">
                <Input
                  label="Business Phone"
                  placeholder="(555) 000-0000"
                  type="tel"
                />
              </Tabs.Panel>
              <Tabs.Panel id="other" className="pt-4">
                <Input
                  label="Other Phone"
                  placeholder="(555) 000-0000"
                  type="tel"
                />
              </Tabs.Panel>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
