import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Button } from "./button";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the card content. It can contain any elements.</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="mr-2">Cancel</Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  ),
};

export const SimpleCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Simple Card</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This card demonstrates theme switching. Try toggling between light and dark modes!
        </p>
      </CardContent>
    </Card>
  ),
};

export const WithCustomStyling: Story = {
  render: () => (
    <Card className="w-[350px] border-primary/20 shadow-lg">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-primary">Custom Styled Card</CardTitle>
        <CardDescription>With custom colors and styling</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <span className="text-sm text-green-600 dark:text-green-400">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Theme</span>
            <span className="text-sm text-muted-foreground">Responsive</span>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

export const MultipleCards: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Card 1</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">First card content</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Card 2</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Second card content</p>
        </CardContent>
      </Card>
    </div>
  ),
};