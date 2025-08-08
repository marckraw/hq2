// Re-export Figma types from Zod schemas to maintain compatibility
// All types are now inferred from Zod schemas for better validation

export type {
  FigmaNode,
  FigmaFile,
  FigmaPage,
  FigmaError,
  FigmaColor,
  FigmaFill,
  FigmaBoundingBox,
  FigmaStroke,
  FigmaEffect,
  FigmaStyle,
  FigmaFileMetadata,
} from "../schemas/figma.schemas";
