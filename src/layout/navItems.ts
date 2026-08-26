import type { ComponentType, SVGProps } from "react";
import { BooksIcon, GiftIcon, UserIcon } from "../components/icons";

export interface NavItem {
  to: string;
  labelKey: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  mystery?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard/about-me", labelKey: "nav.aboutMe", icon: UserIcon },
  { to: "/dashboard/books", labelKey: "nav.books", icon: BooksIcon },
  { to: "/dashboard/mystery-book", labelKey: "nav.mysteryBook", icon: GiftIcon, mystery: true },
];
