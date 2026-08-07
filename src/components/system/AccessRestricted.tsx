import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

/** Shown instead of throwing when a user lacks permission. */
export function AccessRestricted({
  title = "Access Restricted",
  description = "You don't have permission to view this area. If you think this is a mistake, contact your administrator.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="rounded-[20px] border-border/60 p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-accent text-accent-foreground">
        <Lock className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-xl font-bold tracking-tight">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      <Button asChild size="sm" className="mt-6 rounded-full">
        <Link to="/dashboard">Go to Dashboard</Link>
      </Button>
    </Card>
  );
}