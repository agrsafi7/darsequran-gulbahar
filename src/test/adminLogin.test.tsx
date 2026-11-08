import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const auth = vi.hoisted(() => ({ signIn: vi.fn().mockResolvedValue({ error: null }), signUp: vi.fn() }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ ...auth, user: null, isAdmin: false, isLoading: false }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
import AdminLogin from "@/pages/admin/Login";

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("admin sign-in only", () => {
  it("submits existing-account credentials to signIn, never registration", async () => {
    render(<MemoryRouter><AdminLogin /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "existing@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
    await waitFor(() => expect(auth.signIn).toHaveBeenCalledWith("existing@example.com", "test-password"));
    expect(auth.signUp).not.toHaveBeenCalled();
  });
});