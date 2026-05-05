import type { ReactNode } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
} from "@/components/base/modal/modal";
import { Button } from "@/components/base/buttons/button";
import { X } from "@untitledui/icons";
import featuredIcon from "@/assets/featured-icon.svg";

const cls = {
  sectionHeading: "text-sm font-semibold text-ws-navy-900 uppercase",
  body: "text-sm text-ws-text-secondary leading-relaxed",
  bodyUpper: "text-sm text-ws-text-secondary leading-relaxed uppercase",
  bulletList: "list-disc pl-5 space-y-1",
  inlineLabel: "font-medium text-ws-text-primary",
} as const;

export interface BaseModalWithIconButton {
  text: string;
  onClick: () => void;
  color?: "primary" | "secondary" | "tertiary" | "warning" | "error";
  isDisabled?: boolean;
}

export interface BaseModalWithIconProps {
  isOpen: boolean;
  messageImg?: string;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  title: string;
  subtitle?: string;
  subtitleOne?: string;
  icon?: ReactNode;
  buttons: BaseModalWithIconButton[];
  showCloseButton?: boolean;
  paddingBottom?: string;
  backgroundPattern?: "success" | "unsuccess";
}

export const PrivacyModal = ({
  isOpen,
  messageImg,
  onClose,
  size = "sm",
  title,
  subtitle,
  subtitleOne,
  icon,
  buttons,
  showCloseButton = true,
  paddingBottom = "h-3",
  backgroundPattern = "success",
}: BaseModalWithIconProps) => {
  const backgroundClass = backgroundPattern === "success" ? " " : "background-pattern-unsuccess";

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size={size}>
      <ModalContent className={backgroundClass}>
        {/* Modal Header with Featured Icon and Close Button */}
        <ModalHeader className="relative flex flex-col items-start border-0 pb-0 pt-6 px-6">
          {/* Featured Icon */}
          {icon && (
            <img
              alt="Success checkmark"
              className="block max-w-12 w-full"
              src={messageImg || featuredIcon}
            />
          )}
          {/* Close Button */}
          {showCloseButton && (
            <Button
              color="link"
              size="sm"
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="absolute right-3 top-3 flex size-11 items-center justify-center overflow-clip p-2 rounded-lg"
            >
              <X className="size-7 stroke-1 text-ws-gray-400" />
            </Button>
          )}

          {/* Text and Supporting Text */}
          <div className="flex w-full flex-col gap-2">
            <ModalTitle className="font-display text-2xl font-semibold leading-8 text-ws-text-primary mb-0 mt-4">
              {title}
            </ModalTitle>
            {subtitle && (
              <>
                <p className="font-body text-sm font-normal leading-5 text-ws-text-tertiary">
                  {subtitle}
                </p>
                <p className="font-body text-sm font-normal leading-5 text-ws-text-tertiary">
                  {subtitleOne}
                </p>
              </>
            )}
          </div>

          {/* Padding Bottom */}
          <div className={`${paddingBottom} w-full shrink-0`} />
        </ModalHeader>

        <ModalContent className="border-0 pt-0 px-2">
          <div className="w-full h-120 overflow-y-scroll pl-4 pb-6 pr-4">
            <div className="space-y-4">
              {/* Intro paragraphs */}
              <p className={cls.body}>
                Lafayette Square Foundation, Inc. and its subsidiaries and affiliates (also known as
                Lafayette Square Institute and herein referred to as "Lafayette Square," "we," "us,"
                or "our") is committed to respecting privacy and protecting personal information.
                Your privacy is very important to us. This Privacy Notice (the "Notice") describes
                how we collect, use, and disclose personal information in connection with your use
                of the Lafayette Square Access2Benefits platform, a workforce analytics platform,
                including any questionnaires, dashboards, reports, content, functionality, and
                services offered through the platform ("A2B"), hosted at our website [INSERT A2B
                TOOL URL] (the "Site").
              </p>
              <p className={cls.body}>
                This Notice provides you with information about how we collect information about you
                when you visit our Site, as a user of A2B, including the types of information that
                we collect from you in connection with your use of the Site, and how that
                information will be used, including Personal Information (as defined below).
              </p>
              <p className={cls.body}>
                Please read this Notice carefully to understand our views and practices regarding
                your personal information and how we will treat it. Please also read our Terms of
                Use, which govern access to and use of A2B; the Terms of Use are available on our
                website, or you can download a PDF version of the Terms of Use here [INSERT
                HYPERLINK TO TERMS OF USE PDF].
              </p>
              <p className={cls.body}>
                We reserve the right, at our discretion, to change our Privacy Notice at any time
                without prior notice. When we do, we will post the revised Notice on this page with
                a new "Last Updated" date. The revised Notice will become effective at the time of
                posting. We suggest that you review this Notice periodically for changes.
              </p>
              <p className={cls.body}>
                If you do not agree with our policies and practices, your choice is not to use our
                website. By accessing or using A2B, you agree to this Notice and the Terms of Use.
              </p>
              <p className={cls.body}>
                This Notice does not apply to information collected or controlled by a third party,
                including any third-party apps or websites (including third-party websites you may
                access through A2B). We encourage you to review the privacy policies of any business
                you interact with.
              </p>
              <p className={cls.body}>
                This Notice also does not apply to workforce members, such as job applicants,
                employees, retirees, or contractors.
              </p>

              {/* Table of Contents */}
              <div className="space-y-1">
                <p className={cls.body}>
                  This Notice is provided in a layered format so you can navigate to the specific
                  areas set out below:
                </p>
                <ul className={cls.bulletList}>
                  {[
                    "The Types of Personal Information We Collect",
                    "State-Specific Information and Sensitive Personal Data",
                    "Disclosure of Personal Information to Third Parties",
                    "Retention of Personal Information",
                    "Your Privacy Rights and Choices",
                    "Submitting Privacy Requests",
                    "Cookies and Related Technologies",
                    "Do Not Track / Global Privacy Control",
                    "Security Measures",
                    "Other Websites and Links",
                    "Newsletters and Marketing Communications",
                    "Children's Information",
                    "Changes to This Notice",
                    "How Can You Contact Us?",
                  ].map(item => (
                    <li key={item} className={cls.body}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 1 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>
                  1. The Types of Personal Information We Collect
                </p>
                <p className={cls.body}>
                  For purposes of this Notice, "Personal Information" generally means information
                  that identifies, relates to, describes, is reasonably capable of being associated
                  with, or could reasonably be linked, directly or indirectly, with a particular
                  person or household, such as name, email address or phone number, account number
                  or account information. Personal Information does not include publicly available
                  information or information that is deidentified or anonymized consistent with
                  applicable privacy laws.
                </p>
                <p className={cls.body}>
                  We collect personal information from a number of sources in circumstances
                  including, but not necessarily limited to:
                </p>
                <ul className={cls.bulletList}>
                  {[
                    "when you create an account on A2B;",
                    "when you use the interactive functionality on A2B;",
                    "when you provide it to us in correspondence or other communications (including when you use the \u201cContact\u201d feature on A2B), including but not limited to email and telephone inquiries;",
                    "automatically when you visit A2B, through the use of cookies and similar technologies (see the \u201cCookies and Related Technologies\u201d section below);",
                    "through our account management portal; and/or",
                    "from our affiliates or non-affiliated partners such as our marketing and advertising partners and service providers.",
                  ].map(item => (
                    <li key={item.slice(0, 40)} className={cls.body}>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className={cls.body}>
                  If you choose to not provide us with this or other personal information, you might
                  not be able to access certain information and services on A2B or the Site.
                </p>
                <p className={cls.body}>
                  Depending on how you interact with us, we may collect the following categories of
                  personal information about you:
                </p>
                <ul className={cls.bulletList}>
                  {[
                    "Identifiers: information that identifies, relates to, describes or is capable of being associated with you, such as your name, signature, social security number, physical characteristics or description, address, telephone number, driver's license or state identification card number, insurance policy number, education, employment, employment history, bank account number, credit card number, debit card number, wire transfer information, or any other financial information, medical information, or health insurance information.",
                    "Contact Information: such as postal address, email address, or phone number.",
                    "Demographic Information: such as age, gender identity or expression, ethnicity, nationality, philosophical beliefs, marital status, or sexual orientation.",
                    "Commercial Information: such as records of personal property and products or services purchased.",
                    "Internet or Other Electronic Network Activity Information: including, but not limited to, browsing history, search history, and information regarding a consumer's interaction with an Internet website, application, or advertisement.",
                    "Device and Location Information: such as device type and identification number, zip code or other geolocation information, mobile network, operating system type, web browser type and version, or system events.",
                    "Account Information: such as username and password, security questions and answers, or access codes.",
                    "Content You Submit to Us: such as information submitted through a form or chat session, reviews of your experience, messages, comments, or other content you submit.",
                    "Sensory Information: such as when you submit a photo for identification verification or via CCTV when you visit our offices or facilities.",
                  ].map(item => (
                    <li key={item.slice(0, 40)} className={cls.body}>
                      <span className={cls.inlineLabel}>{item.split(":")[0]}:</span>
                      {item.substring(item.indexOf(":") + 1)}
                    </li>
                  ))}
                </ul>
                <p className={cls.body}>
                  We use the information we collect about you, or that you provide to us, including
                  Personal Information, for the following purposes:
                </p>
                <ul className={cls.bulletList}>
                  {[
                    "Providing services to you: to carry out our obligations arising from our membership agreements or other governing documents, including for the management of your account, for administrative purposes, and to maintain records and correspondence relating to you.",
                    "Marketing: to provide information or marketing messages such as email messages.",
                    "Analytics: to learn more about you and your interaction with A2B.",
                    "Communications and feedback: to engage with you when you contact us, request information, or provide feedback.",
                    "Product and service improvement: to evaluate, operate, and improve our products, services, and overall business, and to ensure functionality of A2B.",
                    "Compliance and legal: to comply with applicable laws, regulations, and internal policies, to fulfill our legal obligations, protect our legal interests, or to address legal claims or disputes.",
                    "Security: to detect security incidents, protect against malicious, deceptive, fraudulent, or illegal activity.",
                  ].map(item => (
                    <li key={item.slice(0, 40)} className={cls.body}>
                      <span className={cls.inlineLabel}>{item.split(":")[0]}:</span>
                      {item.substring(item.indexOf(":") + 1)}
                    </li>
                  ))}
                </ul>
                <p className={cls.body}>
                  If you have signed up for, or are otherwise receiving for reasons permitted by
                  law, our notifications, you may at any time unsubscribe or opt-out from receiving
                  them by contacting us or following any provided unsubscribe or opt-out options.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>
                  2. State-Specific Information and Sensitive Personal Data
                </p>
                <p className={cls.body}>
                  Certain states, including California, to the extent any of these state laws apply,
                  require us to provide additional disclosures with respect to our collection, use,
                  and disclosure of personal data. The information in this section is provided as a
                  supplement to the rest of the information provided in this Notice. Please read the
                  entire Notice for a full description of our privacy practices.
                </p>
                <p className={cls.body}>
                  We do not sell or share Personal Information for cross-context behavioral
                  advertising, nor have we done so in the past twelve months.
                </p>
                <p className={cls.body}>
                  The Personal Information we collect includes information within the below
                  categories of data. Note that the "category of data" column listed below refers to
                  the category of personal data as defined under California law and represents the
                  categories of personal information that we have collected, and how it has been
                  shared, over the past twelve (12) months, if applicable. Inclusion of a category
                  in the list below indicates only that we may collect some information within that
                  category. We do not necessarily collect all information listed in a particular
                  category, nor do we necessarily collect all categories of information for all
                  individuals. While the categories are defined under California law, the
                  disclosures below also apply to residents of other states as well.
                </p>
                <p className={cls.body}>
                  We may disclose personal information in each of the below categories with our
                  affiliates and service providers, as well as with government entities as
                  necessary, for our business purposes.
                </p>

                {/* Data Categories Table */}
                <div className="overflow-x-auto mt-2">
                  <table className="w-full border-collapse border border-ws-border-primary text-sm">
                    <thead>
                      <tr className="bg-ws-navy-25">
                        <th className="border border-ws-border-primary px-3 py-2 text-left text-xs font-semibold text-ws-text-primary w-2/5">
                          Category of Data
                        </th>
                        <th className="border border-ws-border-primary px-3 py-2 text-left text-xs font-semibold text-ws-text-primary w-1/5">
                          Source
                        </th>
                        <th className="border border-ws-border-primary px-3 py-2 text-left text-xs font-semibold text-ws-text-primary w-2/5">
                          Purpose of Collecting and Processing
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          category: "Personal Identifiers.",
                          description:
                            "Identifiers such as a real name, alias, postal address, unique personal identifier, online identifier, IP address, email address, account name, social security number, driver\u2019s license number, passport number, or other similar identifiers.",
                          source:
                            "Directly from you or your interactions with our Site; and/or from records we have about you in the course of providing services or products.",
                          purpose:
                            "To provide, maintain and improve our services; to monitor and analyze trends, usage and activity; to detect, investigate and prevent fraudulent transactions and other illegal activities; and for marketing purposes.",
                        },
                        {
                          category: "Information About You.",
                          description:
                            "Information that identifies, relates to, describes, or is capable of being associated with a particular individual, including your name, signature, Social Security number, physical characteristics or description, address, telephone number, passport number, driver\u2019s license or state identification card number, insurance policy number, education, employment, employment history, bank account number, credit card number, debit card number, or any other financial information, medical information, or health insurance information.",
                          source:
                            "Directly from you or your interactions with our Site; from records we have about you in the course of providing services or products; from third-party marketing providers.",
                          purpose:
                            "To provide, maintain and improve our services; to monitor and analyze trends, usage and activity; to detect, investigate and prevent fraudulent transactions and other illegal activities; and for marketing purposes.",
                        },
                        {
                          category: "Internet or Other Electronic Network Activity Information.",
                          description:
                            "Browsing history, search history, and information regarding a consumer’s interaction with an Internet website, application, or advertisement. ",
                          source: "Directly from you or your interactions with our Site.",
                          purpose:
                            "To provide, maintain and improve our services; to monitor and analyze trends, usage and activity; to detect, investigate and prevent fraudulent transactions and other illegal activities; to defend our legal rights; for sales-related purposes; and to advertise products/services that might be of interest to you.",
                        },
                        {
                          category: "Geolocation Data.",
                          description: "Data that relates to a consumer’s physical location.",
                          source: "Directly from you or your interactions with our Site.",
                          purpose:
                            "To provide, maintain and improve our services; to monitor and analyze trends, usage and activity; to detect, investigate and prevent fraudulent transactions and other illegal activities; and for marketing purposes.",
                        },
                        {
                          category: "Sensory Information.",
                          description:
                            "Audio, electronic, visual, thermal, olfactory or similar information, including voice signatures and recorded calls.",
                          source: "Directly from you or your interactions with our Site. ",
                          purpose:
                            "To provide, maintain and improve our services; to detect, investigate and prevent fraudulent transactions and other illegal activities; and for marketing purposes.",
                        },
                      ].map(row => (
                        <tr key={row.category} className="align-top">
                          <td className="border border-ws-border-primary px-3 py-2 text-xs text-ws-text-secondary leading-relaxed">
                            <span className="font-semibold text-ws-text-primary">
                              {row.category}
                            </span>{" "}
                            {row.description}
                          </td>
                          <td className="border border-ws-border-primary px-3 py-2 text-xs text-ws-text-secondary leading-relaxed">
                            {row.source}
                          </td>
                          <td className="border border-ws-border-primary px-3 py-2 text-xs text-ws-text-secondary leading-relaxed">
                            {row.purpose}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Sensitive Personal Data sub-section */}
                <p className="text-sm font-semibold text-ws-text-primary mt-4">
                  Sensitive Personal Data
                </p>
                <p className={cls.body}>
                  In addition to the categories of personal data above, we may collect the following
                  categories of sensitive personal data. We only process your sensitive personal
                  data for purposes considered necessary under applicable law.
                </p>

                {/* Sensitive Personal Data Table */}
                <div className="overflow-x-auto mt-2">
                  <table className="w-full border-collapse border border-ws-border-primary text-sm">
                    <thead>
                      <tr className="bg-ws-navy-25">
                        <th className="border border-ws-border-primary px-3 py-2 text-left text-xs font-semibold text-ws-text-primary w-2/5">
                          Category of Sensitive Personal Data
                        </th>
                        <th className="border border-ws-border-primary px-3 py-2 text-left text-xs font-semibold text-ws-text-primary w-1/5">
                          Source
                        </th>
                        <th className="border border-ws-border-primary px-3 py-2 text-left text-xs font-semibold text-ws-text-primary w-2/5">
                          Purpose of Processing
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          category:
                            "Social security number, driver\u2019s license, state identification card, or passport number.",
                          source: "Collected directly from you or our service providers.",
                          purpose:
                            "Necessary to administer your relationship with us, including meeting our legal obligations, and providing you with benefits and services, as applicable.",
                        },
                        {
                          category: "Log-in credentials allowing access to an account.",
                          source: "Collected directly from you or our service providers.",
                          purpose:
                            "Necessary to administer your relationship with us, including meeting our legal obligations, and providing you with benefits and services; also processed to help detect security incidents, protect against malicious, deceptive, fraudulent, or illegal activity, and for compliance management.",
                        },
                      ].map(row => (
                        <tr key={row.category} className="align-top">
                          <td className="border border-ws-border-primary px-3 py-2 text-xs text-ws-text-secondary leading-relaxed">
                            {row.category}
                          </td>
                          <td className="border border-ws-border-primary px-3 py-2 text-xs text-ws-text-secondary leading-relaxed">
                            {row.source}
                          </td>
                          <td className="border border-ws-border-primary px-3 py-2 text-xs text-ws-text-secondary leading-relaxed">
                            {row.purpose}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>
                  3. Disclosure of Personal Information to Third Parties
                </p>
                <p className="text-sm font-semibold text-ws-text-primary">Service Providers</p>
                <p className={cls.body}>
                  Sometimes we engage companies that act on our behalf in connection with the
                  operation of A2B and the Site. For example, such companies may deliver products or
                  services, improve the functionality of A2B and the Site, collect information about
                  you, communicate with you, or store information for us. In some cases, these
                  companies may need to access information about you. We endeavor to require our
                  service providers by contract to collect, store, and use information about you
                  only on our behalf, and in accordance with the provisions of this Notice.
                </p>
                <p className="text-sm font-semibold text-ws-text-primary">Analytics Providers</p>
                <p className={cls.body}>
                  We may engage third-party analytics providers to help us understand how users
                  engage with A2B and the Site. These third parties may use cookies and similar
                  technologies to collect information about your use of A2B and the Site.
                </p>
                <p className="text-sm font-semibold text-ws-text-primary">
                  Disclosure to Selected Third Parties
                </p>
                <p className={cls.body}>
                  Lafayette Square may share your personal information among its subsidiaries and
                  affiliates for use to support our business and who will use it only for the
                  purposes for which we disclose it to them. Lafayette Square may also share your
                  personal information with non-affiliates such as, but not necessarily limited to,
                  third-party service providers, law enforcement or regulatory authorities, our
                  auditors, legal, and other professional advisors, accounting and billing
                  providers, mailing and printing services, and other service providers who will use
                  it only for the purposes for which we disclose it to them, which may include for
                  the purpose of technology and software, payment processing and tracking, and to
                  otherwise support our business and to provide you with services.
                </p>
                <p className={cls.body}>
                  We may also share your information with selected recipients for the following
                  purposes:
                </p>
                <ul className={cls.bulletList}>
                  <li className={cls.body}>
                    To process and store data, including your Personal Information; to track,
                    analyze, and modify A2B or the Site; for marketing, advertising, and
                    distribution; for co-sponsoring or co-branding certain services, promotions, or
                    events; to assist us in providing you with customer support; and to support our
                    IT and security efforts.
                  </li>
                  <li className={cls.body}>
                    We may share your information with our affiliates and subsidiaries, and may also
                    provide information to our attorneys, banks, auditors, and other service
                    providers.
                  </li>
                </ul>
                <p className="text-sm font-semibold text-ws-text-primary">
                  Other Sharing Practices
                </p>
                <p className={cls.body}>We may disclose your information as:</p>
                <ul className={cls.bulletList}>
                  {[
                    "required by law, including, for example, to comply with a court order or subpoena, or in response to a law enforcement agency's request;",
                    "to help protect our rights or enforce our Terms of Use;",
                    "to support our detection, prevention, or response to fraud or intellectual property infringement;",
                    "to help protect your safety or security, including the safety and security of property that belongs to you.",
                  ].map(item => (
                    <li key={item.slice(0, 40)} className={cls.body}>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className={cls.body}>
                  We may also share such information in connection with any potential or actual
                  merger or acquisition. We may also share information about you to the extent
                  reasonably necessary to proceed with the consideration, negotiation, or completion
                  of a merger, reorganization, or acquisition of our business, or a sale,
                  liquidation, or transfer of some or all of our assets.
                </p>
                <p className={cls.body}>
                  We do not sell personal information or compile reports using it to any third
                  parties. We are not a consumer reporting agency.
                </p>
                <p className={cls.body}>
                  This includes exchanging information with other companies and organizations for
                  the purposes of fraud detection, protection and credit risk reduction, including
                  any information that may be used and disclosed pursuant to the Fair Credit
                  Reporting Act and its Red Flags Rule. We will take reasonably necessary steps to
                  ensure that where personal information is shared, it is treated securely and in
                  accordance with this Notice and applicable laws.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>4. Retention of Personal Information</p>
                <p className={cls.body}>
                  We consider the following criteria when determining how long a particular record
                  will be retained, including any personal information contained in that record:
                </p>
                <ul className={cls.bulletList}>
                  {[
                    "How long the record is needed to provide you with the products and services you request;",
                    "How long the record is needed to support and enhance our operational processes;",
                    "How long the record is needed to protect our rights and legal interests;",
                    "How long the record must be retained to comply with applicable laws and regulations.",
                  ].map(item => (
                    <li key={item.slice(0, 40)} className={cls.body}>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className={cls.body}>
                  The same personal information about you may be included in more than one record
                  and used for more than one purpose, each of which may be subject to different
                  retention periods based on the factors listed above.
                </p>
              </div>

              {/* Section 5 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>5. Your Privacy Rights and Choices</p>
                <p className={cls.body}>
                  Depending on your state of residency, and the type of data collected, you may have
                  rights with respect to Personal Information about you. We may, at our discretion,
                  choose to extend these rights to you even if we are not required to under
                  applicable law.
                </p>
                {[
                  {
                    label: "Right to Access/Know",
                    text: "You may be entitled to request that we disclose to you the personal information we have collected about you, including the categories of personal information, the categories of sources from which we collected the information, the business or commercial purposes of collecting the information, the categories of third parties with whom we have shared the information, and the categories of personal information that we have shared with third parties for a business purpose. In some instances, you may have the right to receive the information about you we have collected in a portable and readily usable format.",
                  },
                  {
                    label: "Right to Data Portability",
                    text: "Subject to certain conditions, you may be entitled to request that we disclose to you the personal information we have collected about you in a portable, and to the extent feasible, usable format that allows you to transmit the data to another entity without hindrance.",
                  },
                  {
                    label: "Right to Correct",
                    text: "Subject to certain conditions, you may request that we correct any mistakes in Personal Information about you or update your preferences; however, we may not be able to accommodate your request if we believe it would violate any law or legal requirement or cause the information to be incorrect. We may delete the contested Personal Information as an alternative to correcting the information if the deletion of the Personal Information does not negatively impact you, or you consent to the deletion.",
                  },
                  {
                    label: "Right to Deletion",
                    text: "Subject to certain conditions, you may be entitled to request that we delete personal information about you. Before deleting information, we must be able to verify your identity. We will not delete personal information about you when the information is required to fulfill a legal obligation, is necessary to exercise or defend legal claims, or where we are required or permitted to retain the information by law.",
                  },
                  {
                    label: "Right to Non-Discrimination",
                    text: "You may have the right to not be discriminated against for exercising any of the above-listed rights. We may, however, provide a different level of service or charge a different rate reasonably relating to the value of your personal information.",
                  },
                  {
                    label: "Right to Opt Out of Sale or Sharing",
                    text: "We currently do not sell or share Personal Information for purposes of cross-contextual behavioral/targeted advertising.",
                  },
                  {
                    label: "Right to Limit Use and Disclosure of Sensitive Personal Information",
                    text: "We only process sensitive personal information for purposes considered necessary under applicable law and therefore do not offer this option.",
                  },
                  {
                    label: "Right to Opt Out of Marketing Emails",
                    text: "To stop receiving our promotional emails, follow the instructions in any promotional message you get from us. If you object to our use of your information for direct marketing purposes, please email us at [INSERT EMAIL ADDRESS]. Even if you opt out of getting marketing messages, we will still send you transactional messages. These include responses to your questions.",
                  },
                  {
                    label: "Right to Limit Cookies and Tracking Tools",
                    text: "We typically only use essential cookies. However, if we choose to employ third-party cookies for analytical or marketing purposes, we will prompt you to select your choices for non-essential cookies when you first visit A2B. We will also periodically confirm your choices, which you can modify.",
                  },
                ].map(item => (
                  <p key={item.label} className={cls.body}>
                    <span className={cls.inlineLabel}>{item.label}:</span> {item.text}
                  </p>
                ))}
                <p className={cls.body}>
                  We do not discriminate against you if you choose to exercise any of these rights.
                  If we deny your request, you may also have the right to appeal that decision.
                  Instructions on how to appeal any denial will be included in the notice of denial.
                </p>
                <p className={cls.body}>
                  Depending on your residency, these rights may not apply to pseudonymous data if
                  the information necessary to identify the consumer is kept separately and is
                  subject to controls that prevent access to the information.
                </p>
                <p className={cls.body}>
                  Data solely retained for data backup or archive purposes is principally excluded
                  from these rights until it is restored to an active system or next accessed or
                  used for a sale, disclosure, or commercial purpose.
                </p>
                <p className={cls.body}>
                  Please note that under applicable privacy law, we are only obligated to respond to
                  personal information requests from the same consumer up to two times in a 12-month
                  period.
                </p>
                <p className={cls.body}>
                  <span className={cls.inlineLabel}>
                    Additional Information for Residents of Colorado and California (to the extent
                    those laws apply):
                  </span>{" "}
                  We will maintain all of your Consumer Data Rights requests for at least 2 years.
                  This information will not be used for any other purpose except to review
                  compliance processes; it will not be shared except as necessary to comply with a
                  legal obligation.
                </p>
                <p className={cls.body}>
                  You may also be entitled to request in writing a list of the types of personal
                  information that we have disclosed to a third party for their direct marketing
                  purposes during the preceding year and to whom that information was disclosed.
                </p>
              </div>

              {/* Section 6 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>6. Submitting Privacy Requests</p>
                <p className={cls.body}>
                  You can exercise your privacy rights by submitting requests to us and by taking
                  other steps that will limit how information about you is collected, used, and
                  shared.
                </p>
                <p className={cls.body}>
                  If your state grants the consumer rights referenced above, to the extent
                  applicable, you may exercise your privacy rights by submitting a personal
                  information request by downloading the Personal Data Request Form by clicking on
                  this link [INSERT LINK], completing the form and emailing the completed form to
                  [INSERT EMAIL ADDRESS] or by calling us at [INSERT TELEPHONE NUMBER].
                </p>
                <p className={cls.body}>
                  When you submit a request to us, we may verify your identity where required by law
                  by asking you for the following pieces of information: your relationship with us,
                  first and last name, email address, telephone number, postal address, last four
                  digits of your social security number, driver&rsquo;s license number, your account
                  PIN, photo identification, or your date of birth.
                </p>
                <p className={cls.body}>
                  If we are unable to verify your identity as part of your request, we will not be
                  able to satisfy your request. For deletion requests, you will be required to
                  submit a verifiable request for deletion and then confirm separately that you want
                  personal information about you deleted.
                </p>
                <p className={cls.body}>
                  If you would like to appoint an authorized agent to make a request on your behalf,
                  we require you to verify your identity with us directly before we provide any
                  requested information to your approved agent. There may be circumstances where we
                  will not be able to honor your request. We will notify you if we are unable to
                  honor your request.
                </p>
              </div>

              {/* Section 7 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>7. Cookies and Related Technologies</p>
                <p className="text-sm font-semibold text-ws-text-primary">
                  Gathering and Use of Technical Usage and Personal Information
                </p>
                <p className={cls.body}>
                  Like most website operators, we gather technical usage information that web
                  browsers, depending on their settings, make available. As we want to be responsive
                  to you and to ensure the proper functioning of our products and organization, we
                  may use the information collected to:
                </p>
                <ul className={cls.bulletList}>
                  {[
                    "ensure content from A2B and the Site is presented in the most effective manner for you and your device;",
                    "allow you to navigate or browse through A2B and the Site quickly and efficiently;",
                    "monitor and analyze trends, usage and activity in connection with A2B and the Site and services to improve A2B and the Site;",
                    "administer A2B and the Site and for internal operations, in order to conduct troubleshooting, data analysis, testing, research, statistical and survey analysis;",
                    "protect our rights, your rights and the rights of others;",
                    "investigate and respond to any complaints;",
                    "comply with legal obligations;",
                    "verify the user's eligibility to access any restricted areas of the Site, including A2B; and",
                    "provide users with customer support.",
                  ].map(item => (
                    <li key={item.slice(0, 40)} className={cls.body}>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-semibold text-ws-text-primary">What Are Cookies?</p>
                <p className={cls.body}>
                  Cookies are small text files placed on your device by your browser. Cookies allow
                  us to recognize your browser, remember your preferences, keep you signed in, and
                  understand how you use A2B. They may be set by us (first-party cookies) or by
                  others (third-party cookies, such as for analytics or advertising).
                </p>
                <p className={cls.body}>
                  When you access A2B and the Site, we may use the following types of tracking
                  technologies:
                </p>
                <ul className={cls.bulletList}>
                  {[
                    "Web beacons / pixel tags — Tiny graphics or snippets of code that link web pages or emails to our servers (and their cookies). They help us measure the effectiveness of campaigns, understand usage, and deliver content.",
                    "Advertising identifiers — Resettable identifiers provided by mobile operating systems (such as Apple's Identifier for Advertisers (IDFA) or Google's Advertising ID (AAID)). These work in a similar way to cookies and are used for advertising and analytics purposes.",
                    "Session replay technologies — Tools that may record how you interact with A2B (such as clicks, scrolling, and navigation) to help us diagnose issues, analyze usage, and improve your experience.",
                    "Local storage and similar technologies — Web browsers and apps may also use local storage (including HTML5 local storage and caches) and software development kits ('SDKs') to save information directly on your device.",
                    "Device and browser fingerprinting — In some cases, we may use technical information about your browser, device, or network (such as fonts, screen resolution, or plug-ins) to help recognize your device for security, analytics, or advertising purposes.",
                  ].map(item => (
                    <li key={item.slice(0, 40)} className={cls.body}>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-semibold text-ws-text-primary">
                  Types of Cookies We Use
                </p>
                <p className={cls.body}>
                  Third-party cookies belong to and are managed by other parties. These cookies may
                  be required to render certain forms, such as email list sign-up, or to allow for
                  some advertising outside of A2B. Session cookies are temporary cookies that are
                  used to remember you during the course of your visit to A2B, and they expire when
                  you close the web browser.
                </p>
                <p className={cls.body}>
                  Persistent cookies are used to remember your preferences within A2B and remain on
                  your desktop or mobile device even after you close your browser or restart your
                  computer. We use these cookies to analyze user behavior to establish visit
                  patterns so that we can improve A2B functionality for you and others who visit.
                </p>
                <p className="text-sm font-semibold text-ws-text-primary">
                  How Do I Reject and Delete Cookies?
                </p>
                <p className={cls.body}>
                  You can choose to reject or block all or specific types of cookies for A2B by
                  changing your browser settings. Please note that most browsers automatically
                  accept cookies. Therefore, if you do not wish cookies to be used, you may need to
                  actively delete or block the cookies. If you reject the use of cookies, you will
                  still be able to visit A2B but some of the functions may not work correctly. By
                  using A2B without deleting or rejecting some or all cookies, you agree that we can
                  place those cookies that you have not deleted or rejected on your device.
                </p>
              </div>

              {/* Section 8 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>8. Do Not Track / Global Privacy Control</p>
                <p className={cls.body}>
                  Various third parties are developing ways for consumers to express their choice
                  about the collection of the individual consumer&rsquo;s online activities over
                  time and across third-party websites or online services. We typically only use
                  essential cookies. However, if we choose to employ third-party cookies for
                  analytical or marketing purposes, we will prompt you to select your choices for
                  non-essential cookies when you first visit A2B. We have tools in place to better
                  detect and honor requests made using the Global Privacy Control
                  (&ldquo;GPC&rdquo;) signal as requests to opt out of the sharing of Personal
                  Information to the extent required by applicable law and to the extent we employ
                  third-party cookies.
                </p>
              </div>

              {/* Section 9 */}
              <div id="privacy-section-9" className="space-y-2">
                <p className={cls.sectionHeading}>9. Security Measures</p>
                <p className={cls.body}>
                  The security and confidentiality of the information we collect or receive is
                  extremely important to us, and we take our responsibility to protect this
                  information very seriously. We have implemented commercially reasonable technical,
                  administrative, and physical security measures to protect the information that we
                  collect or receive.
                </p>
                <p className={cls.body}>
                  From time to time, we review and consider updates for our security procedures.
                  Please be aware, though that, despite our ongoing efforts, no security measures
                  are perfect or impenetrable. This means that we cannot ensure or warrant the
                  security of any information we collect about you, and therefore your use of A2B
                  and the Site is at your own risk.
                </p>
                <p className={cls.body}>
                  The safety and security of your information also depends on you. Where we have
                  given you (or where you have chosen) a password for access to certain parts of
                  A2B, you are responsible for keeping this password confidential. We ask you not to
                  share your password with anyone. Unfortunately, the transmission of information
                  via the internet is not completely secure. Although we strive to use commercially
                  reasonable means to protect your personal information, we cannot guarantee the
                  security of your personal information transmitted to A2B, via phone, paper forms,
                  or otherwise. Any transmission of personal information is at your own risk.
                </p>
              </div>

              {/* Section 10 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>10. Other Websites and Links</p>
                <p className={cls.body}>
                  A2B may include links to other websites or references and information about other
                  websites whose privacy practices may be different from ours. If you submit
                  personal information to any of those sites, your information is governed by their
                  privacy policies. We encourage you to carefully read the privacy policy of any
                  website you visit.
                </p>
                <p className={cls.body}>
                  We may link the information that we collect automatically with the information you
                  provide us. And we may combine the information we collect online with information
                  we collect offline or that is collected by third parties.
                </p>
              </div>

              {/* Section 11 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>11. Newsletters and Marketing Communications</p>
                <p className={cls.body}>
                  Where you sign up to receive email notifications from us on A2B, we will send the
                  communications that you have requested (including information about corporate
                  events, press releases, presentations and company documents). You can opt-out of
                  receiving such communications at any time by contacting us or by clicking
                  &ldquo;unsubscribe&rdquo; in the email.
                </p>
              </div>

              {/* Section 12 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>12. Children&rsquo;s Information</p>
                <p className={cls.body}>
                  A2B is not targeted at children or anyone under the age of eighteen (18). We will
                  delete any personal information we determine to have been collected from a child
                  or user under the age of thirteen (13). If you are a parent or guardian of a child
                  under the relevant digital age of consent and believe he or she has disclosed
                  personal data to us, please contact us at [INSERT EMAIL ADDRESS] or on [INSERT
                  TELEPHONE NUMBER].
                </p>
              </div>

              {/* Section 13 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>13. Changes to This Notice</p>
                <p className={cls.body}>
                  It is our policy to post any changes we make to this Notice on this page. The date
                  this Notice was last revised is identified at the beginning of this Notice. You
                  are responsible for ensuring we have an up-to-date active and deliverable email
                  address for you, and for periodically visiting A2B and this Notice to check for
                  any changes.
                </p>
              </div>

              {/* Section 14 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>14. How Can You Contact Us?</p>
                <p className={cls.body}>
                  If you have any questions in relation to this Notice, please contact us at [INSERT
                  EMAIL ADDRESS] or on [INSERT TELEPHONE NUMBER]. If you wish to contact Lafayette
                  Square regarding your Personal Information or this Notice, please submit the
                  information by clicking on this Personal Data Request Form [INSERT LINK].
                </p>
                <p className={cls.body}>
                  This Notice is posted at the footer of the Lafayette Square A2B platform at
                  [INSERT A2B URL]. Last Updated: [INSERT DATE].
                </p>
              </div>
            </div>
          </div>
        </ModalContent>

        {/* Modal Footer with Buttons */}
        <ModalFooter className="flex items-start gap-3 border-0 pb-6 px-6 pt-0">
          {buttons.map(button => (
            <Button
              key={button.text}
              type="button"
              color={button.color || "primary"}
              size="xl"
              onClick={button.onClick}
              className={buttons.length === 1 ? "w-full" : "flex-1"}
              isDisabled={button.isDisabled}
            >
              {button.text}
            </Button>
          ))}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PrivacyModal;
