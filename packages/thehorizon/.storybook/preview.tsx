import type { Preview } from "@storybook/react";
import { themes } from "@storybook/theming";
import React, { useEffect } from "react";
import "../src/app/globals.css";

const ThemeDecorator = (Story: any, context: any) => {
  const theme = context.globals.theme || "dark";
  
  useEffect(() => {
    // Apply theme class to the Storybook preview iframe's root element
    const root = document.documentElement;
    const body = document.body;
    
    // Remove existing theme classes
    root.classList.remove("light", "dark");
    body.classList.remove("light", "dark");
    
    // Add new theme class
    root.classList.add(theme);
    body.classList.add(theme);
    
    // Also set the color scheme for native elements
    root.style.colorScheme = theme;
  }, [theme]);

  return (
    <div className={`${theme} antialiased`}>
      <div className="min-h-screen bg-background text-foreground p-6 transition-colors duration-200">
        <Story />
      </div>
    </div>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: themes.dark,
    },
    backgrounds: {
      disable: true, // We'll handle backgrounds with our theme system
    },
    nextjs: {
      appDirectory: true,
    },
    layout: "centered",
    options: {
      storySort: {
        order: [
          'AI Chat', [
            'A. Showcases',
            'B. Core ⭐', [
              'Primitives',
              'Disclosure',
              'Approval'
            ],
            'C. Presentational', [
              'Overview',
              'Layout',
              'Content',
              'UI'
            ],
            'D. Interactive', [
              'Overview',
              'Workflow',
              'Attachments',
              'Animations'
            ]
          ],
          'UI',
          'Example'
        ],
      },
    },
  },
  decorators: [ThemeDecorator],
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme for components",
      defaultValue: "dark",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;