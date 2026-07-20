import Link from "next/link";
import {
  adminBtnPrimaryClass,
  adminBtnSecondaryClass,
} from "@/lib/admin-ui";

type ButtonSize = "default" | "sm";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "danger";
  size?: ButtonSize;
};

const variants = {
  primary: `${adminBtnPrimaryClass} border-transparent`,
  secondary: adminBtnSecondaryClass,
  danger:
    "bg-red-600 text-white hover:bg-red-700 hover:text-white border-transparent",
};

const sizes: Record<ButtonSize, string> = {
  default: "px-4 py-2 text-[12px] font-bold uppercase tracking-wider",
  sm: "px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
};

export function Button({
  variant = "primary",
  size = "default",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center border transition-colors disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "default",
  className = "",
  children,
}: {
  href: string;
  variant?: "primary" | "secondary";
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}) {
  const linkVariants = {
    primary: adminBtnPrimaryClass,
    secondary: adminBtnSecondaryClass,
  };

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center border transition-colors ${sizes[size]} ${linkVariants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
