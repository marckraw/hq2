import { serviceRegistry } from "../../../registry/service-registry";

// IRF services imports
import { designIntentMapperService } from "./DesignIntentMapperService/design-intent-mapper.service";
import { storyblokDesignToIRFService } from "./StoryblokDesignToIRFService/storyblok-design-to-irf.service";
import { assetService } from "./AssetService/asset.service";
import { createIRFToStoryblokService } from "./IRFToStoryblokService/irf-to-storyblok.service";
import { createStoryblokToIRFService } from "./StoryblokToIRFService/storyblok-to-irf.service";
import { createIRFTraversingService } from "./IRFTraversingService/irf-traversing.service";

// Register IRF services with the service registry
const registerIRFServices = () => {
  serviceRegistry.registerLazy(
    "designIntentMapper",
    () => designIntentMapperService
  );
  serviceRegistry.registerLazy(
    "storyblokDesignToIRF",
    () => storyblokDesignToIRFService
  );
  serviceRegistry.registerLazy("asset", () => assetService);
  serviceRegistry.registerLazy("irfToStoryblok", createIRFToStoryblokService);
  serviceRegistry.registerLazy("storyblokToIRF", createStoryblokToIRFService);
  serviceRegistry.registerLazy("irfTraversing", createIRFTraversingService);
};

// Register services immediately
registerIRFServices();

// Domain-specific service accessors (functional style)
const createIRFServices = () => {
  return {
    designIntentMapper: () => serviceRegistry.get("designIntentMapper"),
    storyblokDesignToIRF: () => serviceRegistry.get("storyblokDesignToIRF"),
    asset: () => serviceRegistry.get("asset"),
    irfToStoryblok: () => serviceRegistry.get("irfToStoryblok"),
    storyblokToIRF: () => serviceRegistry.get("storyblokToIRF"),
    irfTraversing: () => serviceRegistry.get("irfTraversing"),
  };
};

export const irfServices = createIRFServices();

// Individual exports for convenience
export const {
  designIntentMapper,
  storyblokDesignToIRF,
  asset,
  irfToStoryblok,
  storyblokToIRF,
  irfTraversing,
} = irfServices;

// Type exports
export type IRFServices = {
  designIntentMapper: typeof designIntentMapperService;
  storyblokDesignToIRF: typeof storyblokDesignToIRFService;
  asset: typeof assetService;
  irfToStoryblok: ReturnType<typeof createIRFToStoryblokService>;
  storyblokToIRF: ReturnType<typeof createStoryblokToIRFService>;
  irfTraversing: ReturnType<typeof createIRFTraversingService>;
};

// Export the register function for external use
export { registerIRFServices };
