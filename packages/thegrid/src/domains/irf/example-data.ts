export const exampleData = {
  story: {
    name: "test-editing-capabilities-of-ai",
    created_at: "2025-06-19T08:51:03.038Z",
    published_at: "2025-06-19T20:17:02.418Z",
    updated_at: "2025-06-19T20:17:02.429Z",
    id: 689836308,
    uuid: "521bd9e4-7d1b-4bea-b815-a8938603cf78",
    content: {
      _uid: "32224e15-9eb8-4fa0-9206-3db399668b97",
      body: [
        {
          _uid: "956b4be3-ce80-4f13-852c-981f2050f435",
          name: "",
          design: {
            fields: {
              gap: { type: "option", values: { s: "" } },
              spacing: {
                type: "custom",
                values: { s: { pb: "xxl", pt: "xxl" } },
                field_type: "backpack-spacing",
              },
              text_color: {
                type: "custom",
                values: {},
                field_type: "backpack-color-picker",
              },
              transition: {
                type: "custom",
                values: {
                  s: {
                    config: { effect: "fade", triggerOnce: true },
                    enabled: "disabled",
                    classNames: {
                      after: "afterTransition",
                      before: "beforeTransition",
                    },
                    transitionConfig: {
                      easing: "--motion-system-easing-expressive",
                      stagger: 0.015,
                      duration: "--motion-system-duration-medium",
                      transitionProperty: "opacity, transform",
                    },
                  },
                },
                field_type: "backpack-transition",
              },
              visibility: {
                type: "custom",
                values: {},
                field_type: "backpack-toggle",
              },
              rounded_top: { type: "boolean", values: { s: false } },
              aspect_ratio: { type: "option", values: {} },
              minimum_height: { type: "number", values: {} },
              rounded_bottom: { type: "boolean", values: { s: false } },
              background_color: {
                type: "custom",
                values: {},
                field_type: "backpack-color-picker",
              },
              inner_shadow_top: { type: "boolean", values: { s: false } },
              inner_shadow_bottom: { type: "boolean", values: { s: false } },
            },
            plugin: "backpack-breakpoints",
            version: "2.5.2",
          },
          content: [
            {
              as: "h2",
              _uid: "0a9e8f52-202e-4195-adf6-70e5d77603fa",
              design: {
                fields: {
                  order: { type: "number", values: {} },
                  spacing: {
                    type: "custom",
                    values: { s: { pl: "s", pr: "s" } },
                    field_type: "backpack-spacing",
                  },
                  variant: { type: "option", values: { s: "header2" } },
                  position: {
                    type: "custom",
                    values: { s: { x: [1, 5] } },
                    field_type: "backpack-layout",
                  },
                  text_align: {
                    type: "custom",
                    values: { s: "start" },
                    field_type: "backpack-toggle",
                  },
                  text_color: {
                    type: "custom",
                    values: {
                      s: {
                        selected: {
                          id: 11388533,
                          name: "Brand/Hello Pink",
                          value: "#FF329B",
                          dimension_value: null,
                        },
                      },
                    },
                    field_type: "backpack-color-picker",
                  },
                  visibility: {
                    type: "custom",
                    values: {},
                    field_type: "backpack-toggle",
                  },
                  transitionsOnEnter: { type: "boolean", values: {} },
                },
                plugin: "backpack-breakpoints",
                version: "2.5.2",
              },
              content: "This is the headline",
              component: "sb-headline-section",
              custom_classname: "",
            },
            {
              _uid: "ce85dce8-d9b0-47fd-b8cb-28f01bab1de0",
              design: {
                fields: {
                  order: { type: "number", values: {} },
                  spacing: {
                    type: "custom",
                    values: { s: { pl: "s", pr: "s" } },
                    field_type: "backpack-spacing",
                  },
                  variant: { type: "option", values: { s: "body" } },
                  position: {
                    type: "custom",
                    values: { s: { x: [1, 5] } },
                    field_type: "backpack-layout",
                  },
                  text_align: {
                    type: "custom",
                    values: { s: "start" },
                    field_type: "backpack-toggle",
                  },
                  text_color: {
                    type: "custom",
                    values: {},
                    field_type: "backpack-color-picker",
                  },
                  visibility: {
                    type: "custom",
                    values: {},
                    field_type: "backpack-toggle",
                  },
                  link_text_color: {
                    type: "custom",
                    values: {},
                    field_type: "backpack-color-picker",
                  },
                  transitionsOnEnter: { type: "boolean", values: {} },
                  link_text_hover_color: {
                    type: "custom",
                    values: {},
                    field_type: "backpack-color-picker",
                  },
                },
                plugin: "backpack-breakpoints",
                version: "2.5.2",
              },
              content: {
                type: "doc",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse sit amet libero nec dolor scelerisque iaculis. Vivamus fringilla risus ac lorem aliquam, non tempor quam feugiat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod sodales tellus, quis gravida ligula malesuada non. Sed sed ultricies ante, non consequat risus. Proin tincidunt, dolor feugiat consectetur vulputate, arcu velit blandit erat, sit amet finibus augue orci a lacus. Nunc eu erat tempor, egestas augue id, congue mauris. Vivamus est diam, tristique vel mollis eget, lacinia at metus. Quisque sit amet blandit nisl. Integer convallis velit in gravida hendrerit.",
                        type: "text",
                      },
                    ],
                  },
                ],
              },
              component: "sb-text-section",
              custom_classname: "",
            },
          ],
          component: "sb-section",
          backpack_ai: "",
          custom_classname: "",
        },
      ],
      no_index: false,
      canonical: {
        id: "",
        url: "",
        linktype: "story",
        fieldtype: "multilink",
        cached_url: "",
      },
      component: "page",
      no_follow: false,
      seo_meta_fields: "",
      structured_data: "",
      background_color: {
        _uid: "4ac687dd-4a5d-4ab7-a243-f3df0621fdf2",
        title: "Standalone Backpack Color Picker",
        plugin: "backpack-color-picker",
        selected: { name: "", value: "" },
        description: "Standalone Backpack Color Picker",
      },
    },
    slug: "test-editing-capabilities-of-ai",
    full_slug: "en/test-editing-capabilities-of-ai",
    sort_by_date: null,
    position: -800,
    tag_list: [],
    is_startpage: false,
    parent_id: 594864268,
    meta_data: null,
    group_id: "569fc6ce-4581-498a-830b-64aa1efd41a9",
    first_published_at: "2025-06-19T08:51:47.314Z",
    release_id: null,
    lang: "default",
    path: null,
    alternates: [],
    default_full_slug: null,
    translated_slugs: null,
  },
  cv: 1750364222,
  rels: [],
  links: [],
};
