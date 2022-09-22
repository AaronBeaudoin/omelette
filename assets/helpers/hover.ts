// This browser-only helper adds data to the root HTML element which
// we can use in CSS selectors to dynamically toggle hover behavior
// on and off based on whether the user is using touch or mouse.

// We use touch as the default initial input because hover
// behavior is an optional addition only necessary for mouse
// input, which will be toggled immediately below if necessary.
let input: string = document.documentElement.dataset.input = "touch";

// Touch devices emulate mouse input so "mouse-only" content still works.
// To avoid immediately toggling to mouse immediately after touch input,
// we'll ignore mouse input for 500 milliseconds after a touch.
let touchTimestamp: number = 0;

// We use `passive` to ensure the best possible performance.
// We use `capture` to handle the event as early as possible.
const listenerConfig = { passive: true, capture: true };

// When a touch input occurs, we:
// 1. Record the timestamp of when it occurred.
// 2. Ensure we are listening for mouse input.
// 3. Set the input data on the root element.
const touchListener = (event: TouchEvent) => {

  touchTimestamp = new Date().getTime();
  document.addEventListener("mousemove", mouseListener, listenerConfig);
  document.documentElement.dataset.input = input = "touch";
};

// When a mouse input occurs, we:
// 1. Ignore it if a touch occurred in the last 500ms.
// 2. Otherwise, stop listening for mouse input.
// 3. Set the input data on the root element.
const mouseListener = (event: MouseEvent) => {

  if (new Date().getTime() - (touchTimestamp || 0) < 500) return;
  document.removeEventListener("mousemove", mouseListener, listenerConfig);
  document.documentElement.dataset.input = input = "mouse";
};

// Initialize input listeners.
document.addEventListener("touchstart", touchListener, listenerConfig);
document.addEventListener("mousemove", mouseListener, listenerConfig);

// Meet TypeScript `isolatedModules` requirement.
// (Script must have an `export` or `import`.)
export {};
