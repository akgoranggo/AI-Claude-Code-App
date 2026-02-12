import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <span className="font-heading font-bold text-lg">App Template</span>
          </div>
          <Button asChild>
            <a href="/api/login">Sign In</a>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-heading font-bold text-foreground mb-6">
            Welcome to Your
            <br />
            Web Application
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A template for building enterprise web applications with React, Express, and Azure
            Databricks Lakebase. Start by defining your ontology in the requirements template.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <a href="/api/login">Get Started</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/docs/REQUIREMENTS-TEMPLATE.md" target="_blank">
                View Requirements Template
              </a>
            </Button>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl">🏗️</span>
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Ontology-First Design</h3>
              <p className="text-muted-foreground">
                Define your domain model with Object Types, Links, and Actions before writing code.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl">🔐</span>
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Enterprise Security</h3>
              <p className="text-muted-foreground">
                Built-in Azure AD integration with Lakebase authentication and token management.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl">⚡</span>
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Modern Stack</h3>
              <p className="text-muted-foreground">
                React 18, TypeScript, Drizzle ORM, shadcn/ui, and TanStack Query out of the box.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
