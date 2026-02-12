import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus } from "lucide-react";

interface Item {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
}

export default function Dashboard() {
  const { data: items, isLoading } = useQuery<Item[]>({
    queryKey: ["items"],
    queryFn: () => fetchApi<Item[]>("/api/items"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your application</p>
        </div>
        <Link href="/items/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Item
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Items</CardTitle>
            <CardDescription>All items in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{items?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
            <CardDescription>Items currently being worked on</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {items?.filter((i) => i.status === "in_progress").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
            <CardDescription>Items finished successfully</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {items?.filter((i) => i.status === "completed").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Items */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Items</CardTitle>
          <CardDescription>Latest items created in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {!items || items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items yet. Create your first item to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {items.slice(0, 5).map((item) => (
                <Link key={item.id} href={`/items/${item.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer">
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.createdBy
                          ? `${item.createdBy.firstName} ${item.createdBy.lastName}`
                          : "Unknown"}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{item.status}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
