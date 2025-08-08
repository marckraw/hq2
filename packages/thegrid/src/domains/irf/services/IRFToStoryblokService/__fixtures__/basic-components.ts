import type { IntermediateLayout } from '../../../schema.types';

/**
 * Basic component test data for IRF to Storyblok transformation tests
 * This file contains the same test scenarios as basic-components.ts but as pure data exports
 */

export const simplePageLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Simple Page Layout",
  content: [
    {
      type: "page",
      name: "Test Page",
      children: [
        {
          type: "section",
          name: "Hero Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "headline",
              name: "Welcome Headline",
              parentNodeTypeName: "section",
              props: {
                content: "Welcome to Our Site",
                title: "Welcome to Our Site",
                headline: "Welcome to Our Site"
              }
            },
            {
              type: "text",
              name: "Welcome Text",
              parentNodeTypeName: "section",
              props: {
                content: "This is a welcome message for our visitors.",
                text: "This is a welcome message for our visitors."
              }
            }
          ]
        }
      ]
    }
  ]
};

export const multiSectionLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Multi Section Layout",
  content: [
    {
      type: "page",
      name: "Multi Section Page",
      children: [
        {
          type: "section",
          name: "Header Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "headline",
              name: "Header Title",
              parentNodeTypeName: "section",
              props: {
                content: "Our Services",
                title: "Our Services",
                headline: "Our Services",
                as: "h1"
              }
            }
          ]
        },
        {
          type: "section",
          name: "Content Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "headline",
              name: "Section Title",
              parentNodeTypeName: "section",
              props: {
                content: "What We Do",
                title: "What We Do",
                headline: "What We Do",
                as: "h2"
              }
            },
            {
              type: "text",
              name: "Section Description",
              parentNodeTypeName: "section",
              props: {
                content: "We provide excellent services to our clients.",
                text: "We provide excellent services to our clients."
              }
            }
          ]
        },
        {
          type: "section",
          name: "Footer Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "text",
              name: "Footer Text",
              parentNodeTypeName: "section",
              props: {
                content: "Contact us for more information.",
                text: "Contact us for more information."
              }
            }
          ]
        }
      ]
    }
  ]
};

export const imageLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Image Test Layout",
  content: [
    {
      type: "page",
      name: "Image Page",
      children: [
        {
          type: "image",
          name: "Hero Image",
          props: {
            alt: "Beautiful landscape",
            title: "A Beautiful Landscape",
            name: "landscape.jpg"
          },
          design: {
            appearance: {
              backgroundColor: {
                imageRef: "https://example.com/image.jpg"
              }
            }
          }
        },
        {
          type: "section",
          name: "Gallery Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "headline",
              name: "Gallery Title",
              parentNodeTypeName: "section",
              props: {
                content: "Our Gallery",
                title: "Our Gallery",
                headline: "Our Gallery"
              }
            },
            {
              type: "image",
              name: "Gallery Image 1",
              parentNodeTypeName: "section",
              props: {
                alt: "First gallery image",
                name: "gallery-1.jpg"
              }
            },
            {
              type: "image",
              name: "Gallery Image 2",
              parentNodeTypeName: "section",
              props: {
                alt: "Second gallery image",
                name: "gallery-2.jpg"
              }
            }
          ]
        }
      ]
    }
  ]
};

export const dividerLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Divider Test Layout",
  content: [
    {
      type: "page",
      name: "Divider Page",
      children: [
        {
          type: "section",
          name: "Content Section",
          children: [
            {
              type: "text",
              name: "First Text",
              props: {
                content: "Content before divider",
                text: "Content before divider"
              }
            },
            {
              type: "divider",
              name: "Section Divider"
            },
            {
              type: "text",
              name: "Second Text",
              props: {
                content: "Content after divider",
                text: "Content after divider"
              }
            },
            {
              type: "divider",
              name: "Another Divider"
            },
            {
              type: "text",
              name: "Third Text",
              props: {
                content: "More content after second divider",
                text: "More content after second divider"
              }
            }
          ]
        }
      ]
    }
  ]
};

export const emptyPageLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Empty Layout",
  content: [
    {
      type: "page",
      name: "Empty Page",
      children: []
    }
  ]
};

export const customClassLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Custom Class Layout",
  content: [
    {
      type: "page",
      name: "Styled Page",
      children: [
        {
          type: "section",
          name: "Custom Section",
          parentNodeTypeName: "page",
          props: {
            customClassname: "custom-section-class"
          },
          children: [
            {
              type: "headline",
              name: "Custom Headline",
              parentNodeTypeName: "section",
              props: {
                content: "Styled Headline",
                title: "Styled Headline",
                headline: "Styled Headline",
                customClassname: "custom-headline-class"
              }
            },
            {
              type: "text",
              name: "Custom Text",
              parentNodeTypeName: "section",
              props: {
                content: "Styled text content",
                text: "Styled text content",
                customClassname: "custom-text-class"
              }
            }
          ]
        }
      ]
    }
  ]
};

export const headlineLevelsLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Headline Levels Layout",
  content: [
    {
      type: "page",
      name: "Headlines Page",
      children: [
        {
          type: "section",
          name: "Headlines Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "headline",
              name: "H1 Headline",
              parentNodeTypeName: "section",
              props: {
                content: "Main Title",
                title: "Main Title",
                headline: "Main Title",
                as: "h1"
              }
            },
            {
              type: "headline",
              name: "H2 Headline",
              parentNodeTypeName: "section",
              props: {
                content: "Section Title",
                title: "Section Title",
                headline: "Section Title",
                as: "h2"
              }
            },
            {
              type: "headline",
              name: "H3 Headline",
              parentNodeTypeName: "section",
              props: {
                content: "Subsection Title",
                title: "Subsection Title",
                headline: "Subsection Title",
                as: "h3"
              }
            },
            {
              type: "headline",
              name: "H4 Headline",
              parentNodeTypeName: "section",
              props: {
                content: "Minor Heading",
                title: "Minor Heading",
                headline: "Minor Heading",
                as: "h4"
              }
            },
            {
              type: "headline",
              name: "H5 Headline",
              parentNodeTypeName: "section",
              props: {
                content: "Small Heading",
                title: "Small Heading",
                headline: "Small Heading",
                as: "h5"
              }
            },
            {
              type: "headline",
              name: "H6 Headline",
              parentNodeTypeName: "section",
              props: {
                content: "Tiny Heading",
                title: "Tiny Heading",
                headline: "Tiny Heading",
                as: "h6"
              }
            }
          ]
        }
      ]
    }
  ]
};