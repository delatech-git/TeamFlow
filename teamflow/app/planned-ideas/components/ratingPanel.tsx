"use client";

import { useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import type { RatingsSummaryDto } from "@/src/infrastructure/api/ideas/client";
import { hashAccent } from "@/app/planned-ideas/colorAccents";

function AverageStars({
  average,
  size = 18,
}: {
  average: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.min(1, Math.max(0, average - index));
        return (
          <span
            key={index}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            <Star size={size} className="absolute inset-0 text-slate-600" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star size={size} className="text-amber-400" fill="currentColor" />
            </span>
          </span>
        );
      })}
    </div>
  );
}

function RatingStars({
  value,
  onRate,
  disabled,
}: {
  value: number;
  onRate: (value: number) => void;
  disabled: boolean;
}) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const display = hoverValue ?? value;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= display;
        return (
          <button
            key={starValue}
            type="button"
            disabled={disabled}
            onMouseEnter={() => setHoverValue(starValue)}
            onMouseLeave={() => setHoverValue(null)}
            onClick={() => onRate(starValue)}
            aria-label={`Rate ${starValue} out of 5`}
            className="transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Star
              size={20}
              className={filled ? "text-amber-400" : "text-slate-600"}
              fill={filled ? "currentColor" : "none"}
            />
          </button>
        );
      })}
    </div>
  );
}

export function RatingPanel({
  ratings,
  currentUserId,
  submitting,
  onRate,
}: {
  ratings: RatingsSummaryDto | null;
  currentUserId: string | null;
  submitting: boolean;
  onRate: (value: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const count = ratings?.count ?? 0;
  const average = ratings?.average ?? 0;
  const myRating =
    ratings?.ratings.find((rating) => rating.userId === currentUserId)
      ?.value ?? 0;

  return (
    <section className="rounded-2xl border border-cyan-400/10 bg-[#0b1424] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-300/80">
            Team Rating
          </p>
          {count > 0 ? (
            <div className="mt-1.5 flex items-center gap-2">
              <AverageStars average={average} />
              <span className="text-sm font-semibold text-white">
                {average.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">({count})</span>
            </div>
          ) : (
            <p className="mt-1.5 text-sm text-slate-400">No ratings yet</p>
          )}
        </div>

        {count > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-label={expanded ? "Collapse ratings" : "Expand ratings"}
            className="rounded-full border border-slate-600/50 p-1.5 text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
          >
            <ChevronDown
              size={15}
              aria-hidden
              className={[
                "transition-transform",
                expanded ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>
        ) : null}
      </div>

      <div className="mt-3 border-t border-slate-700/40 pt-3">
        <p className="text-xs text-slate-400">Your rating</p>
        <div className="mt-1.5">
          <RatingStars
            value={myRating}
            onRate={onRate}
            disabled={submitting || !currentUserId}
          />
        </div>
      </div>

      {expanded ? (
        <div className="mt-3 space-y-2 border-t border-slate-700/40 pt-3">
          {ratings?.ratings.map((rating) => {
            const name = rating.user.fullName || rating.user.username;
            const accent = hashAccent(rating.userId);
            return (
              <div
                key={rating.id}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ${accent.solidBg}`}
                    aria-hidden
                  >
                    {name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="truncate text-sm text-slate-200">
                    {name}
                  </span>
                </div>
                <AverageStars average={rating.value} size={14} />
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
