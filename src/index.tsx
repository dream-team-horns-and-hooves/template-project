import {StrictMode} from "react";
import React from "preact/compat";
import ReactDOM from 'react-dom';
import {App} from "@client/app";
import {GlobalState} from "@client/store";

import "@client/global/styles.css"

ReactDOM.render(
  <StrictMode>
    <GlobalState>
      <App />
    </GlobalState>
  </StrictMode>,
  document.getElementById('app'),
)

