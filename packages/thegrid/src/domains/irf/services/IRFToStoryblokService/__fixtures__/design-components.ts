import type { IntermediateLayout } from '../../../schema.types';

/**
 * Components with design tokens test data for IRF to Storyblok transformation tests
 * This file contains the same test scenarios as design-components.ts but as pure data exports
 */

export const basicDesignLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Basic Design Layout",
  content: [
    {
      type: "page",
      name: "Designed Page",
      children: [
        {
          type: "section",
          name: "Styled Section",
          parentNodeTypeName: "page",
          design: {
            layout: {
              direction: "vertical",
              padding: { top: 20, bottom: 20, left: 16, right: 16 },
              gap: 16
            },
            appearance: {
              backgroundColor: "#f0f0f0",
              borderRadius: 8
            },
            typography: {
              fontSize: 16,
              fontWeight: 400
            }
          },
          children: [
            {
              type: "headline",
              name: "Styled Headline",
              parentNodeTypeName: "section",
              props: {
                content: "Styled Content",
                title: "Styled Content",
                headline: "Styled Content"
              }
            }
          ]
        }
      ]
    }
  ]
};

export const breakpointDesignLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Breakpoint Design Layout",
  content: [
    {
      type: "page",
      name: "Responsive Page",
      children: [
        {
          type: "section",
          name: "Responsive Section",
          parentNodeTypeName: "page",
          design: {
            layout: {
              padding: {
                top: "xs",
                bottom: "xs",
                left: "m",
                right: "m"
              },
              gap: "s"
            },
            breakpoints: {
              tablet: {
                layout: {
                  padding: {
                    top: "m",
                    bottom: "m",
                    left: "l",
                    right: "l"
                  },
                  gap: "m"
                }
              },
              desktop: {
                layout: {
                  padding: {
                    top: "xl",
                    bottom: "xl",
                    left: "xxl",
                    right: "xxl"
                  },
                  gap: "l"
                }
              }
            }
          },
          children: [
            {
              type: "headline",
              name: "Responsive Title",
              parentNodeTypeName: "section",
              design: {
                typography: {
                  fontSize: 24,
                  fontWeight: 700,
                  textAlign: "center"
                },
                breakpoints: {
                  tablet: {
                    typography: {
                      fontSize: 32,
                      textAlign: "left"
                    }
                  },
                  desktop: {
                    typography: {
                      fontSize: 48
                    }
                  }
                }
              },
              props: {
                content: "Adapts to Screen Size",
                title: "Adapts to Screen Size",
                headline: "Adapts to Screen Size"
              }
            }
          ]
        }
      ]
    }
  ]
};

export const coloredDesignLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Colored Design Layout",
  content: [
    {
      type: "page",
      name: "Colored Page",
      children: [
        {
          type: "section",
          name: "Brand Section",
          parentNodeTypeName: "page",
          design: {
            layout: {
              padding: {
                top: "xl",
                bottom: "xl",
                left: "m",
                right: "m"
              },
              gap: "m"
            },
            appearance: {
              backgroundColor: "#f8f9fa",
              borderRadius: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }
          },
          children: [
            {
              type: "headline",
              name: "Brand Title",
              parentNodeTypeName: "section",
              design: {
                typography: {
                  color: "#1a73e8",
                  fontSize: 30,
                  textAlign: "center"
                }
              },
              props: {
                content: "Our Brand Colors",
                title: "Our Brand Colors",
                headline: "Our Brand Colors"
              }
            },
            {
              type: "text",
              name: "Brand Description",
              parentNodeTypeName: "section",
              design: {
                typography: {
                  color: "#5f6368",
                  fontSize: 16,
                  lineHeight: 1.5
                }
              },
              props: {
                content: "Experience our vibrant color palette",
                text: "Experience our vibrant color palette"
              }
            }
          ]
        }
      ]
    }
  ]
};

export const flexDesignLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Flex Design Layout",
  content: [
    {
      type: "page",
      name: "Flex Design Page",
      children: [
        {
          type: "section",
          name: "Flex Section",
          parentNodeTypeName: "page",
          design: {
            layout: {
              direction: "horizontal",
              alignItems: "stretch",
              justifyContent: "space-between",
              gap: "m"
            }
          },
          children: [
            {
              type: "flex-group",
              name: "Row Group",
              parentNodeTypeName: "section",
              children: [
                {
                  type: "text",
                  name: "Column 1",
                  parentNodeTypeName: "flex-group",
                  design: {
                    layout: {
                      flex: 1,
                      padding: { all: "s" }
                    },
                    appearance: {
                      backgroundColor: "#e8f0fe",
                      borderRadius: 4
                    }
                  },
                  props: {
                    content: "First column content",
                    text: "First column content"
                  }
                },
                {
                  type: "text",
                  name: "Column 2",
                  parentNodeTypeName: "flex-group",
                  design: {
                    layout: {
                      flex: 2,
                      padding: { all: "s" }
                    },
                    appearance: {
                      backgroundColor: "#fce8e6",
                      borderRadius: 4
                    }
                  },
                  props: {
                    content: "Second column content",
                    text: "Second column content"
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const animatedDesignLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Animated Design Layout",
  content: [
    {
      type: "page",
      name: "Animated Page",
      children: [
        {
          type: "section",
          name: "Animated Section",
          parentNodeTypeName: "page",
          design: {
            animation: {
              type: "slide-up",
              duration: 800,
              stagger: 100
            }
          },
          children: [
            {
              type: "headline",
              name: "Animated Title",
              parentNodeTypeName: "section",
              design: {
                animation: {
                  type: "fade-in",
                  duration: 500,
                  delay: 0,
                  easing: "ease-out"
                },
                hover: {
                  transform: "scale(1.05)",
                  transition: "transform 0.3s ease"
                }
              },
              props: {
                content: "Watch Me Animate",
                title: "Watch Me Animate",
                headline: "Watch Me Animate"
              }
            }
          ]
        }
      ]
    }
  ]
};

export const nestedDesignLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Nested Design Layout",
  content: [
    {
      type: "page",
      name: "Complex Design Page",
      children: [
        {
          type: "section",
          name: "Outer Section",
          parentNodeTypeName: "page",
          design: {
            layout: {
              maxWidth: 1200,
              margin: { top: 0, bottom: 0, left: "auto", right: "auto" },
              padding: { top: "xxl", bottom: "xxl", left: "l", right: "l" }
            },
            appearance: {
              backgroundColor: "#f5f5f5"
            }
          },
          children: [
            {
              type: "headline",
              name: "Section Title",
              parentNodeTypeName: "section",
              design: {
                typography: {
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#202124"
                }
              },
              props: {
                content: "Nested Design System",
                title: "Nested Design System",
                headline: "Nested Design System"
              }
            },
            {
              type: "flex-group",
              name: "Content Grid",
              parentNodeTypeName: "section",
              children: [
                {
                  type: "section",
                  name: "Card 1",
                  parentNodeTypeName: "flex-group",
                  design: {
                    layout: {
                      padding: { all: "m" }
                    },
                    appearance: {
                      backgroundColor: "#ffffff",
                      borderRadius: 8,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
                    }
                  },
                  children: [
                    {
                      type: "headline",
                      name: "Card Title",
                      parentNodeTypeName: "section",
                      design: {
                        typography: {
                          fontSize: 20,
                          fontWeight: 600
                        }
                      },
                      props: {
                        content: "Feature One",
                        title: "Feature One",
                        headline: "Feature One"
                      }
                    },
                    {
                      type: "text",
                      name: "Card Text",
                      parentNodeTypeName: "section",
                      props: {
                        content: "Description of feature one",
                        text: "Description of feature one"
                      }
                    }
                  ]
                },
                {
                  type: "section",
                  name: "Card 2",
                  parentNodeTypeName: "flex-group",
                  design: {
                    layout: {
                      padding: { all: "m" }
                    },
                    appearance: {
                      backgroundColor: "#ffffff",
                      borderRadius: 8,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
                    }
                  },
                  children: [
                    {
                      type: "headline",
                      name: "Card Title",
                      parentNodeTypeName: "section",
                      design: {
                        typography: {
                          fontSize: 20,
                          fontWeight: 600
                        }
                      },
                      props: {
                        content: "Feature Two",
                        title: "Feature Two",
                        headline: "Feature Two"
                      }
                    },
                    {
                      type: "text",
                      name: "Card Text",
                      parentNodeTypeName: "section",
                      props: {
                        content: "Description of feature two",
                        text: "Description of feature two"
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const customPropertiesDesignLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Custom Properties Design",
  content: [
    {
      type: "page",
      name: "Custom Design Page",
      children: [
        {
          type: "section",
          name: "Custom Section",
          parentNodeTypeName: "page",
          design: {
            custom: {
              "--custom-color": "#ff6b6b",
              "--custom-spacing": "24px",
              "--custom-radius": "12px"
            },
            layout: {
              padding: { all: "var(--custom-spacing)" }
            },
            appearance: {
              backgroundColor: "var(--custom-color)",
              borderRadius: "var(--custom-radius)"
            }
          },
          children: [
            {
              type: "headline",
              name: "Custom Title",
              parentNodeTypeName: "section",
              props: {
                content: "Advanced Styling",
                title: "Advanced Styling",
                headline: "Advanced Styling"
              }
            }
          ]
        }
      ]
    }
  ]
};