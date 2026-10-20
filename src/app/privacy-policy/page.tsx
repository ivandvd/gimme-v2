import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/sites/vibebevvy-com-5acc75fc/shared/LegalPage";

export const metadata: Metadata = {
  title: "Privacy policy · Gimme Drinks",
  description: "What gimme collects when you visit, order or join the club, how it is used, and the choices you have.",
};

/* Draft policy for a direct-to-consumer drinks shop. Square-bracket items are
   placeholders for the legal entity's details. Needs a legal review before
   launch. House rule: no "can" in copy. */
const SECTIONS: LegalSection[] = [
  {
    heading: "Who we are",
    body: [
      "gimme is run by [Company legal name], registered at [registered address]. When this policy says “we”, that’s who it means. Questions about your data go to [contact email].",
    ],
  },
  {
    heading: "What we collect",
    body: [
      "Information you give us:",
      [
        "Your email address, when you join the gimme club.",
        "Your name, delivery address, phone number and order history, when you place an order or open an account.",
        "Anything you write to us, when you get in touch.",
      ],
      "Information collected automatically:",
      [
        "Your device and browser type, the pages you view and how you got here.",
        "Your approximate location, worked out from your connection.",
        "Cookies and similar tools, as described below.",
      ],
      "We never ask for more than we need to run the shop and the club.",
    ],
  },
  {
    heading: "How we use it",
    body: [
      "To take and deliver your orders, run your subscription and sort out returns.",
      "To send the club emails you signed up for. Every email has an unsubscribe link, and it works.",
      "To keep the site working, spot problems and understand which pages and drinks people like.",
      "To meet our legal and tax duties.",
      "We don’t sell your personal information, and we don’t use it to build profiles for other companies.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "Essential cookies keep the site working: your cart, your preferences and the choice you make in the cookie notice. These always run.",
      "Analytics cookies help us see which pages are popular. These only run if you accept them in the cookie notice. You may change your mind at any time by clearing your browser’s site data, which brings the notice back.",
      "We don’t run advertising cookies.",
    ],
  },
  {
    heading: "Who we share it with",
    body: [
      "Only the companies that help us deliver what you asked for: payment processing, shipping, email sending and site hosting. Each of them is allowed to use your information only to provide that service to us.",
      "We may also share information when the law requires it, or to protect our rights, our customers or the public.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "Order records are kept for as long as tax law requires, usually seven years. Club emails are kept until you unsubscribe. Account details are kept until you close the account. Anything else is deleted once it is no longer needed.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "Depending on where you live, you have the right to:",
      [
        "See the personal information we hold about you, and get a copy.",
        "Correct anything that is wrong.",
        "Ask us to delete it, where we have no legal reason to keep it.",
        "Object to, or limit, how we use it.",
        "Take your information to another service.",
        "Complain to your local data protection authority.",
      ],
      "To use any of these, email [contact email]. We reply within 30 days.",
    ],
  },
  {
    heading: "Children",
    body: [
      "The site is not aimed at children under 16, and we don’t knowingly collect their information. If you think a child has given us their details, tell us and we’ll remove them.",
    ],
  },
  {
    heading: "Changes to this policy",
    body: [
      "We’ll update this page when our practices change and move the date at the top. Big changes get a note on the site or an email to club members.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy policy"
      updated="20 October 2026"
      intro="The short version: we collect what we need to send you drinks and the occasional email, we keep it safe, and we don’t sell it. The long version follows."
      sections={SECTIONS}
      outro="Questions about any of this: [contact email]."
    />
  );
}
