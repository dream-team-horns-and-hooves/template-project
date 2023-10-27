import React from "preact/compat";

import { GlobalState } from "@client/store/globalState";
import {AppLayout} from "@client/layouts";
import {Home} from "@client/pages";
export const App = () => (
  <GlobalState>
    <AppLayout>
      <Home/>
    </AppLayout>
  </GlobalState>
);
