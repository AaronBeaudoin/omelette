/// <reference types="vite/client"/>

declare module "*.vue" {
  import type { ComponentOptions } from "vue";
  const Component: ComponentOptions;
  export default Component;
}

declare module "*.md" {
  import type { ComponentOptions } from "vue";
  const Component: ComponentOptions;
  export default Component;
}

declare type FunctionQuery = {
  [key: string]: string | string[]
};

type DefaultFunctionConfig = {
  type: "default"
};

type BuilderFunctionConfig = {
  type: "builder",
  expiration?: number,
  build: () => Record<string, string>[]
};

type FunctionConfig = (
  DefaultFunctionConfig |
  BuilderFunctionConfig
);
