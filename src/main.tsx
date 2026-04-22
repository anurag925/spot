// @ts-nocheck
import React from "react";
import ReactDOMClient from "react-dom/client";
import App from "./App";
import "./styles/index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOMClient.createRoot(rootElement);
  root.render(React.createElement(App));
}