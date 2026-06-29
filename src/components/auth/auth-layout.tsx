import { motion } from "framer-motion";
import { Sprout } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 bg-gradient-brand text-primary-foreground">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <Sprout className="h-6 w-6" />
          AgriTwin OS
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md space-y-4"
        >
          <h2 className="text-4xl font-bold leading-tight">
            The intelligent operating system for every farm.
          </h2>
          <p className="text-base opacity-90">
            Monitor, predict, and optimize your farm with an AI-powered digital twin —
            built on real data, not guesses.
          </p>
        </motion.div>
        <p className="text-xs opacity-70">© {new Date().getFullYear()} AgriTwin OS</p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto w-full max-w-sm"
        >
          <Link to="/" className="mb-8 flex items-center gap-2 text-lg font-semibold lg:hidden">
            <Sprout className="h-6 w-6 text-primary" />
            AgriTwin OS
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
        </motion.div>
      </main>
    </div>
  );
}
