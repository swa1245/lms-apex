import React from 'react';
import { ArrowLeft, GraduationCap, Scale, Shield } from 'lucide-react';

export type LegalDoc = 'privacy' | 'terms';

const EFFECTIVE_DATE = '17 September 2026';
const PRODUCT_NAME = 'Campus LMS';
const OPERATOR = 'the institution operating this Campus LMS instance (“Institution”, “we”, “us”)';
const GRIEVANCE_EMAIL = 'privacy@campuslms.local';

type LegalShellProps = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onBack?: () => void;
  embedded?: boolean;
  children: React.ReactNode;
};

const LegalShell: React.FC<LegalShellProps> = ({ title, subtitle, icon, onBack, embedded, children }) => (
  <div className={embedded ? 'w-full' : 'min-h-screen w-full bg-slate-100 px-4 py-8 sm:px-6 lg:px-10'}>
    <div
      className={`mx-auto max-w-3xl overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] ${
        embedded ? '' : ''
      }`}
    >      <header className="border-b border-slate-100 bg-gradient-to-br from-[#1E4ED8] to-[#38BDF8] px-6 py-7 text-white sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-xl bg-white/15 px-2.5 py-1.5 text-xs font-semibold backdrop-blur-sm">
              <GraduationCap className="h-3.5 w-3.5" />
              {PRODUCT_NAME}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">{icon}</div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
                <p className="mt-1 text-sm text-white/85">{subtitle}</p>
              </div>
            </div>
          </div>
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-bold backdrop-blur-sm transition hover:bg-white/25"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
          ) : null}
        </div>
        <p className="mt-5 text-xs text-white/75">Effective date: {EFFECTIVE_DATE} · Governed primarily by the laws of India, including the Digital Personal Data Protection Act, 2023 (DPDP Act)</p>
      </header>

      <article className="space-y-7 px-6 py-8 text-sm leading-relaxed text-slate-600 sm:px-8 prose-headings:font-bold">
        {children}
      </article>
    </div>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-2.5">
    <h2 className="text-base font-bold text-slate-900">{title}</h2>
    <div className="space-y-2">{children}</div>
  </section>
);

export const PrivacyPolicyPage: React.FC<{ onBack?: () => void; embedded?: boolean }> = ({
  onBack,
  embedded,
}) => (
  <LegalShell
    title="Privacy Policy"
    subtitle="How we collect, use, store, and protect personal data"
    icon={<Shield className="h-5 w-5" />}
    onBack={onBack}
    embedded={embedded}
  >
    <Section title="1. Who we are">
      <p>
        This Privacy Policy applies to {PRODUCT_NAME}, a coaching / school learning-management platform used by {OPERATOR}.
        For the purposes of the Digital Personal Data Protection Act, 2023 (“DPDP Act”), the Institution is the Data Fiduciary
        responsible for personal data processed through this instance. Where a technology vendor hosts infrastructure on our
        behalf (for example cloud database or authentication services), that vendor acts as a Data Processor under our instructions.
      </p>
    </Section>

    <Section title="2. Scope">
      <p>
        This policy covers personal data of staff users, students, parents/guardians, and other contacts entered into {PRODUCT_NAME}
        in the course of admissions, academics, attendance, fee collection, communication, and administration.
      </p>
    </Section>

    <Section title="3. Personal data we process">
      <p>Depending on how the Institution uses the system, we may process:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Identity and contact details (name, email, phone, address, guardian details)</li>
        <li>Academic records (class, batch, subjects, attendance, timetable, history notes)</li>
        <li>Fee and payment records (fee structures, dues, receipts, payment mode references)</li>
        <li>Staff account data (role, department, login email, activity/audit logs)</li>
        <li>Documents or files uploaded by authorised users (ID proofs, certificates, notices)</li>
        <li>Technical logs needed for security and troubleshooting (IP-related request metadata, session timestamps)</li>
      </ul>
      <p>
        We do not intentionally collect special categories of data beyond what the Institution enters for educational /
        administrative purposes. Please avoid uploading unnecessary sensitive content.
      </p>
    </Section>

    <Section title="4. Purposes of processing (DPDP – purpose limitation)">
      <p>Personal data is processed only for lawful educational and administrative purposes, including to:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Create and manage student, parent, and staff records</li>
        <li>Run attendance, timetable, academic, and fee workflows</li>
        <li>Issue receipts and maintain financial/operational records</li>
        <li>Authenticate users and enforce role-based access</li>
        <li>Maintain audit trails, security monitoring, and system integrity</li>
        <li>Comply with applicable law, regulator, or court requirements</li>
      </ul>
      <p>We do not sell personal data. We do not use student/parent data for unrelated marketing.</p>
    </Section>

    <Section title="5. Legal basis / consent">
      <p>
        Processing is carried out because it is necessary for the Institution to provide education-related services and
        administer its operations, and/or on the basis of consent where required. Staff accounts are invite-only.
        Where a parent or guardian provides student data, they do so as part of enrolment / institutional processes.
        For children, the Institution will obtain verifiable parental/guardian consent as required under the DPDP Act
        and applicable rules before processing children’s personal data beyond what is necessary for education services.
      </p>
    </Section>

    <Section title="6. Children’s data">
      <p>
        {PRODUCT_NAME} is designed for institutional use and commonly processes personal data of minors.
        Access is limited to authorised staff. Parents/guardians may request access, correction, or deletion of their
        child’s data through the Institution’s grievance channel below, subject to legal retention duties
        (for example fee and academic records that must be kept for a mandated period).
      </p>
    </Section>

    <Section title="7. Sharing and processors">
      <p>Personal data may be shared only with:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Authorised Institution staff on a need-to-know basis</li>
        <li>Cloud / authentication / hosting processors engaged to run {PRODUCT_NAME} securely</li>
        <li>Payment or banking partners if the Institution enables payment integrations (transaction references only as needed)</li>
        <li>Government authorities when legally required</li>
      </ul>
      <p>Processors are expected to process data only on documented instructions and with appropriate safeguards.</p>
    </Section>

    <Section title="8. Retention">
      <p>
        We retain personal data only for as long as needed for the purposes above, or as required by Indian law,
        tax, education-board, or institutional policy. When data is no longer required, it will be deleted or irreversibly
        anonymised, except where retention is legally mandated.
      </p>
    </Section>

    <Section title="9. Security safeguards">
      <p>
        We apply reasonable security safeguards appropriate to the nature of the data, including access controls,
        encrypted transport (HTTPS), authentication, account scoping, and audit logging. No method of transmission or
        storage is perfectly secure; users must keep credentials confidential and report suspected misuse promptly.
      </p>
    </Section>

    <Section title="10. Your rights under the DPDP Act">
      <p>Data Principals (including parents/guardians acting for children, where applicable) may request:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Confirmation whether their personal data is being processed, and a summary of such data</li>
        <li>Correction and updating of inaccurate or incomplete personal data</li>
        <li>Erasure of personal data that is no longer necessary for the stated purpose (subject to legal exceptions)</li>
        <li>Withdrawal of consent where processing is consent-based (without affecting prior lawful processing)</li>
        <li>Grievance redressal and nomination of another person to exercise rights in case of death or incapacity, as provided by law</li>
      </ul>
      <p>
        To exercise these rights, contact the Institution using the details in Section 12. We will respond within the
        timelines prescribed under the DPDP Act and rules.
      </p>
    </Section>

    <Section title="11. Cross-border transfer">
      <p>
        If personal data is stored or processed on servers outside India (for example via a cloud provider), such transfer
        will be limited to countries/territories not restricted by the Central Government under the DPDP Act, and subject
        to contractual and technical safeguards.
      </p>
    </Section>

    <Section title="12. Grievance redressal">
      <p>
        For privacy requests or complaints, contact the Institution’s Data Protection / Grievance contact at{' '}
        <span className="font-semibold text-slate-800">{GRIEVANCE_EMAIL}</span> (replace with your live institutional email before production go-live)
        or through your campus administrator. If unresolved, you may escalate to the Data Protection Board of India as provided under the DPDP Act.
      </p>
    </Section>

    <Section title="13. Changes">
      <p>
        We may update this Privacy Policy to reflect legal, technical, or operational changes. The effective date above
        will be revised when material changes are published in the product.
      </p>
    </Section>
  </LegalShell>
);

export const TermsAndConditionsPage: React.FC<{ onBack?: () => void; embedded?: boolean }> = ({
  onBack,
  embedded,
}) => (
  <LegalShell
    title="Terms & Conditions"
    subtitle="Rules for using Campus LMS in production"
    icon={<Scale className="h-5 w-5" />}
    onBack={onBack}
    embedded={embedded}
  >
    <Section title="1. Agreement">
      <p>
        These Terms & Conditions (“Terms”) govern access to and use of {PRODUCT_NAME} by the Institution and its authorised
        users (administrators, teachers, accountants, and other staff). By signing in or continuing to use the platform,
        you agree to these Terms and our Privacy Policy.
      </p>
    </Section>

    <Section title="2. Nature of the service">
      <p>
        {PRODUCT_NAME} is an institutional software tool for managing coaching/school operations such as students, parents,
        classes, attendance, fees, expenses, documents, and related administration. It is provided for business /
        educational use, not as a consumer social network.
      </p>
    </Section>

    <Section title="3. Eligibility and accounts">
      <ul className="list-disc space-y-1 pl-5">
        <li>Access is invite-only. Public self-registration is not offered.</li>
        <li>You must use accurate credentials assigned by the Institution.</li>
        <li>You are responsible for keeping passwords confidential and for activity under your account.</li>
        <li>Administrators must share temporary passwords / recovery links only through trusted channels.</li>
        <li>The Institution may suspend or revoke access for misuse, security risk, or employment/role changes.</li>
      </ul>
    </Section>

    <Section title="4. Acceptable use">
      <p>You agree not to:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Access data outside your authorised role</li>
        <li>Upload unlawful, defamatory, or infringing content</li>
        <li>Attempt to bypass security, rate limits, or audit controls</li>
        <li>Use the platform to spam, harass, or send unsolicited bulk messages</li>
        <li>Reverse engineer, scrape, or disrupt service availability</li>
        <li>Process personal data for purposes unrelated to institutional education/administration</li>
      </ul>
    </Section>

    <Section title="5. Institutional responsibilities (Data Fiduciary)">
      <p>The Institution using this instance is responsible for:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Lawful collection of student/parent/staff data and notices/consent where required under the DPDP Act</li>
        <li>Appointing authorised users and reviewing role permissions</li>
        <li>Configuring accurate institution details, fee policies, and retention practices</li>
        <li>Responding to Data Principal requests and maintaining a grievance redressal process</li>
        <li>Ensuring uploaded documents and notices comply with applicable education and privacy laws</li>
      </ul>
    </Section>

    <Section title="6. Fees, receipts, and financial records">
      <p>
        Fee entries, receipts, and expense records in {PRODUCT_NAME} are operational records for the Institution.
        They do not replace statutory books of account unless the Institution expressly adopts them for that purpose.
        Payment gateway outcomes (if enabled later) remain subject to the gateway’s own terms.
      </p>
    </Section>

    <Section title="7. Communications">
      <p>
        SMS / WhatsApp / email broadcasting may be unavailable or limited unless the Institution connects a verified
        messaging provider. Until then, reminder actions may be informational only and must not be treated as confirmed delivery.
      </p>
    </Section>

    <Section title="8. Intellectual property">
      <p>
        The {PRODUCT_NAME} software, branding, and related materials remain the property of their respective owners.
        Institution data (student records, fees, documents) remains the Institution’s data, subject to applicable law.
      </p>
    </Section>

    <Section title="9. Availability and support">
      <p>
        We aim for reliable availability but do not guarantee uninterrupted service. Maintenance windows, third-party
        outages, or force majeure events may affect access. Administrators may enable maintenance mode for end users.
      </p>
    </Section>

    <Section title="10. Disclaimers">
      <p>
        The platform is provided on an “as available” basis for institutional operations. To the maximum extent permitted
        by Indian law, we disclaim warranties not expressly stated in a written commercial agreement with the Institution.
        Educational, financial, or compliance decisions remain the Institution’s responsibility.
      </p>
    </Section>

    <Section title="11. Limitation of liability">
      <p>
        To the extent permitted by law, liability for indirect, incidental, special, or consequential damages
        (including lost profits, data loss beyond reasonable backup efforts, or business interruption) is excluded.
        Aggregate liability relating to the service shall not exceed fees paid for the service in the three (3) months
        preceding the claim, or INR 10,000 if no fees apply, except where liability cannot be limited under applicable law
        (including proven wilful misconduct or fraud).
      </p>
    </Section>

    <Section title="12. Privacy and DPDP compliance">
      <p>
        Use of personal data through {PRODUCT_NAME} is governed by our Privacy Policy and the DPDP Act, 2023.
        Users must process personal data only for authorised institutional purposes and report suspected personal-data
        breaches to the administrator without delay.
      </p>
    </Section>

    <Section title="13. Suspension and termination">
      <p>
        Accounts may be suspended for breach of these Terms, security incidents, non-payment (where applicable), or
        legal requirement. Upon termination, Institution data export/deletion will follow the commercial arrangement
        and legal retention obligations.
      </p>
    </Section>

    <Section title="14. Governing law and disputes">
      <p>
        These Terms are governed by the laws of India. Courts at the Institution’s principal place of business shall have
        exclusive jurisdiction, subject to mandatory protections under the DPDP Act and other applicable statutes.
      </p>
    </Section>

    <Section title="15. Contact">
      <p>
        For terms-related notices, contact your campus administrator or{' '}
        <span className="font-semibold text-slate-800">{GRIEVANCE_EMAIL}</span> (update to your production contact before go-live).
      </p>
    </Section>

    <Section title="16. Changes">
      <p>
        We may update these Terms from time to time. Continued use after the revised effective date constitutes acceptance
        of the updated Terms, except where additional consent is required by law.
      </p>
    </Section>
  </LegalShell>
);

export const LegalDocumentPage: React.FC<{
  doc: LegalDoc;
  onBack?: () => void;
  embedded?: boolean;
}> = ({ doc, onBack, embedded }) =>
  doc === 'privacy' ? (
    <PrivacyPolicyPage onBack={onBack} embedded={embedded} />
  ) : (
    <TermsAndConditionsPage onBack={onBack} embedded={embedded} />
  );
