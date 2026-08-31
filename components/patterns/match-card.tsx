import type { ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * The domain component: the one thing in the library that looks like *Raqt*
 * rather than like a component library.
 *
 * It is assembled entirely from `card` and `badge` — every surface, edge,
 * radius and status colour arrives through them. Nothing here reaches past the
 * semantic layer for a bespoke value, which is the claim the whole exercise is
 * making: a domain component is a *composition*, not an exception.
 */

export type MatchStatus = "upcoming" | "live" | "finished";

export type MatchSide = {
  /** One name for singles, two for doubles. */
  players: string[];
  /** Games won per set, in set order. Both sides carry the same number. */
  scores?: number[];
};

export type MatchCardProps = Omit<ComponentProps<typeof Card>, "children"> & {
  status: MatchStatus;
  /** Exactly two sides. Order is display order, not seeding. */
  sides: readonly [MatchSide, MatchSide];
  court?: string;
  /** Kick-off time. Replaces the score while the match is `upcoming`. */
  time?: string;
};

const STATUS_LABEL: Record<MatchStatus, string> = {
  upcoming: "Upcoming",
  live: "Live",
  finished: "Finished",
};

/** Sets taken, for deciding which line to emphasise once a match is over. */
function setsWon(mine: number[] = [], theirs: number[] = []): number {
  return mine.reduce((won, games, i) => won + (games > (theirs[i] ?? 0) ? 1 : 0), 0);
}

function MatchCard({ status, sides, court, time, className, ...props }: MatchCardProps) {
  const [a, b] = sides;

  // Only a finished match has a losing side to play down. A live one is still
  // anyone's, so neither line is dimmed while it is being played.
  const winner =
    status === "finished"
      ? (() => {
          const [x, y] = [setsWon(a.scores, b.scores), setsWon(b.scores, a.scores)];
          return x === y ? null : x > y ? 0 : 1;
        })()
      : null;

  // Live emphasises the set being played: the last one on the board.
  const liveSet = status === "live" ? Math.max((a.scores?.length ?? 0) - 1, 0) : null;

  const meta = [court, status === "upcoming" ? null : time].filter(Boolean).join(" · ");

  return (
    <Card
      data-slot="match-card"
      data-status={status}
      className={cn("gap-3", className)}
      {...props}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <Badge variant={status}>{STATUS_LABEL[status]}</Badge>
          {meta ? (
            <span className="truncate text-xs text-muted-foreground">{meta}</span>
          ) : null}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <SideRow
              side={a}
              status={status}
              won={winner === 0}
              muted={winner === 1}
              liveSet={liveSet}
            />
            <div className="mt-2 border-t border-border pt-2">
              <SideRow
                side={b}
                status={status}
                won={winner === 1}
                muted={winner === 0}
                liveSet={liveSet}
              />
            </div>
          </div>

          {status === "upcoming" && time ? (
            <span className="shrink-0 text-lg font-medium tabular-nums text-muted-foreground">
              {time}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function SideRow({
  side,
  status,
  won,
  muted,
  liveSet,
}: {
  side: MatchSide;
  status: MatchStatus;
  /** Took the match. Emphasises the whole line, names and numbers alike. */
  won: boolean;
  /** Lost it. The counterpart, dimmed. */
  muted: boolean;
  liveSet: number | null;
}) {
  const showScores = status !== "upcoming" && side.scores?.length;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className={cn("min-w-0 flex-1", muted && "text-muted-foreground")}>
        {side.players.map((player) => (
          <p
            key={player}
            className={cn("truncate text-sm", !muted && "font-medium text-foreground")}
          >
            {player}
          </p>
        ))}
      </div>

      {showScores ? (
        <div className="flex shrink-0 items-center gap-1">
          {side.scores!.map((games, set) => (
            <span
              key={set}
              className={cn(
                "w-7 rounded-sm py-0.5 text-center text-sm tabular-nums",
                muted ? "text-muted-foreground" : "text-foreground",
                won && "font-semibold",
                // The set in play. `muted` and not a surface step: the surface
                // ramp collapses to white in light mode, so a level-3 chip on a
                // level-1 card would be invisible there — the emphasis has to
                // come from a token that differs from the card in both modes.
                set === liveSet && "bg-muted font-semibold text-foreground",
              )}
            >
              {games}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The match card's own loading state, shipped with it rather than reinvented at
 * every call site. The block sizes mirror the real layout, so a list does not
 * reflow when the data lands.
 */
function MatchCardSkeleton({ className, ...props }: ComponentProps<typeof Card>) {
  return (
    <Card
      data-slot="match-card-skeleton"
      className={cn("gap-3", className)}
      {...props}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="min-w-0 flex-1">
          <SideRowSkeleton width="w-40" />
          <div className="mt-2 border-t border-border pt-2">
            <SideRowSkeleton width="w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SideRowSkeleton({ width }: { width: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Skeleton className={cn("h-4", width)} />
      <div className="flex shrink-0 items-center gap-1">
        <Skeleton className="h-5 w-7 rounded-sm" />
        <Skeleton className="h-5 w-7 rounded-sm" />
        <Skeleton className="h-5 w-7 rounded-sm" />
      </div>
    </div>
  );
}

export { MatchCard, MatchCardSkeleton };
