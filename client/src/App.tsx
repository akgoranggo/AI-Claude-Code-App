import { Switch, Route } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary, PageErrorBoundary } from "@/components/ErrorBoundary";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import Landing from "@/pages/Landing";

/**
 * Authenticated Layout
 * Wraps authenticated pages with sidebar and header
 */
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

/**
 * Main App Component
 * Handles authentication state and routing
 */
function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return <Landing />;
  }

  // Main application routes
  return (
    <ErrorBoundary>
      <AuthenticatedLayout>
        <PageErrorBoundary>
          <Switch>
            <Route path="/" component={Dashboard} />
            {/* Add your application routes here based on your ontology */}
            {/* Example: <Route path="/items" component={ItemList} /> */}
            {/* Example: <Route path="/items/:id" component={ItemDetail} /> */}
            <Route component={NotFound} />
          </Switch>
        </PageErrorBoundary>
      </AuthenticatedLayout>
    </ErrorBoundary>
  );
}

export default App;
