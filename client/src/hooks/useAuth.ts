import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role?: string;
}

export function useAuth() {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User>({
    queryKey: ["auth", "user"],
    queryFn: () => fetchApi<User>("/api/auth/user"),
    retry: false,
    staleTime: Infinity,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
