import type { IntermediateLayout } from '../../../schema.types';

/**
 * Test-specific fixtures for IRF to Storyblok transformation tests
 * These fixtures replace dynamically created test data from builder functions
 */

export const cacheTestLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Cache Test Layout",
  content: [
    {
      type: "page",
      name: "Cache Page",
      children: []
    }
  ]
};

export const optionsTestLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Options Test Layout",
  content: [
    {
      type: "page",
      name: "Options Page",
      children: [
        {
          type: "section",
          name: "Test Section",
          parentNodeTypeName: "page",
          children: []
        }
      ]
    }
  ]
};

export const globalVarsTestLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Global Vars Test",
  content: [
    {
      type: "page",
      name: "Test Page",
      children: []
    }
  ],
  globalVars: {
    styles: {
      primaryColor: "#007bff",
      fontFamily: "Arial, sans-serif"
    },
    customProperty: "custom value"
  }
};

export const dynamicListLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Dynamic List",
  content: [
    {
      type: "page",
      name: "Dynamic Page",
      children: [
        {
          type: "section",
          name: "Dynamic Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "list",
              name: "Dynamic List",
              parentNodeTypeName: "section",
              children: [
                {
                  type: "list-item",
                  name: "Item 1",
                  parentNodeTypeName: "list",
                  children: [
                    {
                      type: "headline",
                      name: "Title 1",
                      parentNodeTypeName: "list-item",
                      props: {
                        content: "Dynamic Item 1",
                        title: "Dynamic Item 1",
                        headline: "Dynamic Item 1"
                      }
                    },
                    {
                      type: "text",
                      name: "Text 1",
                      parentNodeTypeName: "list-item",
                      props: {
                        content: "Description for item 1",
                        text: "Description for item 1"
                      }
                    }
                  ]
                },
                {
                  type: "list-item",
                  name: "Item 2",
                  parentNodeTypeName: "list",
                  children: [
                    {
                      type: "headline",
                      name: "Title 2",
                      parentNodeTypeName: "list-item",
                      props: {
                        content: "Dynamic Item 2",
                        title: "Dynamic Item 2",
                        headline: "Dynamic Item 2"
                      }
                    },
                    {
                      type: "text",
                      name: "Text 2",
                      parentNodeTypeName: "list-item",
                      props: {
                        content: "Description for item 2",
                        text: "Description for item 2"
                      }
                    }
                  ]
                },
                {
                  type: "list-item",
                  name: "Item 3",
                  parentNodeTypeName: "list",
                  children: [
                    {
                      type: "headline",
                      name: "Title 3",
                      parentNodeTypeName: "list-item",
                      props: {
                        content: "Dynamic Item 3",
                        title: "Dynamic Item 3",
                        headline: "Dynamic Item 3"
                      }
                    },
                    {
                      type: "text",
                      name: "Text 3",
                      parentNodeTypeName: "list-item",
                      props: {
                        content: "Description for item 3",
                        text: "Description for item 3"
                      }
                    }
                  ]
                },
                {
                  type: "list-item",
                  name: "Item 4",
                  parentNodeTypeName: "list",
                  children: [
                    {
                      type: "headline",
                      name: "Title 4",
                      parentNodeTypeName: "list-item",
                      props: {
                        content: "Dynamic Item 4",
                        title: "Dynamic Item 4",
                        headline: "Dynamic Item 4"
                      }
                    },
                    {
                      type: "text",
                      name: "Text 4",
                      parentNodeTypeName: "list-item",
                      props: {
                        content: "Description for item 4",
                        text: "Description for item 4"
                      }
                    }
                  ]
                },
                {
                  type: "list-item",
                  name: "Item 5",
                  parentNodeTypeName: "list",
                  children: [
                    {
                      type: "headline",
                      name: "Title 5",
                      parentNodeTypeName: "list-item",
                      props: {
                        content: "Dynamic Item 5",
                        title: "Dynamic Item 5",
                        headline: "Dynamic Item 5"
                      }
                    },
                    {
                      type: "text",
                      name: "Text 5",
                      parentNodeTypeName: "list-item",
                      props: {
                        content: "Description for item 5",
                        text: "Description for item 5"
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