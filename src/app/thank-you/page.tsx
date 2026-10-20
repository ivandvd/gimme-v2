import type { Metadata } from "next";

import { NoticePage } from "@/components/sites/vibebevvy-com-5acc75fc/shared/NoticePage";

export const metadata: Metadata = {
  title: "You’re in · Gimme Drinks",
  description: "Welcome to the gimme club. First dibs on new flavors, early drops and the occasional bad pun.",
};

/** Where the club sign-up lands. House rule: no "can" in copy. */
export default function ThankYou() {
  return (
    <NoticePage
      eyebrow="Welcome to the club"
      headline="You’re in."
      subhead="First dibs on new flavors, early drops and the occasional bad pun, straight to your inbox."
      action={{ label: "Back home", href: "/" }}
    />
  );
}
