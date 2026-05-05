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
  arbitrationNotice: "text-sm font-semibold text-ws-navy-900 leading-relaxed uppercase",
  body: "text-sm text-ws-text-secondary leading-relaxed",
  bodyUpper: "text-sm text-ws-text-secondary leading-relaxed uppercase",
  bulletList: "list-disc pl-5 space-y-1",
  bulletItem: "text-sm text-ws-text-secondary leading-relaxed",
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

export const TermsModal = ({
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
            <ModalTitle className="font-display text-2xl font-semibold leading-8 text-ws-navy-900 mb-0 mt-4 ">
              {title}
            </ModalTitle>
            {subtitle && (
              <>
                <p className="font-body text-sm font-normal leading-5 text-ws">{subtitle}</p>
                <p className="font-body text-sm font-normal leading-5 text-ws">{subtitleOne}</p>
              </>
            )}
          </div>

          {/* Padding Bottom */}
          <div className={`${paddingBottom} w-full shrink-0`} />
        </ModalHeader>

        <ModalContent className="border-0 pt-0 px-2">
          <div className="w-full h-120 overflow-y-scroll pl-4 pb-6 pr-4">
            <div className="space-y-4">
              {/* Header */}
              <div className="space-y-1"></div>

              {/* Intro paragraphs */}
              <p className={cls.body}>
                The following terms and conditions, together with any documents incorporated by
                reference (collectively, the "Terms of Use"), govern your access to and use of the
                Lafayette Square Access2Benefits platform, a workforce analytics platform, including
                any questionnaires, dashboards, reports, content, functionality, and services
                offered through the platform ("A2B"). The effective date of your agreement to these
                Terms of Use shall be deemed to be the date of your first login to A2B. Please read
                these Terms of Use carefully before using A2B. Your access to and use of A2B is
                subject to these Terms of Use and all applicable laws and regulations.
              </p>
              <p className={cls.body}>
                These Terms of Use constitute a legal agreement between you and Lafayette Square
                Foundation, Inc. and its subsidiaries and affiliates (also known as Lafayette Square
                Institute and referred to in these Terms of Use as "Lafayette Square," "we," "us,"
                or "our"). A2B is available only to individuals who can form legally binding
                contracts under applicable law and is not intended for use by individuals under the
                age of 18.
              </p>
              <p className={cls.body}>
                By accessing, using, or visiting A2B, you agree to be bound by these Terms, and
                further agree that you are responsible for compliance with any applicable laws and
                regulations, including any local laws. If you accept these Terms of Use on behalf of
                an organization, you represent that you have the authority to bind that
                organization. If you do not agree with any of these Terms of Use, in whole or in
                part, you should stop using A2B immediately. These Terms apply exclusively to your
                use of A2B and do not alter the terms or conditions of any other agreement you may
                have with Lafayette Square.
              </p>
              <p className={cls.arbitrationNotice}>
                Please note the arbitration provision below, which may require you to arbitrate
                claims against Lafayette Square on an individual basis and limit your right to a
                judge, jury, or class action.
              </p>

              {/* Section 1 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>1. Changes to Terms</p>
                <p className={cls.body}>
                  We may update these Terms of Use based on changes to A2B and other factors.
                  Lafayette Square has the right, in its sole discretion, to add to, remove, modify,
                  update, or otherwise change any part of these Terms of Use, in whole or in part,
                  at any time. Any changes, modifications, or updates made to the Terms of Use go
                  into effect once they are posted. We will notify you of changes to these Terms of
                  Use via our website or other reasonable means and change the "Last Updated" date
                  above, as applicable. Your continued use of A2B following the posting of revised
                  Terms of Use constitutes your acceptance of any changes made to these Terms of
                  Use, and by using A2B, you are agreeing to be bound by the then-current version of
                  these Terms of Use. If you do not agree to the new terms, you should stop using
                  A2B. Any revised terms and conditions and disclaimers shall supersede all previous
                  versions.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>2. Use of A2B and Restrictions</p>
                <p className={cls.body}>
                  Lafayette Square hereby grants you a non-exclusive, non-transferable, revocable,
                  and limited license to access and use A2B solely for internal, non-commercial,
                  informational, research, and educational purposes, subject to your continued
                  compliance with these Terms of Use.
                </p>
                <p className={cls.body}>
                  This is not a transfer of title; under this license you may not:
                </p>
                <ul className={cls.bulletList}>
                  {[
                    'Modify, copy (whether by printing off onto paper, storing on disk, downloading or in any other way), distribute (including distributing copies), broadcast, stream (including "mirroring" A2B on any other server), transmit, display, perform, reproduce, publish, license, create derivative works from, sell, or exploit any portion of A2B or its content, or alter or tamper in any way or otherwise use the Content contained on A2B (whether in whole or in part);',
                    "Use the Content or A2B for any commercial purpose (including, without limitation, commercial solicitation or advertising) or for any public display (whether commercial or non-commercial);",
                    "Attempt to decompile or reverse engineer any software, source code, or any other aspect of A2B or related sites;",
                    "Access or use A2B or the Content for purposes of building a competitive product or service, provide a product or service using similar ideas, functions, or graphics, copy any proprietary features or graphics from A2B, or for any other purposes that would be to Lafayette Square's disadvantage;",
                    "Access or use A2B or the Content to send spam or otherwise duplicative or unsolicited messages in violation of applicable laws;",
                    "Permit others to use your login credentials or use the login credentials of any other person or third party to access A2B;",
                    "Use any automated means (including robots, spiders, or scrapers) to access A2B;",
                    "Interfere with the security, functionality, or performance of A2B;",
                    "Input, upload, or otherwise provide to or through A2B any information or material that is unlawful or injurious;",
                    "Contain, transmit, or activate any software, viruses, worms, time bombs, Trojan horses, or other harmful or malicious computer code, files, scripts, agents, or programs;",
                    "Damage, destroy, disrupt, disable, impair, interfere with, or otherwise impede or harm in any manner A2B, Lafayette Square's computing systems, or Lafayette Square's provision of solutions to any third party (in whole or in part);",
                    "Attempt to access data not intended for you; or",
                    "Otherwise access or use A2B beyond the scope of authorization granted to you under these Terms of Use or for any unlawful purpose or in violation of these Terms of Use.",
                  ].map(item => (
                    <li key={item.slice(0, 40)} className={cls.body}>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className={cls.body}>
                  In addition, you agree that you are solely responsible for actions or
                  communications undertaken in the course of your usage of A2B and that you will
                  comply with all laws that apply or may apply to your use of or activities on A2B.
                  Lafayette Square will investigate occurrences which may involve violations of such
                  laws, and may involve, and cooperate with, law enforcement authorities in
                  prosecuting users who are involved in such violations. Lafayette Square reserves
                  the right at all times to disclose any information transmitted by your using A2B
                  as necessary to satisfy any law, regulation, or governmental request. This license
                  may be terminated by Lafayette Square at any time in its sole discretion and shall
                  automatically terminate if you violate any of these restrictions. Any rights not
                  expressly granted are reserved by Lafayette Square.
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>3. Password; Account Security</p>
                <p className={cls.body}>
                  Access to A2B may require a username and password. You are solely responsible for
                  maintaining the confidentiality of your credentials and for all activity occurring
                  under your account. If you use a username, password, or any other piece of
                  information in order to access any part of A2B, you must treat such information as
                  confidential and you must not disclose it to any other person or entity. To the
                  extent you access or connect to A2B through Finch or any other third-party
                  integration or connectivity service, you represent and warrant that you have been
                  duly authorized by your employer or organization to establish such connection and
                  to transmit any data in connection therewith. You also acknowledge that your
                  account is personal to you and agree not to provide any other person or entity
                  with access to A2B or portions of it using your username, password, or other
                  security information or credentials. You agree to notify us in writing immediately
                  at [insert contact email] of any unauthorized access to or use of your username or
                  password or any other breach of security. If applicable, you also agree to ensure
                  that you exit from your account at the end of each session. You should use
                  particular caution when accessing A2B and/or your account from a public or shared
                  computer so that others are not able to view or record your password or other
                  personal information. We have the right to disable any username, password, or
                  other identifier, whether chosen by you or provided by us, at any time in our sole
                  discretion, including if, in our opinion, you have violated any provision of these
                  Terms of Use. Lafayette Square is not responsible for unauthorized access to your
                  account resulting from your failure to safeguard your credentials. For a
                  description of the security measures Lafayette Square has implemented to protect
                  your information, please refer to Section 9 (Security Measures) of the Privacy
                  Notice, available at [INSERT PRIVACY NOTICE LINK].
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>4. Children</p>
                <p className={cls.body}>
                  A2B is not targeted at children or anyone under the age of eighteen (18). We do
                  not knowingly gather or solicit personal information from children under the age
                  of eighteen (18) through A2B for marketing or other purposes. If we determine that
                  personal information has been collected from a child under the age of thirteen
                  (13), we will delete such information promptly. If you are a parent or guardian of
                  a child under thirteen (13) and believe that child has disclosed personal
                  information to us through A2B, please contact us using the information in Section
                  20 (Contact Us) below. By using A2B, you represent that you are at least eighteen
                  (18) years of age.
                </p>
              </div>

              {/* Section 5 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>5. User Submissions and Truthful Information</p>
                <p className={cls.body}>
                  As a condition of use, you represent and warrant that all information you submit
                  through A2B (including, without limitation, workforce, compensation, and benefits
                  data ("User Data")) is truthful, accurate, complete, and submitted with proper
                  authorization.
                </p>
                <p className={cls.body}>
                  You further represent that your submission of User Data complies with any and all
                  applicable laws, and you further acknowledge and agree that you are responsible
                  for compliance with all applicable laws, confidentiality obligations, and internal
                  organizational policies regarding such User Data. You acknowledge that User Data
                  you submit may contain Personal Information (as defined in the Privacy Notice). To
                  the extent User Data constitutes or contains Personal Information, Lafayette
                  Square's collection, use, and disclosure of such Personal Information is governed
                  by the Privacy Notice, which is incorporated into these Terms of Use by reference
                  in Section 10 (Privacy Notice) below.
                </p>
              </div>

              {/* Section 6 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>6. Use of Data; Aggregation and Benchmarking</p>
                <p className={cls.body}>
                  Lafayette Square may use User Data, including any Personal Information contained
                  therein, for the following purposes, as more fully described in the Privacy
                  Notice:
                </p>
                <ul className={cls.bulletList}>
                  {[
                    "Providing services — to carry out obligations arising from our membership agreements or other governing documents, including account management and administrative purposes;",
                    "Operating and improving A2B — to evaluate, operate, and improve A2B, including generating dashboards, summaries, and insights for your account;",
                    "Analytics — to learn more about how you interact with A2B;",
                    "Communications and feedback — to respond to your inquiries and feedback;",
                    "Research and educational purposes — to conduct aggregated, anonymized research and analysis in furtherance of Lafayette Square's mission as a nonprofit organization focused on workforce analytics and benefits policy. Such research will not use identifiable User Data without your separate consent;",
                    "Compliance and legal — to comply with applicable laws, regulations, and internal policies, fulfill legal obligations, or address legal claims; and",
                    "Security — to detect security incidents and protect against malicious, fraudulent, or illegal activity.",
                  ].map(item => (
                    <li key={item.slice(0, 40)} className={cls.body}>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className={cls.body}>
                  Lafayette Square may aggregate and anonymize User Data such that it cannot
                  reasonably identify you or your organization. Aggregated and anonymized data may
                  be used for benchmarking, research, publications, and educational materials.
                </p>
                <p className={cls.body}>
                  Lafayette Square does not sell personal information or compile reports using
                  personal information for sale to any third parties. For the avoidance of doubt,
                  the sharing of Personal Information described in the Privacy Notice (including
                  with service providers, affiliates, and government entities as required by law)
                  does not constitute a "sale" for purposes of these Terms of Use.
                </p>
                <p className={cls.body}>
                  For a complete description of how we collect, use, and disclose your Personal
                  Information, including User Data that constitutes Personal Information, please
                  refer to our Privacy Notice at [INSERT PRIVACY NOTICE LINK].
                </p>
              </div>

              {/* Section 7 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>7. Ownership of Content</p>
                <p className={cls.body}>
                  A2B and all content therein, including text, graphics, charts, dashboards,
                  software, data compilations, and logos ("Content"), are the property of Lafayette
                  Square or its licensors and are protected by U.S. and international intellectual
                  property laws. The Content also features registered and non-registered trademarks
                  that are protected by applicable trademark laws. Lafayette Square and its
                  licensors retain all proprietary rights to the Content. You may only use the
                  Content to access information, use A2B, and for other uses consistent with these
                  Terms of Use. The Content may not be reproduced, transmitted, or distributed
                  without the prior written consent of Lafayette Square. You may not use any Content
                  for commercial purposes without Lafayette Square's prior written consent.
                </p>
              </div>

              {/* Section 8 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>8. Disclaimer of Warranties</p>
                <p className={cls.bodyUpper}>
                  Your use of A2B is at your sole risk. A2B, all content, and any third-party
                  content, links, and materials on A2B are provided on an "as is," "with all
                  faults," and "as available" basis. Lafayette Square and its licensors make no
                  representation, guaranty, or warranty (whether expressed or implied) as to the
                  reliability, timeliness, quality, suitability, truth, availability, accuracy, or
                  completeness of A2B or any content. To the fullest extent permitted by law, all
                  representations and warranties, whether express or implied, including, without
                  limitation, any implied warranty of merchantability, fitness for a particular
                  purpose, title, non-infringement, and course of performance, are hereby
                  specifically disclaimed. You acknowledge and agree that your use of A2B is at your
                  own risk.
                </p>
                <p className={cls.body}>
                  <span className={cls.inlineLabel}>No Reliance; Informational Purposes Only:</span>{" "}
                  A2B provides general workforce and benefits insights for informational and
                  educational purposes only. Nothing on A2B constitutes legal, financial, tax,
                  actuarial, or benefits advice, and no content, output, recommendation, or
                  suggestion generated by or through A2B should be relied upon as such. Any
                  recommendations, suggestions, or insights provided by A2B are for informational
                  purposes only and do not constitute professional advice of any kind. You
                  acknowledge and agree that you are solely responsible for evaluating and making
                  any decisions based on any recommendations, suggestions, insights, or other
                  information provided through A2B, and Lafayette Square expressly disclaims any and
                  all liability and responsibility for any actions taken or not taken by you in
                  reliance on any such recommendations or suggestions. Lafayette Square recommends
                  that you seek independent professional advice before making any legal, financial,
                  tax, actuarial, or benefits-related decisions based on information obtained from
                  A2B.
                </p>
                <p className={cls.body}>
                  <span className={cls.inlineLabel}>Availability:</span> No warranty or
                  representation is made that A2B or any part or function thereof will be available
                  and not subject to interruption at any time.
                </p>
                <p className={cls.body}>
                  <span className={cls.inlineLabel}>Disabling Devices:</span> No warranty or
                  representation is made that any Content, service, product or function, including
                  without limitation any downloadable files, available on A2B is free of computer
                  viruses, malware or other destructive or harmful programs, software, code or
                  devices. You should routinely scan your system and downloaded files for such
                  disabling devices.
                </p>
                <p className={cls.bodyUpper}>
                  <span className="font-medium">Data and Information:</span> We reserve the right at
                  all times to disclose any information, as we deem necessary to satisfy any
                  applicable law, regulation, legal process or governmental request. Except as
                  expressly provided in these Terms of Use, Lafayette Square has no obligation or
                  liability for any loss, alteration, destruction, corruption, or recovery of your
                  User Data or personal information (as defined in the Privacy Notice). For a
                  description of Lafayette Square's security practices, please refer to Section 9
                  (Security Measures) of the Privacy Notice.
                </p>
              </div>

              {/* Section 9 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>9. Limitation of Liability</p>
                <p className={cls.bodyUpper}>
                  To the fullest extent provided by law, in no event will Lafayette Square or any of
                  its affiliates or licensors have any responsibility or liability in connection
                  with A2B for any loss or damages whatsoever, whether based on contract,
                  negligence, tort or other legal basis, including, without limitation, with respect
                  to any direct, indirect, special, punitive, exemplary or consequential damages or
                  other damages (including, without limitation, any damages for harm to business,
                  loss of information or programs or data, loss of profit, loss of savings, loss of
                  revenue, loss of goodwill), arising from or in connection with the use of or
                  access to, or any inconvenience, delay or loss of use of or access to, A2B, any
                  content or any third-party sites. If any part of this limitation of liability is
                  found to be invalid or unenforceable for any reason, then Lafayette Square's
                  aggregate liability under such circumstances shall not exceed one hundred dollars
                  ($100). The foregoing does not affect any liability that cannot be excluded or
                  limited under applicable law.
                </p>
                <p className={cls.bodyUpper}>
                  Without limiting the generality of the foregoing, Lafayette Square shall have no
                  liability or responsibility whatsoever for any recommendations, suggestions, or
                  insights generated by or through A2B. You acknowledge and agree that you are
                  solely responsible for any and all decisions made, and any actions taken or not
                  taken, based on or in reliance upon any recommendations, suggestions, insights, or
                  other output provided by A2B.
                </p>
              </div>

              {/* Section 10 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>10. Privacy</p>
                <p className={cls.body}>
                  Any information you provide, and that Lafayette Square collects, including via
                  A2B, is subject to our Privacy Notice at [insert Privacy Notice link] (the
                  "Privacy Notice"), which is an integral part of these Terms of Use and is hereby
                  incorporated by reference.{" "}
                  <span className="uppercase">
                    Notice regarding consent to data collection and use: By accessing or using A2B,
                    you hereby expressly consent to Lafayette Square and its representatives
                    collecting, using, and disclosing your personal information — including
                    identifiers, contact information, demographic information, internet activity
                    information, device and location information, account information, and any other
                    categories of personal information described in the Privacy Notice — in the
                    manner described in the Privacy Notice.
                  </span>{" "}
                  You should review the Privacy Notice carefully before using A2B. Your continued
                  use of A2B constitutes your ongoing consent to the data practices described in the
                  Privacy Notice, as amended from time to time.
                </p>
              </div>

              {/* Section 11 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>11. Linked Third-Party Websites</p>
                <p className={cls.body}>
                  A2B may contain links to websites or services owned or operated by third parties
                  ("Third-Party Sites") or permit a link from a Third-Party Site to A2B. Third-Party
                  Sites are not owned or controlled by us. Lafayette Square has not reviewed all of
                  the Third-Party Sites linked to A2B and is not responsible for the contents of any
                  such linked Third-Party Sites. The inclusion of any link does not imply
                  endorsement by Lafayette Square of the Third-Party Sites. Use of any such linked
                  Third-Party Sites is at your own risk.{" "}
                  <span className="uppercase">
                    Lafayette Square is not responsible or liable to you or any other party for any
                    third-party sites' materials or any use thereof by you or any other user
                    (including any liability arising out of any claim that the content of any
                    third-party sites infringes the intellectual property rights of any third
                    party).
                  </span>
                </p>
              </div>

              {/* Section 12 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>12. Linking to A2B</p>
                <p className={cls.body}>
                  Linking to A2B from a Third-Party Site indicates that you accept these Terms of
                  Use and that you will abide by the guidelines below. By linking to A2B, you agree
                  that you will not:
                </p>
                <ul className={cls.bulletList}>
                  {[
                    "Replicate any of the Content or other material or information on A2B;",
                    "Frame or otherwise create a browser or border environment around A2B or the Content;",
                    "State or imply that Lafayette Square is endorsing you, your company or business, your website or its contents, or your products or services;",
                    "Misrepresent your or your website's relationship with Lafayette Square;",
                    "Present false, misleading, or inaccurate information about Lafayette Square, our products or services, any of our affiliates, or any of our affiliates' products or services;",
                    "Use Lafayette Square's trademarks, logos, or copyrighted materials without obtaining the express prior written authorization from Lafayette Square;",
                    "Include content on your website that is or could reasonably be construed as illegal, distasteful, offensive, or controversial; or",
                    "Link to an internal page of A2B that is located one or several levels down from the home page or bring up or present content on A2B or another website without obtaining prior written authorization from Lafayette Square.",
                  ].map(item => (
                    <li key={item.slice(0, 40)} className={cls.body}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 13 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>13. Policy for Submitted Ideas</p>
                <p className={cls.body}>
                  Lafayette Square maintains a policy not to accept any ideas from the public in
                  order to avoid possible future confusion between such publicly submitted ideas and
                  ideas of our own and also to avoid restriction of our own original research and
                  development activities. Notwithstanding the foregoing request, you hereby grant to
                  Lafayette Square a royalty-free, perpetual, non-exclusive, irrevocable, worldwide
                  right and license to use, adapt, reproduce, modify, disseminate, publicly display,
                  incorporate into other works, or otherwise exploit all content, remarks,
                  suggestions, ideas, graphics, or other ideas and information submitted through the
                  A2B platform ("Submissions"). For the avoidance of doubt, "Submissions" expressly
                  excludes (i) User Data submitted by you in the ordinary course of using A2B's data
                  collection and benchmarking functionality, and (ii) any Personal Information
                  included within such User Data, which is governed exclusively by Section 6 of
                  these Terms of Use and the Privacy Notice.
                </p>
              </div>

              {/* Section 14 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>14. Modification, Monitoring, and Termination</p>
                <p className={cls.body}>
                  Lafayette Square reserves the right to modify, suspend, or terminate A2B or your
                  access to it at any time, with or without notice, at Lafayette Square's sole
                  discretion, for any reason whatsoever and without limitation, including but not
                  limited to a breach of these Terms of Use. All provisions of these Terms of Use
                  which by their nature should survive termination shall survive termination,
                  including, without limitation, provisions regarding ownership, warranty
                  disclaimers, termination, indemnity, limitation of liability, governing law, and
                  those falling under the "Miscellaneous" heading.
                </p>
              </div>

              {/* Section 15 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>15. Indemnification</p>
                <p className={cls.body}>
                  By using A2B, you agree to indemnify, hold harmless, and, at Lafayette Square's
                  request, defend Lafayette Square and its officers, directors, members, managers,
                  employees, agents, affiliates, licensors, successors, and assigns from and against
                  any and all claims, damages, obligations, losses, liabilities, and all costs,
                  debts, and expenses of defense, including but not limited to, reasonable
                  attorneys' fees and costs, resulting directly or indirectly from or arising out
                  of: (i) any User Data or personal data you provide to A2B; (ii) any violation of
                  these Terms of Use; (iii) your use and access of A2B, Content, or third-party
                  materials; or (iv) any other claim by a third party that is based on your use of
                  A2B in violation of these Terms of Use, in each case, except to the extent such
                  claim, demand, damage, loss, liability, or expense arises from our sole
                  negligence.
                </p>
              </div>

              {/* Section 16 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>16. Governing Law and Jurisdiction</p>
                <p className={cls.body}>
                  These Terms of Use shall be governed by and construed in accordance with the laws
                  of the State of Delaware, United States, without regard to its conflicts of law
                  provisions. Subject to Section 17 below, any legal suit, action, or proceeding
                  arising out of or related to these Terms of Use or A2B that is not subject to or
                  cannot be resolved by arbitration shall be instituted exclusively in the state and
                  federal courts located in Washington, D.C., although Lafayette Square retains the
                  right to bring any suit, action or proceeding against you for breach of these
                  Terms of Use in your state and/or county of residence if Lafayette Square so
                  chooses.
                </p>
                <p className={cls.bodyUpper}>
                  To the extent permitted by applicable law, any cause of action or claim you may
                  have arising out of or relating to these Terms of Use or A2B must be commenced
                  within one (1) year after the cause of action accrues; otherwise, such cause of
                  action or claim is permanently barred.
                </p>
              </div>

              {/* Section 17 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>17. Dispute Resolution and Arbitration</p>
                <p className={cls.body}>
                  Any dispute, claim, or controversy arising out of or relating to these Terms of
                  Use or A2B, including the determination of the scope or applicability of these
                  Terms of Use to arbitrate, shall be resolved by binding arbitration administered
                  by the American Arbitration Association ("AAA") in accordance with its Consumer
                  Arbitration Rules then in effect. A party who intends to seek arbitration must
                  first send a written notice of the dispute to the other party, by certified mail,
                  Federal Express, UPS, or Express Mail (signature required). The parties agree to
                  attempt to resolve the dispute informally for a period of thirty (30) days from
                  the date of such notice. The notice must be sent to Lafayette Square at [address].
                  The arbitration shall be conducted by a single arbitrator and shall take place in
                  Miami, Florida, consistent with the Federal Arbitration Act. The arbitrator's
                  award shall be final and binding, and judgment on the award may be entered in any
                  court of competent jurisdiction.
                </p>
                <p className={cls.bodyUpper}>
                  You waive the right to a trial by jury. You and Lafayette Square agree that any
                  arbitration shall be conducted on an individual basis and not as a class,
                  consolidated, or representative action. The arbitrator shall have no authority to
                  consolidate claims or preside over any form of class or representative proceeding.
                  If any court or arbitrator of competent jurisdiction determines that the class
                  action waiver set forth in this paragraph is void or unenforceable for any reason,
                  or that an arbitration can proceed on a class basis, then the arbitration
                  provision set forth in this Section 17 shall be deemed null and void in its
                  entirety.
                </p>
                <p className={cls.body}>
                  You may opt out of this arbitration provision by sending written notice to
                  Lafayette Square at [insert contact email] within thirty (30) days of your first
                  use of A2B. Your opt-out notice must include your name, mailing address, and a
                  clear statement that you wish to opt out of this arbitration provision. If you opt
                  out of this arbitration provision, all other provisions of these Terms of Use
                  shall remain in full force and effect.
                </p>
              </div>

              {/* Section 18 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>18. Infringement Notice</p>
                <p className={cls.body}>
                  If you believe in good faith that any of the Content infringes upon your copyright
                  rights, you may request that such Content be removed or that access to such
                  Content be blocked. All such notices shall be sent to Lafayette Square at the
                  address in the "Contact Us" section below. Please provide us with sufficient
                  contact information so that we may contact you if necessary to address your
                  notice. Any personal information you provide in the notice shall be used solely
                  for the purpose of addressing your request for removal.
                </p>
              </div>

              {/* Section 19 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>19. General Provisions</p>
                <p className={cls.body}>
                  No joint venture, partnership, employment, or agency relationship is created by
                  these Terms. If any provision is found unenforceable, the remaining provisions
                  shall remain in effect. Our failure to enforce any right or provision of these
                  Terms of Use will not be considered a waiver of those rights. These Terms of Use
                  constitute the entire agreement between us regarding A2B and supersede and replace
                  any prior agreements we might have had between us regarding A2B.
                </p>
                <p className={cls.body}>
                  You acknowledge and agree that A2B possesses a special, unique, and extraordinary
                  character that would make it difficult to assess the monetary damages resulting
                  from any unauthorized use and that unauthorized use may cause immediate and
                  irreparable damage to Lafayette Square or other users for which Lafayette Square
                  or such other users would not have an adequate remedy at law. Therefore, you agree
                  that, in the event of such unauthorized use, Lafayette Square shall be entitled to
                  injunctive and other equitable relief without the necessity of proving damages or
                  furnishing a bond or other security.
                </p>
                <p className={cls.body}>
                  <span className={cls.inlineLabel}>Force Majeure.</span> Lafayette Square shall not
                  be liable for any failure or delay in performing its obligations under these Terms
                  of Use arising from causes beyond its reasonable control, including but not
                  limited to acts of God, natural disasters, pandemic, fire, flood, earthquakes,
                  war, terrorism, civil unrest, government action, power or telecommunications
                  failures, cyberattacks, or other events outside of Lafayette Square's reasonable
                  control.
                </p>
              </div>

              {/* Section 20 */}
              <div className="space-y-2">
                <p className={cls.sectionHeading}>20. Contact Us</p>
                <p className={cls.body}>
                  If you have any questions about these Terms of Use, please contact us at [insert
                  contact details].
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

export default TermsModal;
