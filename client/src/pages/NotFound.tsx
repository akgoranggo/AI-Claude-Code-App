import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-6xl font-heading font-bold text-muted-foreground mb-4">404</h1>
      <h2 className="text-2xl font-heading font-semibold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  );
}
