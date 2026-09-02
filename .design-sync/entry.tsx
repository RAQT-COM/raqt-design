// The library entry the design-sync converter bundles into window.RaqtDesign.
//
// This repo ships source over a shadcn registry and deliberately has no build,
// so there is no dist/ for the converter to read. This barrel is that missing
// entry: it re-exports every component the library owns, and
// .design-sync/build-dist.mjs compiles it to dist/index.js.
//
// Add a component here whenever one joins registry.json, or the design agent in
// Claude Design will not have it.

export { Badge, badgeVariants } from "@/components/ui/badge";
export { Button, buttonVariants } from "@/components/ui/button";
export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
export { EmptyState, emptyStateVariants } from "@/components/ui/empty-state";
export { Field } from "@/components/ui/field";
export { Input } from "@/components/ui/input";
export { Skeleton } from "@/components/ui/skeleton";
export { MatchCard, MatchCardSkeleton } from "@/components/patterns/match-card";
