import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";

type Importer<T extends ComponentType<any>> = () => Promise<{ default: T }>;

export const lazyWithPreload = <T extends ComponentType<any>>(importer: Importer<T>) => {
  const Component = lazy(importer) as LazyExoticComponent<T> & {
    preload: () => Promise<{ default: T }>;
  };

  Component.preload = importer;
  return Component;
};
