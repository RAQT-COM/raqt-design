import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/**
 * The overlay proof: the system handles things that leave the page, not just
 * things laid out on it.
 *
 * These are the one set of stories that cannot be static. A dialog open on load
 * would trap focus on the docs page and every other story below it would be
 * unreachable — so each story here is a trigger, and the state is one click
 * away. Escape closes, focus is trapped while open and returns to the trigger
 * on close: all of that is Radix's, and the point of the stories is that
 * retheming did not break it.
 */
const meta = {
  title: "Components/Dialog",
  component: Dialog,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="raqt min-h-screen bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Title, description, and a way out. The whole anatomy, nothing else. */
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Match details</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Court 2 — Group B</DialogTitle>
          <DialogDescription>
            Andersson / Lind vs. Ruiz / Novak, Saturday at 14:30.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button>Follow match</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * Composed with `field`, which is the argument the demo is making: the form
 * inside an overlay is the same form as anywhere else, error states included,
 * and nobody designed it twice.
 */
export const WithForm: Story = {
  name: "With form content",
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Enter tournament</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Spring Open</DialogTitle>
          <DialogDescription>
            Doubles, round robin. Both players need a rating.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Field label="Team name" required hint="Shown on the draw sheet.">
            <Input placeholder="Baseline Bandits" />
          </Field>
          <Field label="Partner" error="No player found with that name.">
            <Input defaultValue="j.lind" />
          </Field>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button>Submit entry</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * A destructive confirmation. The weight sits on the button, not on the panel:
 * the surface is the same `surface-2` as every other dialog, because a red
 * container would be shouting before the user has read the sentence.
 */
export const DestructiveConfirmation: Story = {
  name: "Destructive confirmation",
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Withdraw team</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw from Spring Open?</DialogTitle>
          <DialogDescription>
            The draw is already published. Withdrawing forfeits the three
            matches still on the schedule and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Keep our place</Button>
          </DialogClose>
          <Button variant="destructive">Withdraw</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * Long content scrolls inside the panel, which caps at the viewport height less
 * a margin. The panel scrolls as a whole — header and close button included —
 * so nothing is pinned over the text; the page behind it does not move at all.
 */
export const LongContent: Story = {
  name: "Long scrolling content",
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Tournament rules</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tournament rules</DialogTitle>
          <DialogDescription>
            Twenty clauses nobody reads, and one they all argue about.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 text-sm text-muted-foreground">
          {Array.from({ length: 20 }, (_, index) => (
            <p key={index}>
              <span className="font-medium text-foreground">
                {index + 1}.{" "}
              </span>
              Matches are best of three sets to six games, with a tie-break at
              five all. A side arriving more than ten minutes after the
              scheduled start forfeits the first set.
            </p>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Understood</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * **The thing that would have shipped broken.** Radix portals the panel to
 * `document.body`, so it lands outside the `.raqt` scope and inherits the host
 * app's tokens instead of ours. `DialogPortal` re-establishes the scope inside
 * the portal with `display: contents` — no box, no layout change, tokens
 * restored — and `scope` carries the mode across, which the portal would
 * otherwise leave behind with the rest of the ancestry.
 *
 * Storybook's own root is dark, so the bug is invisible here in dark mode.
 * This story is the check that survives: a light panel whose dialog stays
 * light.
 */
export const LightHost: Story = {
  name: "Light-mode host",
  render: () => (
    <div className="raqt light rounded-lg border border-border bg-background p-6 text-foreground">
      <p className="mb-4 text-sm text-muted-foreground">
        This panel is in light mode. The dialog it opens must be too.
      </p>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open from a light host</Button>
        </DialogTrigger>
        <DialogContent scope="raqt light">
          <DialogHeader>
            <DialogTitle>Still light</DialogTitle>
            <DialogDescription>
              Portalled to <code>document.body</code>, themed by the scope this
              content carried with it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
};
