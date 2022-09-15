// Meet `isolatedModules` requirement.
export {};

let currentInputType: string | null = null;
let lastTouchTimestamp: number | null = null;
let html = document.documentElement;

function onTouch() {
  document.addEventListener("mousemove", onMouse, true);
  lastTouchTimestamp = new Date().getTime();
  html.dataset.input = currentInputType = "touch";
}

function onMouse() {
  document.removeEventListener("mousemove", onMouse, true);
  if (new Date().getTime() - (lastTouchTimestamp || 0) < 500) return;
  html.dataset.input = currentInputType = "mouse";
}

document.addEventListener("touchstart", onTouch, true);
document.addEventListener("mousemove", onMouse, true);
