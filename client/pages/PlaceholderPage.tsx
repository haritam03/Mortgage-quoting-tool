import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowRight } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="rounded-full bg-primary/10 p-6 mb-6">
          <Lightbulb className="h-12 w-12 text-primary" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground mb-8 max-w-md">{description}</p>

        <div className="rounded-lg border border-border bg-card p-6 max-w-md text-left mb-8">
          <p className="text-sm text-muted-foreground mb-4">
            This feature is coming soon! Ask your admin or development team to
            help fill in this page with the actual functionality.
          </p>
          <p className="text-xs text-muted-foreground">
            In the meantime, you can:
          </p>
          <ul className="text-xs text-muted-foreground mt-3 space-y-2">
            <li>✓ Manage leads in the Leads section</li>
            <li>✓ Create and edit lead information</li>
            <li>✓ Search and filter leads</li>
          </ul>
        </div>

        <Link to="/">
          <Button className="gap-2">
            Back to Leads
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </MainLayout>
  );
}
