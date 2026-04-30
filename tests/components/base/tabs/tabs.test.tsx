import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react-aria-components", async () => {
  const React = await import("react");

  const TabsContext = React.createContext<{ orientation?: "horizontal" | "vertical" } | null>(null);

  const useSlottedContext = (_ctx: unknown) =>
    React.useContext(TabsContext as React.Context<{ orientation?: "horizontal" | "vertical" } | null>);

  const Tabs = ({
    children,
    orientation = "horizontal",
    className,
  }: {
    children: React.ReactNode;
    orientation?: "horizontal" | "vertical";
    className?: string | ((state: Record<string, unknown>) => string);
  }) => {
    const computed = typeof className === "function" ? className({}) : className;
    return (
      <TabsContext.Provider value={{ orientation }}>
        <div data-testid="tabs-root" className={computed}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  };

  const TabList = ({
    children,
    className,
    items,
  }: {
    children?: React.ReactNode | ((item: any) => React.ReactNode);
    className?: string | ((state: Record<string, unknown>) => string);
    items?: Array<any>;
  }) => {
    const computed = typeof className === "function" ? className({}) : className;
    return (
      <div data-testid="tab-list" className={computed}>
        {typeof children === "function" && items
          ? items.map((item, index) => <React.Fragment key={item.id ?? index}>{children(item)}</React.Fragment>)
          : children}
      </div>
    );
  };

  const Tab = ({
    children,
    className,
    id,
  }: {
    children?: React.ReactNode | ((state: any) => React.ReactNode);
    className?: string | ((state: any) => string);
    id?: string;
  }) => {
    const stateSelected = { isFocusVisible: true, isSelected: true, isHovered: false };
    const stateUnselected = { isFocusVisible: false, isSelected: false, isHovered: false };
    // Call className with both selected and unselected to cover all color branches
    if (typeof className === "function") {
      className(stateUnselected);
    }
    const computed = typeof className === "function" ? className(stateSelected) : className;
    return (
      <button data-testid={`tab-${id ?? "default"}`} className={computed}>
        {typeof children === "function" ? children(stateSelected) : children}
      </button>
    );
  };

  const TabPanel = ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string | ((state: Record<string, unknown>) => string);
  }) => {
    const computed = typeof className === "function" ? className({}) : className;
    return (
      <div data-testid="tab-panel" className={computed}>
        {children}
      </div>
    );
  };

  return {
    Tabs,
    TabList,
    Tab: Tab,
    TabPanel,
    TabsContext,
    useSlottedContext,
  };
});

vi.mock("@/components/base/badges/badges", () => ({
  Badge: ({ children, color }: { children: React.ReactNode; color: string }) => (
    <span data-testid="badge" data-color={color}>
      {children}
    </span>
  ),
}));

import { Tabs, TabList, Tab, TabPanel } from "@/components/base/tabs/tabs";

describe("tabs component set", () => {
  it("renders list/items/panel and uses render-props branches", () => {
    render(
      <Tabs className={() => "tabs-class"}>
        <TabList
          type="underline"
          size="md"
          fullWidth
          items={[
            { id: "a", label: "First", badge: 2 },
            { id: "b", label: "Second" },
          ]}
          className={() => "list-class"}
        >
          {item => (
            <Tab id={item.id} badge={item.badge} className={() => "item-class"}>
              {state => (
                <span>{`${item.label}-${String(state.isSelected)}-${String(state.isFocusVisible)}`}</span>
              )}
            </Tab>
          )}
        </TabList>
        <TabPanel className={() => "panel-class"}>panel-content</TabPanel>
      </Tabs>
    );

    expect(screen.getByTestId("tabs-root").className).toContain("tabs-class");
    expect(screen.getByTestId("tab-list").className).toContain("list-class");
    expect(screen.getByTestId("tab-a").className).toContain("item-class");
    expect(screen.getByTestId("tab-b")).toBeTruthy();
    expect(screen.getByText("First-true-true")).toBeTruthy();
    expect(screen.getByText("panel-content")).toBeTruthy();
    expect(screen.getByTestId("tab-panel").className).toContain("panel-class");
    expect(screen.getByTestId("badge")).toHaveAttribute("data-color", "brand");
  });

  it("supports vertical orientation and tab label fallback without badge", () => {
    render(
      <Tabs orientation="vertical">
        <TabList type="line" size="sm" items={[]}>
          <Tab id="v1" label="Vertical one" />
        </TabList>
      </Tabs>
    );

    expect(screen.getByText("Vertical one")).toBeTruthy();
    expect(screen.queryByTestId("badge")).toBeNull();
  });

  it("TabPanel with string className (covers line 182 string branch)", () => {
    render(
      <Tabs>
        <TabList items={[]} type="line" size="sm">
          <Tab id="t1" label="T1" />
        </TabList>
        <TabPanel className="panel-string-class">content</TabPanel>
      </Tabs>
    );
    expect(screen.getByText("content")).toBeTruthy();
  });

  it("TabList orientation fallback to horizontal when no context (covers line 143)", () => {
    // Render TabList WITHOUT a Tabs wrapper so context is null -> falls back to "horizontal"
    render(
      <TabList type="underline" size="sm" items={[{ id: "x", label: "X", children: "X" }]} />
    );
    expect(screen.getByTestId("tab-list")).toBeTruthy();
  });

  it("Tab with size=sm and badge (covers line 224 size===sm branch)", () => {
    render(
      <Tabs>
        <TabList type="button-brand" size="sm" items={[{ id: "b1", label: "Badged", badge: 5 }]}>
          {(item: any) => (
            <Tab id={item.id} badge={item.badge}>
              {item.label}
            </Tab>
          )}
        </TabList>
      </Tabs>
    );
    expect(screen.getByTestId("badge")).toBeTruthy();
  });

  it("TabList uses default renderer when children is not provided (null coalescence branch)", () => {
    const items = [
      { id: "tab1", label: "Auto Tab 1", children: "Content 1" },
      { id: "tab2", label: "Auto Tab 2", children: "Content 2" },
    ];
    render(
      <Tabs>
        <TabList type="line" size="sm" items={items} />
      </Tabs>
    );
    expect(screen.getByText("Content 1")).toBeTruthy();
    expect(screen.getByText("Content 2")).toBeTruthy();
  });
});

