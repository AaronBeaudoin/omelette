// Meet `isolatedModules` requirement.
export {};

let data = {
  lastTouchEventTimestamp: 0,
  type: "touch"
};

let enableTouchInput = () => {
  console.log("touch");
  document.addEventListener("mousemove", disableTouchInput, true);
  data.lastTouchEventTimestamp = new Date().getTime();
  
  data.type = "touch";
  document.documentElement.dataset.input = data.type;
};

let disableTouchInput = () => {
  console.log("mouse");
  document.removeEventListener("mousemove", disableTouchInput, true);
  if (new Date().getTime() - data.lastTouchEventTimestamp < 500) return;

  data.type = "mouse";
  document.documentElement.dataset.input = data.type;
};

document.addEventListener("touchstart", enableTouchInput, true);
document.addEventListener("mousemove", disableTouchInput, true);
