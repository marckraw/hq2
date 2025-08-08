import {
  sbBlockquoteFlexGroupDesignSchema,
  sbBlockquoteSectionDesignSchema,
} from "../component-registry/blockquote/design-schemas/blockquote.schema";
import { sbEditorialCardDesignSchema } from "../component-registry/editorial-card/design-schemas/editorial-card.schema";
import { sbHeadlineDesignSchema } from "../component-registry/headline/design-schemas/headline.schema";
import { sbListDesignSchema } from "../component-registry/list/design-schemas/list.schema";
import { sbSectionDesignSchema } from "../component-registry/section/design-schemas/section.schema";
import { sbTextDesignSchema } from "../component-registry/text/design-schemas/text.schema";

// Grouping object for all component design schemas
export const designSchemas = {
  "sb-headline": sbHeadlineDesignSchema,
  "sb-list": sbListDesignSchema,
  "sb-text": sbTextDesignSchema,
  "sb-section": sbSectionDesignSchema,
  "sb-editorial-card": sbEditorialCardDesignSchema,
  "sb-blockquote-section": sbBlockquoteSectionDesignSchema,
  "sb-blockquote-flex-group": sbBlockquoteFlexGroupDesignSchema,
};
