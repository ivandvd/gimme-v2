import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/sites/vibebevvy-com-5acc75fc/shared/LegalPage";

export const metadata: Metadata = {
  title: "Terms and conditions · Gimme Drinks",
  description: "The terms for using the gimme site, ordering drinks, subscribing and returning anything that arrives wrong.",
};

/* Draft terms for a direct-to-consumer drinks shop. Square-bracket items are
   placeholders for the legal entity's details. Needs a legal review before
   launch. House rules: no "can" in copy, no health claims beyond "supports". */
const SECTIONS: LegalSection[] = [
  {
    heading: "Using the site",
    body: [
      "This site is run by [Company legal name] (“gimme”, “we”). By using it, ordering from it or joining the club, you agree to these terms. If you don’t agree, please don’t use the site.",
      "You must be at least 18 to place an order.",
    ],
  },
  {
    heading: "Our drinks",
    body: [
      "gimme drinks are food and drink products, not medicine. Where we say a drink supports something, that is what we mean: it supports, it doesn’t treat, cure or prevent anything. The drinks are not a substitute for a balanced diet.",
      "Energy and Focus contain caffeine. If you are pregnant, breastfeeding, sensitive to caffeine, taking medication or managing a medical condition, check with your doctor first. Ingredient lists are printed on every pack and shown on the site.",
    ],
  },
  {
    heading: "Orders, prices and payment",
    body: [
      "Prices are shown in [currency] and include [tax status]. Shipping is shown at checkout before you pay. We may change prices at any time, but changes never affect an order you have already placed.",
      "An order is accepted when we send you a confirmation email. We may refuse or cancel an order where a price or stock level was shown incorrectly, where we suspect fraud, or where we are unable to deliver to your address. If that happens after you have paid, you get a full refund.",
    ],
  },
  {
    heading: "Subscriptions",
    body: [
      "A subscription renews on the schedule you choose and is charged to your saved payment method on each renewal, at the subscription price shown when you signed up. The subscription discount applies to every delivery while the subscription is active.",
      "You may pause, skip a delivery, swap or add drinks, or cancel at any time from your account. Changes made before a renewal is processed apply to that renewal; changes made after it apply to the next one.",
    ],
  },
  {
    heading: "Shipping and delivery",
    body: [
      "We deliver to the addresses listed at checkout. Delivery times are estimates. Once a parcel is handed to the carrier, we’ll send you tracking where it is available. Risk in the goods passes to you on delivery.",
      "If an address you gave us is wrong or incomplete and the parcel comes back to us, we’ll contact you to arrange redelivery, which may carry an extra shipping charge.",
    ],
  },
  {
    heading: "Returns and refunds",
    body: [
      "Because these are food and drink products, we don’t accept returns of opened or undamaged goods. If anything arrives damaged, wrong or missing, email [contact email] within 14 days of delivery with your order number and a photo, and we’ll replace it or refund it.",
      "Refunds go back to the payment method you used, within 10 working days of our confirmation.",
    ],
  },
  {
    heading: "Promotions and free gifts",
    body: [
      "Promotional codes have the conditions shown with them and don’t combine unless we say so. Free gifts offered with subscriptions or orders are added while stocks last, may change without notice, have no cash value and are not available on their own.",
    ],
  },
  {
    heading: "Accounts and the club",
    body: [
      "Keep your login details to yourself; anything done through your account counts as done by you, unless you have told us it has been compromised. Club emails are sent to the address you gave us until you unsubscribe, which you may do from any email.",
    ],
  },
  {
    heading: "Content and trade marks",
    body: [
      "Everything on the site, the words, photos, illustrations, the gimme name and logo, belongs to us or our licensors. You may share links to it. You may not copy it, sell it or use it to promote anything else without our written permission.",
    ],
  },
  {
    heading: "Our responsibility",
    body: [
      "We do our best to keep the site accurate and running, but we don’t promise it will be error-free or always available. As far as the law allows, we are not responsible for losses that we could not reasonably have expected when you placed your order, or for losses caused by events outside our control.",
      "Nothing in these terms limits any rights you have as a consumer under the law where you live, or our liability for anything the law says we may not limit.",
    ],
  },
  {
    heading: "Governing law",
    body: ["These terms are governed by the laws of [jurisdiction], and the courts there deal with any dispute, unless the law where you live says otherwise."],
  },
  {
    heading: "Changes to these terms",
    body: ["We may update these terms. The date at the top tells you when they last changed. Orders are governed by the terms in force when they were placed."],
  },
];

export default function TermsAndConditions() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms and conditions"
      updated="20 October 2026"
      intro="The rules for buying from us and using the site. They are written to be read, not skimmed, but the headings are there if you only need one bit."
      sections={SECTIONS}
      outro="Anything unclear: [contact email]."
    />
  );
}
