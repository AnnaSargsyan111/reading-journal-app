import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
    </svg>
  );
}

export function BooksIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H10a1.5 1.5 0 0 1 1.5 1.5v16A1.5 1.5 0 0 0 10 19H4z" />
      <path d="M13 4.5A1.5 1.5 0 0 1 14.5 3H19a1.5 1.5 0 0 1 1.5 1.5v14A1.5 1.5 0 0 1 19 20h-4.5A1.5 1.5 0 0 0 13 21.5z" />
    </svg>
  );
}

export function GiftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="9" width="16" height="4" />
      <rect x="5.5" y="13" width="13" height="8" />
      <path d="M12 9v12" />
      <path d="M12 9C10.5 9 8.5 8 8.5 6.2 8.5 4.7 9.6 3.5 11 3.5c1.3 0 1 3 1 5.5" />
      <path d="M12 9c1.5 0 3.5-1 3.5-2.8 0-1.5-1.1-2.7-2.5-2.7-1.3 0-1 3-1 5.5" />
    </svg>
  );
}

export function FilterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5h16" />
      <path d="M7 12h10" />
      <path d="M10 19h4" />
    </svg>
  );
}

export function SortIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M7 4v16" />
      <path d="M3.5 7.5 7 4l3.5 3.5" />
      <path d="M17 20V4" />
      <path d="M13.5 16.5 17 20l3.5-3.5" />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export function BackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </svg>
  );
}

export function LogoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M9 21H5.5A1.5 1.5 0 0 1 4 19.5v-15A1.5 1.5 0 0 1 5.5 3H9" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
