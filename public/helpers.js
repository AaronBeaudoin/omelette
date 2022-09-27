// This script is a collection of useful helpers for the client/browser.

// ----------------------------------------------------------------------------------------------------

// This browser-only helper adds data to the root HTML element which
// we can use in CSS selectors to dynamically toggle hover behavior
// on and off based on whether the user is using touch or mouse.

// We use touch as the default initial input because hover
// behavior is an optional addition only necessary for mouse
// input, which will be toggled immediately below if necessary.
let input = document.documentElement.dataset.input = "touch";

// Touch devices emulate mouse input so "mouse-only" content still works.
// To avoid immediately toggling to mouse immediately after touch input,
// we'll ignore mouse input for 500 milliseconds after a touch.
let lastTouchTimestamp = 0;

// We use `passive` to ensure the best possible performance.
// We use `capture` to handle the event as early as possible.
const listenerConfig = { passive: true, capture: true };

// When a touch input occurs, we:
// 1. Record the timestamp of when it occurred.
// 2. Ensure we are listening for mouse input.
// 3. Set the input data on the root element.
const touchListener = _ => {

  lastTouchTimestamp = new Date().getTime();
  document.addEventListener("mousemove", mouseListener, listenerConfig);
  document.documentElement.dataset.input = input = "touch";
};

// When a mouse input occurs, we:
// 1. Ignore it if a touch occurred in the last 500ms.
// 2. Otherwise, stop listening for mouse input.
// 3. Set the input data on the root element.
const mouseListener = _ => {

  if (new Date().getTime() - (lastTouchTimestamp || 0) < 500) return;
  document.removeEventListener("mousemove", mouseListener, listenerConfig);
  document.documentElement.dataset.input = input = "mouse";
};

// Initialize input listeners.
document.addEventListener("touchstart", touchListener, listenerConfig);
document.addEventListener("mousemove", mouseListener, listenerConfig);

// ----------------------------------------------------------------------------------------------------

let lastViewportTimestamp = 0;
let lastViewportWidth = 0;
let lastViewportHeight = 0;
let lastWindowOrientation = null;
let lastWindowArea = 0;

// When a relevant event occurs, we:
// 1. Record the timestamp of when it occurred.
// 2. Check conditions for updating viewport height.
// 3. Update the viewport width if necessary.
// 4. Update the viewport height if necessary.
const viewportListener = _ => {

  // Record the current timestamp.
  lastViewportTimestamp = new Date().getTime();

  // The viewport width without the vertical scrollbar.
  const viewportWidth = document.documentElement.clientWidth;

  // The viewport height without the horizontal scrollbar.
  const viewportHeight = document.documentElement.clientHeight;

  // The orientation of the window as a boolean flag.
  const windowOrientation = window.innerWidth < window.innerHeight;

  // The total area of the windows.
  const windowArea = window.innerWidth * window.innerHeight;

  // If the viewport height is changing due to a toggling URL bar on a mobile device
  // then we want to ignore that change, so the 4 conditions below attempt to be
  // narrow enough to only be `true` when a mobile device URL bar is toggling.
  const shouldUpdateViewportHeight = !(

    // It has been more than 500 milliseconds since the listener last ran.
    // (Otherwise, the user is most likely dragging a desktop window corner.)
    (new Date().getTime() - lastViewportTimestamp) > 500 &&

    // Only the height of the viewport is changing.
    viewportWidth === lastViewportWidth &&

    // The orientation of the viewport is the same.
    windowOrientation === lastWindowOrientation &&

    // The area of the viewport is changing by less than 1/3.
    Math.abs(windowArea - lastWindowArea) < (lastWindowArea / 3)
  );

  // We only update the viewport width if it has changed.
  if (viewportWidth !== lastViewportWidth) {

    document.documentElement.style.setProperty("--vw", `${viewportWidth}px`);
    lastViewportWidth = viewportWidth;
  }
  
  // We only update the viewport height if it has changed
  // and if none of the conditions above were `true`.
  if (viewportHeight !== lastViewportHeight && shouldUpdateViewportHeight) {

    document.documentElement.style.setProperty("--vh", `${viewportHeight}px`);
    lastViewportHeight = viewportHeight;
    lastWindowOrientation = windowOrientation;
    lastWindowArea = windowArea;
  }
};

// Initialize event listeners.
window.addEventListener("load", viewportListener);
window.addEventListener("resize", viewportListener);
viewportListener();

// ----------------------------------------------------------------------------------------------------

// Set CSS custom properties on `:root`.
function setStyleProps(props) {
  const setter = _ => document.documentElement.style.setProperty(_, props[_]);
  Object.keys(props).forEach(setter);
}

// In case `ResizeObserver` is `undefined` below, we set some
// sensible defaults here so the page at least looks decent.
setStyleProps({
  "--ph": "calc(var(--vh) * 0.85)",
  "--th": "calc(var(--vh) * 0.65)",
  "--bh": "calc(var(--vh) * 0.65)",
  "--ih": "calc(var(--vh) * 0.50)"
});

// The `<body>` should have 7 "root elements" for the page to use, the 3 "top" elements
// below, the root of the page content itself, and the 3 "bottom" elements below. The
// page will be rendered between the top and bottom elements, and teleports must be
// used to place content in those top and bottom elements.
const elements = {
  "top-before": null,
  "top-sticky": null,
  "top-after": null,
  "bottom-before": null,
  "bottom-sticky": null,
  "bottom-after": null
};

// Every time the dimenstions of any of the elements above changes we will
// recalculate the CSS custom properties so they are always accurate.
const resizeObserver = new ResizeObserver(_ => {

  // Record element heights.
  const heights = {

    top: {
      before: elements["top-before"].offsetHeight,
      sticky: elements["top-sticky"].offsetHeight,
      after: elements["top-after"].offsetHeight
    },
    bottom: {
      before: elements["bottom-before"].offsetHeight,
      sticky: elements["bottom-sticky"].offsetHeight,
      after: elements["bottom-after"].offsetHeight
    }
  };

  // The total height of all sticky content
  // at the top or bottom of the document.
  const sticky = heights.top.sticky + heights.bottom.sticky;

  // The total height of all non-page content at the
  // top of the document, excluding sticky content.
  const top = heights.top.before + heights.top.after;

  // The total height of all non-page content at the
  // bottom of the document, excluding sticky content.
  const bottom = heights.bottom.before + heights.bottom.after;

  // Set all the CSS custom properties.
  setStyleProps({

    // `--ph` stands for "page height".
    "--ph": `calc(var(--vh) - ${sticky}px)`,
    
    // `--th` stands for "top height".
    "--th": `calc(var(--vh) - ${sticky + top}px)`,

    // `--bh` stands for "bottom height".
    "--bh": `calc(var(--vh) - ${sticky + bottom}px)`,

    // `--ih` stands for "inner height".
    "--ih": `calc(var(--vh) - ${sticky + top + bottom}px)`,

    // Expose the individual heights for custom use.
    "--top-before": `${heights.top.before}px`,
    "--top-sticky": `${heights.top.sticky}px`,
    "--top-after": `${heights.top.after}px`,
    "--bottom-before": `${heights.bottom.before}px`,
    "--bottom-sticky": `${heights.bottom.sticky}px`,
    "--bottom-after": `${heights.bottom.after}px`
  });
});

// This script is intentionally run before the body has been parsed in order to prevent
// significant layout shift from large areas of the page depending on these CSS custom
// properties. To ensure we begin listening for resizes as soon as possible we use
// mutation observer to start observing the moment the DOM element is added.
const mutationObserver = new MutationObserver(records => {

  // This looping is necessary due to the nature of the `MutationObserver` API.
  records.forEach(record => {
    record.addedNodes.forEach(node => {

      // Populate `elements`.
      if (node.id in elements) elements[node.id] = node;
      if (Object.keys(elements).filter(_ => elements[_]).length < 6) return;

      // Once all elements have been found, observe them for resizes.
      Object.keys(elements).forEach(_ => resizeObserver.observe(elements[_]));

      // We also don't need the mutation observer anymore.
      mutationObserver.disconnect();
    });
  });
})

// Immediately starting observing the entire document subtree for `childList` mutations.
// This is necessary because at this point not even the `<body>` element exists yet.
mutationObserver.observe(document.documentElement, {
  childList: true,
  subtree: true
});
