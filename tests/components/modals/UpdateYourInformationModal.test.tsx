import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockDispatch = vi.fn();
const mockUpdateProfileData = vi.fn((payload: any) => payload);
const mockUpdateUser = vi.fn((payload: any) => payload);

let selectorState = {
  user: { firstName: "Jane", lastName: "Doe" },
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
  validateName: (kind: string, value: string) => ({
    isValid: value.trim().length > 0 && !value.includes("!"),
    message: `${kind} invalid`,
  }),
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
  Input: ({ value, onChange, placeholder, isInvalid }: any) => (
    <input
      aria-label={placeholder}
      data-invalid={String(!!isInvalid)}
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

import { UpdateYourInformationModal } from "@/components/modals/UpdateYourInformationModal";

describe("UpdateYourInformationModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectorState = {
      user: { firstName: "Jane", lastName: "Doe" },
      loading: false,
    };
  });

  it("shows validation messages for empty names", async () => {
    mockDispatch.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    const { container } = render(
      <UpdateYourInformationModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "" } });
    fireEvent.submit(container.querySelector("form")!);

    expect(screen.getByText("First name invalid")).toBeTruthy();
    expect(screen.getByText("Last name invalid")).toBeTruthy();
  });

  it("submits updated values and calls onClose/onSuccess", async () => {
    mockDispatch.mockReturnValue({ unwrap: () => Promise.resolve({ data: { user: { firstName: "Janet", lastName: "Smith" } } }) });
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    const { container } = render(
      <UpdateYourInformationModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    );

    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "Janet" } });
    fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "Smith" } });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => {
      expect(mockUpdateProfileData).toHaveBeenCalled();
      expect(mockUpdateUser).toHaveBeenCalledWith(expect.objectContaining({ firstName: "Janet", lastName: "Smith" }));
      expect(onClose).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("shows API error when submit throws", async () => {
    mockDispatch.mockReturnValue({ unwrap: () => Promise.reject("boom") });

    const { container } = render(
      <UpdateYourInformationModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "Janet" } });
    fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "Smith" } });
    fireEvent.submit(container.querySelector("form")!);

    expect(await screen.findByText("boom")).toBeTruthy();
    fireEvent.click(screen.getByText("dismiss"));
  });
});

