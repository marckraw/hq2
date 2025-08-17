import type { Meta, StoryObj } from "@storybook/react";
import { 
  BreathingWrapper, 
  BreathingDot,
  AnimatedText,
  StreamingText,
  ThinkingDots,
  GlowEffect,
  StatusIndicator,
  ShimmerEffect
} from "./index";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatInput } from "../primitives/ChatInput";
import { ChatMessage } from "../primitives/ChatMessage";
import { AgentAvatar, DEFAULT_AGENTS } from "../ui/AgentAvatar";
import { useState } from "react";

const meta = {
  title: "AI Chat/Animations/All Effects",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Breathing Effects
export const BreathingEffects: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Breathing Wrapper</h3>
        <div className="flex gap-4">
          <BreathingWrapper intensity="subtle" type="scale">
            <Card className="p-4">
              <p>Subtle Scale</p>
            </Card>
          </BreathingWrapper>
          
          <BreathingWrapper intensity="normal" type="opacity">
            <Card className="p-4">
              <p>Normal Opacity</p>
            </Card>
          </BreathingWrapper>
          
          <BreathingWrapper intensity="intense" type="both">
            <Card className="p-4">
              <p>Intense Both</p>
            </Card>
          </BreathingWrapper>
          
          <BreathingWrapper intensity="normal" type="pulse">
            <Card className="p-4">
              <p>Pulse Effect</p>
            </Card>
          </BreathingWrapper>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Breathing with Glow</h3>
        <div className="flex gap-4">
          <BreathingWrapper withGlow glowColor="hsl(var(--primary))">
            <Button>Primary Glow</Button>
          </BreathingWrapper>
          
          <BreathingWrapper withGlow glowColor="hsl(200 100% 50%)">
            <Button variant="outline">Blue Glow</Button>
          </BreathingWrapper>
          
          <BreathingWrapper withGlow glowColor="hsl(120 100% 50%)" intensity="intense">
            <Button variant="secondary">Green Glow</Button>
          </BreathingWrapper>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Breathing Dots</h3>
        <div className="flex gap-4 items-center">
          <BreathingDot size="sm" />
          <BreathingDot size="md" />
          <BreathingDot size="lg" />
          <BreathingDot size="md" color="bg-green-500" />
          <BreathingDot size="md" color="bg-blue-500" />
        </div>
      </div>
    </div>
  ),
};

// Text Animations
export const TextAnimations: Story = {
  render: () => {
    const [key, setKey] = useState(0);
    
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Typewriter Effect</h3>
          <AnimatedText
            key={`typewriter-${key}`}
            text="Hello! I'm an AI assistant. How can I help you today?"
            type="typewriter"
            speed={30}
          />
          <Button size="sm" onClick={() => setKey(k => k + 1)}>Replay</Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Word by Word</h3>
          <AnimatedText
            key={`word-${key}`}
            text="This text appears word by word for a different effect."
            type="word-by-word"
            speed={50}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Fade In</h3>
          <AnimatedText
            key={`fade-${key}`}
            text="This text fades in smoothly."
            type="fade-in"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Slide Up</h3>
          <AnimatedText
            key={`slide-${key}`}
            text="This text slides up from below."
            type="slide-up"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Thinking Dots</h3>
          <div className="flex gap-4 items-center">
            <span>AI is thinking</span>
            <ThinkingDots size="sm" />
            <span>Processing</span>
            <ThinkingDots size="md" />
            <span>Loading</span>
            <ThinkingDots size="lg" />
          </div>
        </div>
      </div>
    );
  },
};

// Glow Effects
export const GlowEffects: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Static Glow</h3>
        <div className="flex gap-4">
          <GlowEffect intensity="subtle" size="sm">
            <Card className="p-4">Subtle Small</Card>
          </GlowEffect>
          
          <GlowEffect intensity="normal" size="md">
            <Card className="p-4">Normal Medium</Card>
          </GlowEffect>
          
          <GlowEffect intensity="intense" size="lg">
            <Card className="p-4">Intense Large</Card>
          </GlowEffect>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Animated Glow</h3>
        <div className="flex gap-4">
          <GlowEffect animate color="hsl(var(--primary))">
            <Button>Animated Primary</Button>
          </GlowEffect>
          
          <GlowEffect animate color="hsl(280 100% 60%)" intensity="intense">
            <Button variant="outline">Purple Pulse</Button>
          </GlowEffect>
          
          <GlowEffect animate shape="circle" color="hsl(45 100% 50%)">
            <AgentAvatar agent={DEFAULT_AGENTS.odin} size="lg" />
          </GlowEffect>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Status Indicators</h3>
        <div className="flex gap-6 items-center flex-wrap">
          <StatusIndicator text="Online" status="online" pulse />
          <StatusIndicator text="Processing" status="processing" pulse />
          <StatusIndicator text="Error" status="error" />
          <StatusIndicator text="AI Active" status="active" pulse />
          <StatusIndicator text="Idle" status="idle" />
        </div>
        <div className="flex gap-6 items-center flex-wrap">
          <StatusIndicator text="Small" status="online" size="sm" />
          <StatusIndicator text="Medium" status="processing" size="md" />
          <StatusIndicator text="Large" status="active" size="lg" />
        </div>
        <div className="flex gap-6 items-center flex-wrap">
          <StatusIndicator text="No Dot" status="online" showDot={false} />
          <StatusIndicator text="With Dot" status="processing" showDot={true} pulse />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Shimmer Loading</h3>
        <div className="space-y-2">
          <ShimmerEffect height="40px" />
          <ShimmerEffect height="60px" />
          <ShimmerEffect height="20px" width="200px" />
        </div>
      </div>
    </div>
  ),
};

// Combined Effects on Chat Components
export const AnimatedChatComponents: Story = {
  render: () => {
    const [isTyping, setIsTyping] = useState(false);
    const [message, setMessage] = useState("");
    
    return (
      <div className="space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Animated Chat Input</h3>
          <BreathingWrapper intensity="subtle" type="scale">
            <ChatInput
              placeholder="Ask me anything..."
              value={message}
              onChange={setMessage}
              onSubmit={() => {
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 3000);
              }}
            />
          </BreathingWrapper>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Animated Messages</h3>
          
          <ChatMessage
            role="user"
            content="Can you help me with React animations?"
            timestamp={new Date()}
          />

          {isTyping ? (
            <ChatMessage
              role="assistant"
              agent={DEFAULT_AGENTS.valkyrie}
              content={
                <span className="flex items-center gap-2">
                  <span>Thinking</span>
                  <ThinkingDots />
                </span>
              }
              timestamp={new Date()}
            />
          ) : (
            <ChatMessage
              role="assistant"
              agent={DEFAULT_AGENTS.valkyrie}
              content={
                <AnimatedText
                  text="Of course! React animations can be achieved through CSS transitions, animation libraries like Framer Motion, or custom hooks. What specific animation are you looking to create?"
                  type="typewriter"
                  speed={20}
                />
              }
              timestamp={new Date()}
              thinkingTime={1250}
            />
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Streaming Response</h3>
          <ChatMessage
            role="assistant"
            agent={DEFAULT_AGENTS.odin}
            content={
              <StreamingText
                fullText="I'm analyzing your architecture requirements. Based on your needs, I recommend implementing a microservices pattern with event-driven communication. This approach will provide better scalability and maintainability."
                isStreaming={true}
                speed={30}
              />
            }
            timestamp={new Date()}
            showAgentBadge
          />
        </div>
      </div>
    );
  },
};

// Interactive Playground
export const Playground: Story = {
  render: () => {
    const [breathingActive, setBreathingActive] = useState(true);
    const [glowActive, setGlowActive] = useState(true);
    const [textType, setTextType] = useState<"typewriter" | "fade-in" | "slide-up">("typewriter");
    
    return (
      <div className="space-y-8">
        <div className="flex gap-4">
          <Button
            variant={breathingActive ? "default" : "outline"}
            onClick={() => setBreathingActive(!breathingActive)}
          >
            Toggle Breathing
          </Button>
          <Button
            variant={glowActive ? "default" : "outline"}
            onClick={() => setGlowActive(!glowActive)}
          >
            Toggle Glow
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const types: Array<"typewriter" | "fade-in" | "slide-up"> = ["typewriter", "fade-in", "slide-up"];
              const current = types.indexOf(textType);
              setTextType(types[(current + 1) % types.length]);
            }}
          >
            Text: {textType}
          </Button>
        </div>

        <BreathingWrapper isActive={breathingActive} withGlow={glowActive}>
          <Card className="p-6 max-w-md">
            <AnimatedText
              key={`${textType}-${Date.now()}`}
              text="This is a demo of combined animation effects. Try toggling the controls above!"
              type={textType}
            />
          </Card>
        </BreathingWrapper>
      </div>
    );
  },
};