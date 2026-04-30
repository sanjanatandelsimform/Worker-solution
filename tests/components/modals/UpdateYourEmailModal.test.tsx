import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockDispatch = vi.fn();
const mockUpdateProfileData = vi.fn((payload: any) => payload);
const mockUpdateUser = vi.fn((payload: any) => payload);

let selectorState = {
  user: { firstName: "Jane", lastName: "Doe", businessEmail: "jane@acme.com" },
  loading: false,
};

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector(),
}));

vi.mock("@/store/selectors/authSelectors", () => ({
  selectUser: () => selectorState.user,
}));

vi.mock("@/store/selectors/profileSelectors", () => ({
  selectProfileLoading: () => selectorState.loading,
}));

vi.mock("@/store/slices/profileSlice", () => ({
  updateProfileData: (payload: any) => mockUpdateProfileData(payload),
}));

vi.mock("@/store/slices/authSlice", () => ({
  updateUser: (payload: any) => mockUpdateUser(payload),
}));

vi.mock("@/utils/validation", () => ({
  validateEmail: (email: string) => email.includes("@") && email.includes("."),
}));

vi.mock("@/components/base/modal/modal", () => ({
  Modal: ({ isOpen, children }: any) => (isOpen ? <div>{children}</div> : null),
  ModalContent: ({ children }: any) => <div>{children}</div>,
  ModalHeader: ({ children }: any) => <div>{children}</div>,
  ModalTitle: ({ children }: any) => <h1>{children}</h1>,
  ModalDescription: ({ children }: any) => <p>{children}</p>,
  ModalBody: ({ children }: any) => <div>{children}</div>,
  ModalFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/base/input/input-group", () => ({
  InputGroup: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/base/input/input", () => ({
  Input: ({ value, onChange, placeholder, isDisabled }: any) => (
    <input
      aria-label={placeholder}
      disabled={!!isDisabled}
      value={value ?? ""}
      onChange={e => onChange?.(e.target.value)}
    />
  ),
}));

vi.mock("@/components/base/buttons/button", () => ({
  Button: ({ children, onClick, type, isDisabled }: any) => (
    <button type={type ?? "button"} disabled={!!isDisabled} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/common/ErrorMessage", () => ({
  default: ({ errorMessage, onClose }: any) => (
    <div>
      <span>{String(errorMessage)}</span>
      <button onClick={onClose}>dismiss</button>
    </div>
  ),
}));

vi.mock("react-aria-components", () => ({
  Label: ({ children }: any) => <label>{children}</label>,
}));

import { UpdateYourEmailModal } from "@/components/modals/UpdateYourEmailModal";

describe("UpdateYourEmailModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectorState = {
      user: { firstName: "Jane", lastName: "Doe", businessEmail: "jane@acme.com" },
      loading: false,
    };
  });

  it("shows validation errors for empty/invalid/same email", () => {
    const { container } = render(
      <UpdateYourEmailModal isOpen={true} onClose={vi.fn()} getResponse={vi.fn()} />
    );

    const newEmail = screen.getByLabelText("new@email.com");
    fireEvent.change(newEmail, { target: { value: "" } });
    fireEvent.submit(container.querySelector("form")!);
    expect(screen.getByText("Email cannot be empty")).toBeTruthy();

    fireEvent.change(newEmail, { target: { value: "invalid-email" } });
    fireEvent.submit(container.querySelector("form")!);
    expect(screen.getByText("Please enter a valid email address")).toBeTruthy();

    fireEvent.change(newEmail, { target: { value: "jane@acme.com" } });
    fireEvent.submit(container.querySelector("form")!);
    expect(screen.getByText("New email must be different from current email")).toBeTruthy();
  });

  it("submits successfully and passes response to getResponse", async () => {
    const getResponse = vi.fn();
    const onClose = vi.fn();
    mockDispatch.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          success: true,
          data: { user: { firstName: "Jane", lastName: "Doe", businessEmail: "new@acme.com" } },
        }),
    });

    const { container } = render(
      <UpdateYourEmailModal isOpen={true} onClose={onClose} getResponse={getResponse} />
    );

    fireEvent.change(screen.getByLabelText("new@email.com"), { target: { value: "new@acme.com" } });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => {
      expect(mockUpdateProfileData).toHaveBeenCalled();
      expect(mockUpdateUser).toHaveBeenCalled();
      expect(getResponse).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("shows already-in-use error and generic error branches", async () => {
    mockDispatch.mockReturnValueOnce({
      unwrap: () => Promise.reject("already in use"),
    });

    const { container, rerender } = render(
      <UpdateYourEmailModal isOpen={true} onClose={vi.fn()} getResponse={vi.fn()} />
    );

    fireEvent.change(screen.getByLabelText("new@email.com"), { target: { value: "used@acme.com" } });
    fireEvent.submit(container.querySelector("form")!);
    expect(await screen.findByText("This email is already in use")).toBeTruthy();

    mockDispatch.mockReturnValueOnce({
      unwrap: () => Promise.reject("random-failure"),
    });

    rerender(<UpdateYourEmailModal isOpen={true} onClose={vi.fn()} getResponse={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("new@email.com"), { target: { value: "x@acme.com" } });
    fireEvent.submit(container.querySelector("form")!);
    expect(await screen.findByText("random-failure")).toBeTruthy();
  });
});

