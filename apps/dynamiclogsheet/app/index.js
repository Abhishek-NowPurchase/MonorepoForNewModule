import { mount } from "./mount";

const getStandaloneContainer = () => {
  if (typeof document === "undefined") {
    throw new Error("Document is not available for standalone mount.");
  }

  const existingRoot =
    document.getElementById("root") ||
    document.getElementById("dynamic-log-sheet-root");

  if (existingRoot) {
    return existingRoot;
  }

  const container = document.createElement("div");
  container.id = "dynamic-log-sheet-root";
  document.body.appendChild(container);
  return container;
};

if (typeof document !== "undefined") {
  const container = getStandaloneContainer();
  mount(container);
}


