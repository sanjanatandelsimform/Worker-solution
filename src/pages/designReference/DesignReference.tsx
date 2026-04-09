import { useState, useEffect } from "react";
import { Button } from "@/components/base/buttons/button";
import { SocialButton } from "@/components/base/buttons/social-button";
import { Input, InputBase } from "@/components/base/input/input";
import { InputGroup } from "@/components/base/input/input-group";
import { TextArea } from "@/components/base/textarea/textarea";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { NativeSelect } from "@/components/base/select/select-native";
import { Mail01, Eye, EyeOff, Lightbulb02, ChevronLeft, ChevronRight } from "@untitledui/icons";
import { Tabs } from "@/components/base/tabs/tabs";
import { RadioGroup, RadioButton } from "@/components/base/radio-buttons/radio-buttons";
import { Select } from "@/components/base/select/select";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import { ChangePasswordSuccessModal } from "@/components/modals/ChangePasswordSuccessModal";
import { ChangePasswordFailedModal } from "@/components/modals/ChangePasswordFailedModal";
import { InProgressModal } from "@/components/modals/InProgressModal";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Carousel } from "@/components/application/carousel/carousel-base";
import { BarChart, Bar, XAxis, Cell, ResponsiveContainer } from "recharts";
import { cx } from "@/utils/cx";

// Did You Know carousel data
const didYouKnowSlides = [
  {
    id: 1,
    content:
      "Workers in low-wage jobs report spending an average of 1.3 hours per week dealing with personal finance-related issues when they are at work, adding up to 66 hours of lost productivity each year due to financial stress.",
  },
  {
    id: 2,
    content:
      "78% of workers say they would be more loyal to an employer that offers comprehensive financial wellness benefits beyond just traditional 401(k) plans.",
  },
  {
    id: 3,
    content:
      "Companies that provide financial wellness programs see an average 27% reduction in employee turnover and a 32% increase in productivity.",
  },
];

function DesignReference() {
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [showPassword, setShowPassword] = useState(false);
  const [textareaValue, setTextareaValue] = useState("");
  // const [mobileNumber, setMobileNumber] = useState("");
  // const [workNumber, setWorkNumber] = useState("");
  // const [homeNumber, setHomeNumber] = useState("");
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isChangePasswordSuccessModalOpen, setIsChangePasswordSuccessModalOpen] = useState(false);
  const [isChangePasswordFailedModalOpen, setIsChangePasswordFailedModalOpen] = useState(false);
  const [isInProgressModalOpen, setIsInProgressModalOpen] = useState(false);

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
    <div className="min-h-screen bg-ws-base-white text-ws-black transition-colors">
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
                    onChange={value => setPassword(value)}
                    className="relative"
                  />
                  <Button
                    color="tertiary"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-0 top-0"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5 text-ws-gray-70" />
                    ) : (
                      <Eye className="size-5 text-ws-gray-70" />
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
                    onChange={value => setPassword(value)}
                    className="relative"
                  />
                  <Button
                    color="tertiary"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-0 top-0.5"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5 text-ws-gray-70" />
                    ) : (
                      <Eye className="size-5 text-ws-gray-70" />
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
                      onChange={e => setCountryCode(e.target.value)}
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
                      onChange={e => setCountryCode(e.target.value)}
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

        {/* Demo Section for Untitled UI Textarea Component */}
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">Untitled UI Textarea Component</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <TextArea
                  label="About"
                  placeholder="Tell us about yourself..."
                  hint="Write a few sentences about yourself."
                  value={textareaValue}
                  onChange={setTextareaValue}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <TextArea
                  label="Bio"
                  placeholder="Write your bio here..."
                  hint="This will be displayed on your profile."
                  value={textareaValue}
                  onChange={setTextareaValue}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <TextArea
                  isRequired
                  label="Comment"
                  placeholder="Leave a comment..."
                  hint="Your comment will be visible to everyone."
                  tooltip="This is a tooltip"
                  value={textareaValue}
                  onChange={setTextareaValue}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <TextArea
                  isRequired
                  label="Feedback"
                  placeholder="Share your feedback..."
                  hint="Your feedback helps us improve."
                  tooltip="This is a tooltip for feedback"
                  value={textareaValue}
                  onChange={setTextareaValue}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <TextArea
                  isDisabled
                  label="Disabled Textarea"
                  placeholder="This textarea is disabled"
                  value={textareaValue}
                  onChange={setTextareaValue}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <TextArea
                  label="Description"
                  placeholder="Enter a description..."
                  rows={6}
                  value={textareaValue}
                  onChange={setTextareaValue}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <TextArea
                  label="Message"
                  placeholder="Type your message..."
                  rows={4}
                  cols={50}
                  hint="Message should be between 10-500 characters."
                  value={textareaValue}
                  onChange={setTextareaValue}
                />
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
          <h2 className="text-2xl font-bold">Untitled UI Social Button Component</h2>

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
                <Input label="Personal Phone" placeholder="(555) 000-0000" type="tel" />
              </Tabs.Panel>
              <Tabs.Panel id="business" className="pt-4">
                <Input label="Business Phone" placeholder="(555) 000-0000" type="tel" />
              </Tabs.Panel>
              <Tabs.Panel id="other" className="pt-4">
                <Input label="Other Phone" placeholder="(555) 000-0000" type="tel" />
              </Tabs.Panel>
            </Tabs>
          </div>
        </div>

        {/* Demo Section for Change Password Modal */}
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">Change Password Modal Component</h2>
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-ws-text-tertiary">
                Click the button below to open the Change Password modal with form validation.
              </p>
              <Button color="primary" size="md" onClick={() => setIsChangePasswordModalOpen(true)}>
                Open Change Password Modal
              </Button>
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
        />

        {/* Demo Section for Change Password Success Modal */}
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">Change Password Success Modal Component</h2>
          <div className="space-y-4">
            <p className="text-secondary">
              Click the button below to open the Change Password Success modal displaying a success
              message.
            </p>
            <div>
              <Button
                color="primary"
                size="md"
                onClick={() => setIsChangePasswordSuccessModalOpen(true)}
              >
                Open Change Password Success Modal
              </Button>
            </div>
          </div>
        </div>

        {/* Change Password Success Modal */}
        <ChangePasswordSuccessModal
          isOpen={isChangePasswordSuccessModalOpen}
          onClose={() => setIsChangePasswordSuccessModalOpen(false)}
          onBackToSettings={() => console.log("Back to Settings clicked")}
        />

        {/* Demo Section for Change Password Failed Modal */}
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">Change Password Failed Modal Component</h2>
          <div className="space-y-4">
            <p className="text-secondary">
              Click the button below to open the Change Password Failed modal displaying an
              error/warning message.
            </p>
            <div>
              <Button
                color="primary"
                size="md"
                onClick={() => setIsChangePasswordFailedModalOpen(true)}
              >
                Open Change Password Failed Modal
              </Button>
            </div>
          </div>
        </div>

        {/* Change Password Failed Modal */}
        <ChangePasswordFailedModal
          isOpen={isChangePasswordFailedModalOpen}
          onClose={() => setIsChangePasswordFailedModalOpen(false)}
          onContinue={() => console.log("Continue clicked")}
        />

        {/* Demo Section for In Progress Modal */}
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">In Progress Modal Component</h2>
          <div className="space-y-4">
            <p className="text-secondary">
              Click the button below to open the In Progress modal showing a loading state with
              disabled button.
            </p>
            <div>
              <Button color="primary" size="md" onClick={() => setIsInProgressModalOpen(true)}>
                Open In Progress Modal
              </Button>
            </div>
          </div>
        </div>

        {/* In Progress Modal */}
        <InProgressModal
          isOpen={isInProgressModalOpen}
          onClose={() => setIsInProgressModalOpen(false)}
          onGoToDashboard={() => console.log("Go to Dashboard clicked")}
        />

        {/* Demo Section for Did You Know Carousel */}
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">Did You Know Carousel</h2>
          <p className="text-secondary">
            Educational tip carousel with navigation controls and pagination dots.
          </p>

          {/* Did You Know Carousel */}
          <div className="max-w-4xl">
            <Carousel.Root
              opts={{
                loop: true,
                align: "start",
              }}
            >
              <div className="space-y-6">
                {/* Carousel Content - Only this slides */}
                <Carousel.Content>
                  {didYouKnowSlides.map(slide => (
                    <Carousel.Item key={slide.id}>
                      <div className="border border-ws-border-primary rounded-xl p-4 bg-purple-50">
                        <div className="flex flex-col gap-2">
                          {/* Header with Icon and Title */}
                          <div className="flex items-center gap-2">
                            <Lightbulb02 className="size-6 text-ws-text-primary" />
                            <h3 className="text-lg font-medium leading-7 text-ws-text-primary">
                              Did you know?
                            </h3>
                          </div>
                          <p className="text-base font-normal text-ws-text-primary leading-6">
                            {slide.content}
                          </p>
                        </div>
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel.Content>

                {/* Navigation Controls - Fixed position, doesn't slide */}
                <div className="flex items-center justify-center gap-2 border rounded-md px-2 py-1 w-fit bg-ws-base-white border-ws-border-primary mx-auto">
                  {/* Previous Button */}
                  <Carousel.PrevTrigger asChild>
                    <button
                      className="size-6 flex items-center justify-center hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-purple-600"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="size-6 text-purple-600" />
                    </button>
                  </Carousel.PrevTrigger>

                  {/* Pagination Dots */}
                  <Carousel.IndicatorGroup className="flex items-center gap-3">
                    {didYouKnowSlides.map((slide, index) => (
                      <Carousel.Indicator key={slide.id} index={index}>
                        {({ isSelected }) => (
                          <div
                            className={cx(
                              "size-2 rounded transition-colors cursor-pointer",
                              isSelected ? "bg-purple-600" : "bg-gray-300"
                            )}
                          />
                        )}
                      </Carousel.Indicator>
                    ))}
                  </Carousel.IndicatorGroup>

                  {/* Next Button */}
                  <Carousel.NextTrigger asChild>
                    <button
                      className="size-6 flex items-center justify-center hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-purple-600"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="size-6 text-purple-600" />
                    </button>
                  </Carousel.NextTrigger>
                </div>
              </div>
            </Carousel.Root>
          </div>
        </div>

        {/* Demo Section for Typography */}
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">Untitled UI Typography Component</h2>
          <p className="text-secondary">
            Typography styles with proper formatting for long-form content like articles or
            documentation.
          </p>

          {/* Typography Demo */}
          <div className="prose max-w-none">
            <h1>Heading level 1</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ullamcorper mattis
              lorem non. Ultrices praesent amet ipsum justo massa. Eu dolor aliquet risus gravida
              nunc at feugiat consequat purus. Non massa enim vitae duis mattis. Vel in ultricies
              vel fringilla.
            </p>

            <h2>Heading level 2</h2>
            <p>
              Mi tincidunt elit, id quisque ligula ac diam, amet. Vel etiam suspendisse morbi
              eleifend faucibus eget vestibulum felis. Dictum quis montes, sit sit. Tellus aliquam
              enim urna, etiam. Mauris posuere vulputate arcu amet, vitae nisi, tellus tincidunt. At
              feugiat sapien varius id.
            </p>

            <h3>Heading level 3</h3>
            <p>
              Elit nisi in eleifend sed nisi. Pulvinar at orci, proin imperdiet commodo consectetur
              convallis risus. Sed condimentum enim dignissim adipiscing faucibus consequat, urna.
            </p>

            <h4>Heading level 4</h4>
            <p>
              Mi tincidunt elit, id quisque ligula ac diam, amet. Vel etiam suspendisse morbi
              eleifend faucibus eget vestibulum felis. Dictum quis montes, sit sit. Tellus aliquam
              enim urna, etiam.
            </p>

            <h3>Lists</h3>
            <p>Here are some list examples:</p>

            <h4>Unordered List</h4>
            <ul>
              <li>First item in the list</li>
              <li>Second item with more details</li>
              <li>Third item to demonstrate spacing</li>
              <li>Fourth item showing consistency</li>
            </ul>

            <h4>Ordered List</h4>
            <ol>
              <li>First step in the process</li>
              <li>Second step with instructions</li>
              <li>Third step to complete the task</li>
              <li>Final step to wrap up</li>
            </ol>

            <h3>Blockquote</h3>
            <blockquote>
              <p>
                "In a world older and more complete than ours they move finished and complete,
                gifted with extensions of the senses we have lost or never attained, living by
                voices we shall never hear."
              </p>
            </blockquote>

            <h3>Inline Code</h3>
            <p>
              You can use inline code like <code>const example = true</code> or{" "}
              <code>function hello()</code> within your paragraphs. This is useful for technical
              documentation where you need to reference <code>variables</code> or{" "}
              <code>methods</code> in your text.
            </p>

            <h3>Links</h3>
            <p>
              This is a paragraph with a{" "}
              <a href="https://untitledui.com" target="_blank" rel="noopener noreferrer">
                clickable link
              </a>{" "}
              inside. Links are styled with proper underline and spacing for better readability.
            </p>

            <hr />

            <h3>Lead Text</h3>
            <p className="lead">
              This is a lead paragraph with larger text. Tristique odio senectus nam posuere ornare
              leo metus, ultricies. Blandit duis ultricies vulputate morbi feugiat cras placerat
              elit.
            </p>

            <p>
              Regular paragraph text follows the lead text. Ipsum sit mattis nulla quam nulla.
              Gravida id gravida ac enim mauris id. Non pellentesque congue eget consectetur turpis.
            </p>
          </div>

          {/* Typography Variants */}
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-bold">Typography Variants</h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold mb-2">
                  Centered Quote (prose-centered-quote)
                </h4>
                <div className="prose prose-centered-quote max-w-none">
                  <blockquote>
                    <p>
                      "In a world older and more complete than ours they move finished and complete,
                      gifted with extensions of the senses we have lost or never attained."
                    </p>
                  </blockquote>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Minimal Quote (prose-minimal-quote)</h4>
                <div className="prose prose-minimal-quote max-w-none">
                  <blockquote>
                    <p>
                      "In a world older and more complete than ours they move finished and complete,
                      gifted with extensions of the senses we have lost or never attained."
                    </p>
                  </blockquote>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Large Typography (md:prose-lg)</h4>
                <div className="prose md:prose-lg max-w-none">
                  <h2>Larger Typography on Medium Screens</h2>
                  <p>
                    This typography scales up on medium screens and above (768px and wider). The
                    text becomes larger and more spacious, making it perfect for hero sections or
                    featured content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Section for Benchmark Chart */}
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">Benchmark Chart Component</h2>
          <p className="text-secondary">
            Pixel-perfect implementation of the benchmark comparison chart showing Industry,
            Company, and National averages.
          </p>

          {/* Benchmark Chart */}
          <div className="max-w-4xl">
            <BenchmarkChart />
          </div>
        </div>

        <DashboardSidebar />
      </div>
    </div>
  );
}

// Benchmark Chart Component
const BenchmarkChart = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const salaryData = [
    { name: "Industry average", value: 33.75, color: "#00C4C7" },
    { name: "Your company", value: 54.375, color: "#22CCEE" },
    { name: "National average", value: 100, color: "#DBEBEB" },
  ];

  const hourlyData = [
    { name: "Industry average", value: 33.75, color: "#00C4C7" },
    { name: "Your company", value: 54.375, color: "#22CCEE" },
    { name: "National average", value: 100, color: "#DBEBEB" },
  ];

  if (!mounted) {
    return (
      <div className="bg-ws-base-white border border-ws-border-primary min-h-90 rounded-xl p-6 flex items-center justify-center">
        <p className="text-ws-text-tertiary">Loading chart...</p>
      </div>
    );
  }

  return (
    <div className="bg-ws-base-white border border-ws-border-primary rounded-xl p-6 flex flex-col gap-8">
      {/* Charts Container */}
      <div className="flex gap-8 items-center justify-center">
        {/* Salary Chart */}
        <div className="flex flex-col gap-2 items-center">
          <div className="relative w-44 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData} barGap={0} barCategoryGap={0}>
                <XAxis hide />
                <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={57.692}>
                  {salaryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={index === 2 ? 0.4 : 0.8}
                      stroke={index === 1 ? "#D5D7DA" : index === 0 ? "#D5D7DA" : "#000000"}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="font-normal text-center text-black text-lg">Salary</p>
        </div>

        {/* Hourly Chart */}
        <div className="flex flex-col gap-2 items-center">
          <div className="relative w-44 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} barGap={0} barCategoryGap={0}>
                <XAxis hide />
                <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={57.692}>
                  {hourlyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={index === 2 ? 0.4 : 0.8}
                      stroke={index === 1 ? "#D5D7DA" : index === 0 ? "#D5D7DA" : "#000000"}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="font-normal text-center text-black text-lg">Hourly</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 items-center justify-center w-full">
        <div className="flex gap-4 items-center">
          <div className="w-4 h-4 rounded-xs bg-cyan-400" />
          <p className="font-normal text-black text-lg">State average</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="w-4 h-4 rounded-xs bg-cyan-400" />
          <p className="font-normal text-black text-lg">Your company</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="w-4 h-4 rounded-xs bg-gray-200" />
          <p className="font-normal text-black text-lg">National average</p>
        </div>
      </div>
    </div>
  );
};

export default DesignReference;
