import { GlobalState } from "@client/store/globalState";
import {AppLayout} from "@client/layouts";
import {Home} from "@client/pages";
import React from "preact/compat";
export const App = () => (
  <GlobalState>
    <AppLayout>
      <Home/>
    </AppLayout>
  </GlobalState>
);
