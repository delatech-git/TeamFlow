"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import teamTideLogo from "@/assets/teamtideLogo.png";
import { Input } from "../ui/input";
import { cn } from "../ui/utils";
import { HeaderProfileMenu } from "./headerProfileMenu";

export default function Header() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const searchField = (
    <Input
      variant="glass"
      type="search"
      placeholder="Search ideas, events, people..."
      leadingIcon={
        <Search
          size={14}
          strokeWidth={1.9}
          aria-hidden={true}
          className="text-white/66"
        />
      }
    />
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "bg-black/85 shadow-lg backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="group flex shrink-0 items-center gap-3 rounded-full pr-2"
        >
          <Image
            src={teamTideLogo}
            alt="TeamTide"
            className="h-9 w-13"
            priority
          />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-white/90">
              TeamTide
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/72">
              collaborative event space
            </span>
          </span>
        </Link>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="hidden min-w-48 max-w-md flex-1 md:block lg:min-w-80">
            {searchField}
          </div>

          <button
            type="button"
            className="flex shrink-0 md:hidden"
            aria-label="Open search"
            onClick={() => setMobileSearchOpen(true)}
          >
            <Search className="h-5 w-5 text-white" />
          </button>

          <HeaderProfileMenu />
        </div>
      </div>

      {mobileSearchOpen ? (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden">
          <div className="flex h-20 items-center gap-3 px-4">
            <button
              type="button"
              className="shrink-0"
              aria-label="Close search"
              onClick={() => setMobileSearchOpen(false)}
            >
              <X className="h-5 w-5 text-white" />
            </button>
            <div className="min-w-0 flex-1">
              <Input
                variant="glass"
                type="search"
                placeholder="Search..."
                autoFocus
                leadingIcon={
                  <Search
                    size={14}
                    strokeWidth={1.9}
                    aria-hidden={true}
                    className="text-white/66"
                  />
                }
              />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
