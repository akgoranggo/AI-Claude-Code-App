import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { vi } from "vitest";

/**
 * Creates a QueryClient wrapper for testing hooks
 */
export function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return QueryWrapper;
}

/**
 * Creates a mock organization for testing
 */
export function createMockOrganization(overrides = {}) {
  return {
    id: "org-test-id",
    name: "Test Organization",
    slug: "test-org",
    status: "Active",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock clinic for testing
 */
export function createMockClinic(overrides = {}) {
  return {
    id: "clinic-test-id",
    organizationId: "org-test-id",
    name: "Test Clinic",
    slug: "test-clinic",
    status: "Active",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock client for testing
 */
export function createMockClient(overrides = {}) {
  return {
    id: "client-test-id",
    clinicId: "clinic-test-id",
    firstName: "Test",
    lastName: "Client",
    email: "test@example.com",
    phone: "555-0000",
    status: "Active",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock patient for testing
 */
export function createMockPatient(overrides = {}) {
  return {
    id: "patient-test-id",
    clinicId: "clinic-test-id",
    name: "Test Pet",
    species: "Dog",
    breed: "Mixed",
    dateOfBirth: new Date("2020-01-01"),
    status: "Active",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock staff user for testing
 */
export function createMockStaffUser(overrides = {}) {
  return {
    id: "staff-test-id",
    organizationId: "org-test-id",
    email: "staff@example.com",
    firstName: "Test",
    lastName: "Staff",
    title: "Veterinarian",
    status: "Active",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Mocks fetch with a successful response
 */
export function mockFetch<T>(data: T) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

/**
 * Mocks fetch with an error response
 */
export function mockFetchError(status = 500, message = "Server Error") {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({ error: message }),
  });
}

/**
 * Waits for a condition to be true
 */
export async function waitFor(condition: () => boolean, timeout = 5000): Promise<void> {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error("waitFor timeout");
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}
