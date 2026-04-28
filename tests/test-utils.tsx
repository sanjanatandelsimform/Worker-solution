import React, { type PropsWithChildren } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { MemoryRouter, type MemoryRouterProps } from "react-router-dom";
import authReducer from "@/store/slices/authSlice";
import profileReducer from "@/store/slices/profileSlice";
import registrationFormReducer from "@/store/slices/registrationFormSlice";
import userReducer from "@/store/slices/userSlice";
import dashboardReducer from "@/store/slices/dashboardSlice";
import finchStatusReducer from "@/store/slices/finchStatusSlice";
import workforceReducer from "@/store/slices/workforceSlice";
import industryReducer from "@/store/slices/industrySlice";
import recommendationsReducer from "@/store/slices/recommendationsSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  registrationForm: registrationFormReducer,
  user: userReducer,
  dashboard: dashboardReducer,
  finchStatus: finchStatusReducer,
  workforce: workforceReducer,
  industry: industryReducer,
  recommendations: recommendationsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as RootState,
  });
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof createTestStore>;
  routerProps?: MemoryRouterProps;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    routerProps = {},
    ...renderOptions
  }: RenderWithProvidersOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <MemoryRouter {...routerProps}>{children}</MemoryRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
