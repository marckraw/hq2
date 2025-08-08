import type { IntermediateLayout } from '../../../schema.types';

/**
 * Components with slots test data for IRF to Storyblok transformation tests
 * This file contains the same test scenarios as slots-components.ts but as pure data exports
 */

export const accordionLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Accordion Layout",
  content: [
    {
      type: "page",
      name: "Accordion Page",
      children: [
        {
          type: "section",
          name: "FAQ Section",
          children: [
            {
              type: "accordion",
              name: "FAQ Accordion",
              props: {
                type: "multiple"
              },
              children: [
                {
                  type: "accordion-item",
                  name: "FAQ Item 1",
                  slots: {
                    title: [
                      {
                        type: "headline",
                        name: "Question 1",
                        props: {
                          content: "What is your return policy?",
                          title: "What is your return policy?",
                          headline: "What is your return policy?",
                          as: "h3"
                        }
                      }
                    ],
                    content: [
                      {
                        type: "text",
                        name: "Answer 1",
                        props: {
                          content: "We offer a 30-day money-back guarantee.",
                          text: "We offer a 30-day money-back guarantee."
                        }
                      },
                      {
                        type: "divider",
                        name: "Answer Separator"
                      },
                      {
                        type: "text",
                        name: "Additional Info",
                        props: {
                          content: "No questions asked.",
                          text: "No questions asked."
                        }
                      }
                    ]
                  }
                },
                {
                  type: "accordion-item",
                  name: "FAQ Item 2",
                  slots: {
                    title: [
                      {
                        type: "headline",
                        name: "Question 2",
                        props: {
                          content: "How fast is shipping?",
                          title: "How fast is shipping?",
                          headline: "How fast is shipping?",
                          as: "h3"
                        }
                      }
                    ],
                    content: [
                      {
                        type: "text",
                        name: "Answer 2",
                        props: {
                          content: "Standard shipping takes 3-5 business days.",
                          text: "Standard shipping takes 3-5 business days."
                        }
                      }
                    ]
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

export const editorialCardLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Editorial Card Layout",
  content: [
    {
      type: "page",
      name: "Card Page",
      children: [
        {
          type: "editorial-card",
          name: "News Card",
          slots: {
            card_title: [
              {
                type: "headline",
                name: "Card Title",
                props: {
                  content: "Breaking News",
                  title: "Breaking News",
                  headline: "Breaking News"
                }
              }
            ],
            card_body: [
              {
                type: "text",
                name: "Card Intro",
                props: {
                  content: "Important announcement for all users.",
                  text: "Important announcement for all users."
                }
              },
              {
                type: "text",
                name: "Card Details",
                props: {
                  content: "We are launching new features next month.",
                  text: "We are launching new features next month."
                }
              }
            ],
            card_image: [
              {
                type: "image",
                name: "Card Image",
                props: {
                  alt: "News feature image",
                  title: "Feature announcement",
                  name: "card-image.jpg"
                }
              }
            ]
          },
          props: {
            card_link: {
              url: "/news/feature-announcement",
              linktype: "url"
            }
          }
        }
      ]
    }
  ]
};

export const complexAccordionLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Complex Accordion Layout",
  content: [
    {
      type: "page",
      name: "Complex Accordion Page",
      children: [
        {
          type: "section",
          name: "Documentation Section",
          children: [
            {
              type: "headline",
              name: "Section Title",
              parentNodeTypeName: "section",
              props: {
                content: "User Guide",
                title: "User Guide",
                headline: "User Guide",
                as: "h2"
              }
            },
            {
              type: "accordion",
              name: "Documentation Accordion",
              props: {
                type: "single",
                customClassname: "docs-accordion"
              },
              children: [
                {
                  type: "accordion-item",
                  name: "Getting Started",
                  slots: {
                    title: [
                      {
                        type: "headline",
                        name: "Title",
                        props: {
                          content: "Getting Started Guide",
                          title: "Getting Started Guide",
                          headline: "Getting Started Guide",
                          as: "h3"
                        }
                      }
                    ],
                    content: [
                      {
                        type: "headline",
                        name: "Step 1",
                        props: {
                          content: "Installation",
                          title: "Installation",
                          headline: "Installation",
                          as: "h4"
                        }
                      },
                      {
                        type: "text",
                        name: "Step 1 Text",
                        props: {
                          content: "First, install our application...",
                          text: "First, install our application..."
                        }
                      },
                      {
                        type: "image",
                        name: "Installation Screenshot",
                        props: {
                          alt: "Installation process",
                          name: "installation-screenshot.jpg"
                        }
                      },
                      {
                        type: "divider",
                        name: "Step Separator"
                      },
                      {
                        type: "headline",
                        name: "Step 2",
                        props: {
                          content: "Configuration",
                          title: "Configuration",
                          headline: "Configuration",
                          as: "h4"
                        }
                      },
                      {
                        type: "text",
                        name: "Step 2 Text",
                        props: {
                          content: "Next, configure your settings...",
                          text: "Next, configure your settings..."
                        }
                      }
                    ]
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

export const multipleCardsLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Multiple Cards Layout",
  content: [
    {
      type: "page",
      name: "Cards Page",
      children: [
        {
          type: "section",
          name: "Blog Section",
          children: [
            {
              type: "headline",
              name: "Section Title",
              parentNodeTypeName: "section",
              props: {
                content: "Latest Articles",
                title: "Latest Articles",
                headline: "Latest Articles",
                as: "h2"
              }
            },
            {
              type: "editorial-card",
              name: "Article 1",
              slots: {
                card_title: [
                  {
                    type: "headline",
                    name: "Title 1",
                    props: {
                      content: "Understanding TypeScript",
                      title: "Understanding TypeScript",
                      headline: "Understanding TypeScript"
                    }
                  }
                ],
                card_body: [
                  {
                    type: "text",
                    name: "Summary 1",
                    props: {
                      content: "A comprehensive guide to TypeScript...",
                      text: "A comprehensive guide to TypeScript..."
                    }
                  }
                ],
                card_image: [
                  {
                    type: "image",
                    name: "Image 1",
                    props: {
                      alt: "TypeScript logo",
                      name: "image-1.jpg"
                    }
                  }
                ]
              }
            },
            {
              type: "editorial-card",
              name: "Article 2",
              slots: {
                card_title: [
                  {
                    type: "headline",
                    name: "Title 2",
                    props: {
                      content: "React Best Practices",
                      title: "React Best Practices",
                      headline: "React Best Practices"
                    }
                  }
                ],
                card_body: [
                  {
                    type: "text",
                    name: "Summary 2",
                    props: {
                      content: "Learn the best practices for React development...",
                      text: "Learn the best practices for React development..."
                    }
                  }
                ],
                card_image: [
                  {
                    type: "image",
                    name: "Image 2",
                    props: {
                      alt: "React logo",
                      name: "image-2.jpg"
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  ]
};

export const blockquoteLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Blockquote Layout",
  content: [
    {
      type: "page",
      name: "Quote Page",
      children: [
        {
          type: "section",
          name: "Testimonials Section",
          children: [
            {
              type: "blockquote",
              name: "Customer Quote",
              props: {
                content: "This product has transformed our business operations.",
                quote: "This product has transformed our business operations.",
                text: "This product has transformed our business operations.",
                citation: "John Doe, CEO",
                author: "John Doe, CEO"
              }
            },
            {
              type: "divider",
              name: "Quote Separator"
            },
            {
              type: "blockquote",
              name: "Expert Quote",
              props: {
                content: "The most innovative solution in the market.",
                citation: "Tech Review Magazine"
              }
            }
          ]
        }
      ]
    }
  ]
};

export const tabsLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Tabs Layout",
  content: [
    {
      type: "page",
      name: "Tabs Page",
      children: [
        {
          type: "section",
          name: "Product Info Section",
          children: [
            {
              type: "tabs" as any,
              name: "Product Tabs",
              children: [
                {
                  type: "tab-item" as any,
                  name: "Overview Tab",
                  slots: {
                    label: [
                      {
                        type: "text",
                        name: "Tab Label",
                        props: {
                          content: "Overview",
                          text: "Overview"
                        }
                      }
                    ],
                    content: [
                      {
                        type: "headline",
                        name: "Overview Title",
                        props: {
                          content: "Product Overview",
                          title: "Product Overview",
                          headline: "Product Overview",
                          as: "h3"
                        }
                      },
                      {
                        type: "text",
                        name: "Overview Text",
                        props: {
                          content: "Our product is designed to...",
                          text: "Our product is designed to..."
                        }
                      }
                    ]
                  }
                },
                {
                  type: "tab-item" as any,
                  name: "Features Tab",
                  slots: {
                    label: [
                      {
                        type: "text",
                        name: "Tab Label",
                        props: {
                          content: "Features",
                          text: "Features"
                        }
                      }
                    ],
                    content: [
                      {
                        type: "headline",
                        name: "Features Title",
                        props: {
                          content: "Key Features",
                          title: "Key Features",
                          headline: "Key Features",
                          as: "h3"
                        }
                      },
                      {
                        type: "text",
                        name: "Features Text",
                        props: {
                          content: "Includes advanced capabilities...",
                          text: "Includes advanced capabilities..."
                        }
                      }
                    ]
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

export const multiSlotComponentLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Multi-Slot Component",
  content: [
    {
      type: "page",
      name: "Multi-Slot Page",
      children: [
        {
          type: "hero-banner" as any,
          name: "Homepage Hero",
          slots: {
            headline: [
              {
                type: "headline",
                name: "Hero Title",
                props: {
                  content: "Welcome to the Future",
                  title: "Welcome to the Future",
                  headline: "Welcome to the Future",
                  as: "h1"
                }
              }
            ],
            subheadline: [
              {
                type: "text",
                name: "Hero Subtitle",
                props: {
                  content: "Innovation starts here",
                  text: "Innovation starts here"
                }
              }
            ],
            media: [
              {
                type: "image",
                name: "Hero Background",
                props: {
                  alt: "Futuristic city skyline",
                  name: "hero-background.jpg"
                }
              }
            ],
            cta_primary: [
              {
                type: "button" as any,
                name: "Primary CTA",
                props: {
                  text: "Get Started",
                  link: "/signup"
                }
              }
            ],
            cta_secondary: [
              {
                type: "button" as any,
                name: "Secondary CTA",
                props: {
                  text: "Learn More",
                  link: "/about"
                }
              }
            ]
          }
        }
      ]
    }
  ]
};