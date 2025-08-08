"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import {
  useState,
  useCallback,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Sparkles,
  FileText,
  Search,
  Code,
  Languages,
  RotateCcw,
  Eye,
} from "lucide-react";
import { usePromptSnippets } from "@/hooks/usePromptSnippets";
import { useSettings } from "@/app/settings/_hooks/useSettings";

// Simple suggestion item type
export interface SuggestionItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  insertText?: string;
}

// Default @ mention suggestions (like commands)
const defaultSuggestions: SuggestionItem[] = [
  {
    id: "review", // Unique ID
    title: "review", // What shows as @review
    description: "Review code or content", // Dropdown description
    icon: <Eye className="h-4 w-4" />, // Icon (import from lucide-react)
    insertText: "Please review the following:", // What gets sent to AI
  },
  {
    id: "summarize",
    title: "summarize",
    description: "Summarize the conversation",
    icon: <Sparkles className="h-4 w-4" />,
    insertText: "Please summarize the conversation so far.",
  },
  {
    id: "explain",
    title: "explain",
    description: "Explain a concept in detail",
    icon: <FileText className="h-4 w-4" />,
    insertText: "Please explain",
  },
  {
    id: "translate",
    title: "translate",
    description: "Translate text to another language",
    icon: <Languages className="h-4 w-4" />,
    insertText: "Please translate this to",
  },
  {
    id: "code",
    title: "code",
    description: "Generate code",
    icon: <Code className="h-4 w-4" />,
    insertText: "Please write code for",
  },
  {
    id: "improve",
    title: "improve",
    description: "Improve existing content",
    icon: <RotateCcw className="h-4 w-4" />,
    insertText: "Please improve the following:",
  },
  {
    id: "search",
    title: "search",
    description: "Search for information",
    icon: <Search className="h-4 w-4" />,
    insertText: "Please search for information about",
  },
];

// Suggestion list component
const SuggestionList = forwardRef<
  { onKeyDown: (event: KeyboardEvent) => boolean },
  {
    items: SuggestionItem[];
    command: (item: SuggestionItem) => void;
  }
>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const selectItem = useCallback(
    (index: number) => {
      const item = props.items[index];
      if (item) {
        props.command(item);
      }
    },
    [props]
  );

  const upHandler = useCallback(() => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  }, [selectedIndex, props.items.length]);

  const downHandler = useCallback(() => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  }, [selectedIndex, props.items.length]);

  const enterHandler = useCallback(() => {
    selectItem(selectedIndex);
  }, [selectedIndex, selectItem]);

  useEffect(() => setSelectedIndex(0), [props.items]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = itemRefs.current[selectedIndex];
    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: "auto",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ key }: KeyboardEvent) => {
      if (key === "ArrowUp") {
        upHandler();
        return true;
      }
      if (key === "ArrowDown") {
        downHandler();
        return true;
      }
      if (key === "Enter") {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  return (
    <Card className="border shadow-lg p-2 max-w-sm max-h-64 overflow-hidden">
      <Command>
        <CommandList className="max-h-56 overflow-y-auto">
          {props.items.length === 0 ? (
            <CommandEmpty>No results found.</CommandEmpty>
          ) : (
            <CommandGroup>
              {props.items.map((item, index) => (
                <CommandItem
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  value={item.title}
                  onSelect={() => selectItem(index)}
                  className={`flex items-center gap-2 cursor-pointer ${
                    index === selectedIndex ? "bg-accent" : ""
                  }`}
                >
                  {item.icon}
                  <div className="flex flex-col">
                    <span className="font-medium">{item.title}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </Card>
  );
});

SuggestionList.displayName = "SuggestionList";

// Enhanced Editor Props
interface EnhancedEditorProps {
  placeholder?: string;
  onSubmit?: (content: string) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  disabled?: boolean;
  className?: string;
}

export interface EnhancedEditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  focus: () => void;
  clear: () => void;
}

export const EnhancedEditor = forwardRef<
  EnhancedEditorRef,
  EnhancedEditorProps
>(
  (
    {
      placeholder = "Type @ for AI prompts...",
      onSubmit,
      onKeyDown,
      disabled = false,
      className = "",
    },
    ref
  ) => {
    const { snippets } = usePromptSnippets();
    const { settings } = useSettings();
    const enabledIds = settings.interface?.enabledSnippets || [];
    const snippetSuggestions = useMemo(
      () =>
        snippets
          .filter((s) =>
            enabledIds.length === 0 ? true : enabledIds.includes(s.id)
          )
          .map((s) => ({
            id: s.title,
            title: s.title,
            description: s.description,
            icon: <FileText className="h-4 w-4" />,
            insertText: s.insertText,
          })),
      [snippets, enabledIds]
    );

    const suggestions = useMemo(
      () => [...defaultSuggestions, ...snippetSuggestions],
      [snippetSuggestions]
    );

    // Use a ref to pass the latest suggestions to the mention extension
    // This avoids re-creating the extension and causing an infinite loop
    const suggestionsRef = useRef(suggestions);
    useEffect(() => {
      suggestionsRef.current = suggestions;
    }, [suggestions]);

    // Simple mention configuration - memoized to prevent recreation
    const mentionExtension = useMemo(() => {
      return Mention.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            insertText: {
              default: null,
              parseHTML: (element) => element.getAttribute("data-insert-text"),
              renderHTML: (attributes) => {
                if (!attributes.insertText) {
                  return {};
                }
                return {
                  "data-insert-text": attributes.insertText,
                };
              },
            },
          };
        },
      }).configure({
        HTMLAttributes: {
          class:
            "mention bg-blue-100 hover:bg-blue-200 text-blue-800 px-1 rounded cursor-pointer transition-colors font-medium mx-0.5",
        },
        renderText({ options, node }) {
          // Show just @title instead of expanded text
          return `@${node.attrs.label || node.attrs.id}`;
        },
        renderHTML({ node }) {
          // Debug what's stored in the node
          console.log("Rendering mention node:", node.attrs);

          // Use the stored insertText, fallback to label or id
          const fullText =
            node.attrs.insertText || node.attrs.label || node.attrs.id;
          const displayText = "@" + (node.attrs.label || node.attrs.id);

          console.log(
            "Rendering with fullText:",
            fullText,
            "displayText:",
            displayText
          );

          return [
            "span",
            {
              class:
                "mention bg-blue-100 hover:bg-blue-200 text-blue-800 px-1 rounded cursor-pointer transition-colors font-medium mx-0.5",
              "data-type": "mention",
              "data-id": node.attrs.id,
              "data-insert-text": node.attrs.insertText || "", // Store in data attribute too
              "data-tooltip": fullText,
              title: fullText, // Keep as fallback
            },
            displayText,
          ];
        },
        suggestion: {
          char: "@",
          items: ({ query }: { query: string }) => {
            return suggestionsRef.current.filter(
              (item) =>
                item.title.toLowerCase().includes(query.toLowerCase()) ||
                item.description?.toLowerCase().includes(query.toLowerCase())
            );
          },
          render: () => {
            let reactRenderer: ReactRenderer;
            let popup: any;

            return {
              onStart: (props: any) => {
                reactRenderer = new ReactRenderer(SuggestionList, {
                  props,
                  editor: props.editor,
                });

                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: reactRenderer.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                });
              },
              onUpdate(props: any) {
                reactRenderer.updateProps(props);

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                });
              },
              onKeyDown(props: any) {
                if (props.event.key === "Escape") {
                  popup[0].hide();
                  return true;
                }
                // Simple handling - let suggestion component handle navigation
                // @ts-ignore - TipTap ReactRenderer ref typing issue
                const hasOnKeyDown = reactRenderer.ref?.onKeyDown;
                return hasOnKeyDown ? hasOnKeyDown(props.event) : false;
              },
              onExit() {
                popup[0].destroy();
                reactRenderer.destroy();
              },
            };
          },
          command: ({ editor, range, props }: any) => {
            // Debug what we're receiving
            console.log("Command props:", props);
            console.log("Suggestion item:", {
              id: props.id,
              title: props.title,
              insertText: props.insertText,
            });

            // Insert mention node with both display text and full text stored
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertContent({
                type: "mention",
                attrs: {
                  id: props.id,
                  label: props.title,
                  insertText: props.insertText, // This should be "Please explain "
                },
              })
              .run();
          },
        },
      });
    }, []);

    const editor = useEditor(
      {
        extensions: [
          StarterKit.configure({
            paragraph: {
              HTMLAttributes: {
                class: "text-sm",
              },
            },
          }),
          Placeholder.configure({
            placeholder,
          }),
          // Single mention extension
          mentionExtension,
        ],
        content: "",
        editable: !disabled,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
          // Handle content updates if needed
        },
      },
      [mentionExtension, placeholder, disabled]
    );

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getContent: () => {
        console.log(
          "getContent called from useImperativeHandle on EnhancedEditor"
        );
        if (!editor) return "";

        // First, let's debug by getting both text and JSON
        const plainText = editor.getText();
        const json = editor.getJSON();

        console.log("Plain text:", plainText);
        console.log("JSON structure:", json);

        // Simple approach: replace mentions in the HTML content
        const html = editor.getHTML();
        console.log("HTML:", html);

        // Extract mentions from HTML and replace them with expanded text
        let expandedText = plainText;

        // Find all mention spans and replace them
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        const mentionSpans = tempDiv.querySelectorAll("[data-type='mention']");

        mentionSpans.forEach((span) => {
          const title = span.getAttribute("title");
          const displayText = span.textContent || "";
          if (title && displayText) {
            expandedText = expandedText.replace(displayText, title);
          }
        });

        console.log("Expanded text:", expandedText);
        return expandedText;
      },
      setContent: (content: string) => {
        editor?.commands.setContent(content);
      },
      focus: () => {
        editor?.commands.focus();
      },
      clear: () => {
        editor?.commands.clearContent();
      },
    }));

    // Create a ref to access our own getContent method
    const editorRef = useRef<EnhancedEditorRef>(null);

    // Update the ref
    useEffect(() => {
      if (editorRef.current) {
        editorRef.current.getContent = () => {
          if (!editor) return "";
          const plainText = editor.getText();
          const html = editor.getHTML();
          let expandedText = plainText;
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = html;
          const mentionSpans = tempDiv.querySelectorAll(
            "[data-type='mention']"
          );
          mentionSpans.forEach((span) => {
            const title = span.getAttribute("title");
            const displayText = span.textContent || "";
            if (title && displayText) {
              expandedText = expandedText.replace(displayText, title);
            }
          });
          return expandedText;
        };
      }
    }, [editor]);

    // Handle keyboard shortcuts and setup shadcn tooltips
    useEffect(() => {
      if (!editor) return;

      // Setup shadcn tooltips for mentions using React portals
      const setupShadcnTooltips = () => {
        const mentionElements = editor.view.dom.querySelectorAll(
          "[data-type='mention']"
        );
        mentionElements.forEach((element) => {
          const tooltipText =
            element.getAttribute("data-tooltip") ||
            element.getAttribute("title");
          if (tooltipText && !element.hasAttribute("data-shadcn-tooltip")) {
            // Mark as processed
            element.setAttribute("data-shadcn-tooltip", "true");

            // Remove native title to avoid double tooltips
            element.removeAttribute("title");

            // Add better tooltip with faster display
            (element as HTMLElement).style.setProperty(
              "--tooltip-delay",
              "100ms"
            );

            // Use CSS tooltip approach for editor mentions
            element.setAttribute("data-tooltip-text", tooltipText);

            // Add click event for instant tooltip toggle
            element.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();

              // Hide all other tooltips first
              document
                .querySelectorAll(".mention.show-tooltip")
                .forEach((el) => {
                  if (el !== element) {
                    el.classList.remove("show-tooltip");
                  }
                });

              // Toggle this tooltip
              element.classList.toggle("show-tooltip");
            });

            // Hide tooltip when clicking elsewhere
            document.addEventListener("click", (e) => {
              if (!element.contains(e.target as Node)) {
                element.classList.remove("show-tooltip");
              }
            });
          }
        });
      };

      // Setup tooltips after content changes
      const observer = new MutationObserver(() => {
        // Debounce to avoid excessive calls
        setTimeout(setupShadcnTooltips, 50);
      });

      observer.observe(editor.view.dom, {
        childList: true,
        subtree: true,
      });

      // Initial tooltip setup
      setTimeout(setupShadcnTooltips, 100);

      const handleKeyDown = (event: KeyboardEvent) => {
        // Only handle Enter if we're not in a suggestion popup
        if (event.key === "Enter" && !event.shiftKey) {
          // Check if there's an active suggestion popup
          const suggestionPopup = document.querySelector("[data-tippy-root]");
          if (suggestionPopup) {
            // Let the suggestion handle it
            return;
          }

          // Prevent the default behavior and propagation
          event.preventDefault();
          event.stopPropagation();

          // Use our custom expansion logic
          const plainText = editor.getText();
          const html = editor.getHTML();
          let expandedText = plainText;

          console.log("Original text:", plainText);
          console.log("HTML:", html);

          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = html;
          const mentionSpans = tempDiv.querySelectorAll(
            "[data-type='mention']"
          );

          console.log("Found mentions:", mentionSpans.length);

          mentionSpans.forEach((span) => {
            const insertText = span.getAttribute("data-insert-text");
            const tooltipText = span.getAttribute("data-tooltip");
            const titleText = span.getAttribute("title");
            const displayText = span.textContent || "";

            console.log("Mention details:", {
              displayText,
              insertText,
              tooltipText,
              titleText,
            });

            // Use data-insert-text first, then data-tooltip, then title as fallback
            const replacementText = insertText || tooltipText || titleText;

            if (replacementText && displayText) {
              console.log("Replacing:", displayText, "with:", replacementText);
              expandedText = expandedText.replace(displayText, replacementText);
            }
          });

          console.log("Final expanded text:", expandedText);

          if (expandedText.trim() && onSubmit) {
            onSubmit(expandedText);
            editor.commands.clearContent();
          }
          return;
        }

        if (onKeyDown) {
          onKeyDown(event as any);
        }
      };

      const editorElement = editor.view.dom;
      editorElement.addEventListener("keydown", handleKeyDown, true); // Use capture phase

      return () => {
        observer.disconnect();
        editorElement.removeEventListener("keydown", handleKeyDown, true);
      };
    }, [editor, onSubmit, onKeyDown]);

    if (!editor) {
      return null;
    }

    return (
      <TooltipProvider delayDuration={100}>
        <div className={`enhanced-editor ${className}`}>
          <style>{`
            .enhanced-editor .mention[data-tooltip-text].show-tooltip::after {
              content: attr(data-tooltip-text);
              position: absolute;
              z-index: 50;
              background: hsl(var(--primary));
              color: hsl(var(--primary-foreground));
              padding: 0.375rem 0.75rem;
              border-radius: 0.375rem;
              font-size: 0.75rem;
              line-height: 1rem;
              white-space: nowrap;
              transform: translateY(-100%);
              margin-top: -0.25rem;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
              pointer-events: none;
              animation: none;
              opacity: 1;
            }

            .enhanced-editor .mention[data-tooltip-text] {
              position: relative;
              cursor: pointer;
              border: 1px solid rgb(147 197 253);
            }

            .enhanced-editor .mention[data-tooltip-text]:hover {
              z-index: 40;
              background-color: rgb(191 219 254);
              border-color: rgb(59 130 246);
            }
          `}</style>
          <EditorContent
            editor={editor}
            className="min-h-[60px] max-h-32 p-3 text-sm focus-within:outline-none"
          />
        </div>
      </TooltipProvider>
    );
  }
);

EnhancedEditor.displayName = "EnhancedEditor";

// Utility function to reverse-transform expanded text back to mention format for conversation display
export const transformTextToMentions = (
  text: string,
  MentionComponent?: ({
    mention,
    fullText,
  }: {
    mention: string;
    fullText: string;
  }) => React.ReactNode,
  suggestions: SuggestionItem[] = defaultSuggestions
): React.ReactNode => {
  const mentionMap: Record<string, string> = {};
  suggestions.forEach((suggestion) => {
    if (suggestion.insertText) {
      mentionMap[suggestion.insertText] = `@${suggestion.title}`;
    }
  });

  let currentText = text;
  const elements: React.ReactNode[] = [];
  let processedLength = 0;

  // Process each mention replacement
  Object.entries(mentionMap).forEach(([expandedText, mention]) => {
    const index = currentText.indexOf(expandedText);
    if (index !== -1) {
      // Add text before the mention
      if (index > 0) {
        const beforeText = currentText.slice(0, index);
        if (beforeText.trim()) {
          elements.push(
            <span key={`text-before-${mention}`}>{beforeText}</span>
          );
        }
      }

      // Add the mention with tooltip
      if (MentionComponent) {
        elements.push(
          <span key={`mention-${mention}`}>
            <MentionComponent
              mention={mention}
              fullText={expandedText.trim()}
            />
          </span>
        );
      } else {
        // Fallback to simple span with title
        elements.push(
          <span
            key={`mention-${mention}`}
            className="mention bg-blue-100 text-blue-800 px-1 rounded cursor-help transition-colors hover:bg-blue-200 relative"
            title={expandedText.trim()}
          >
            {mention}
          </span>
        );
      }

      // Update currentText to the remaining part after the mention
      currentText = currentText.slice(index + expandedText.length);
      processedLength += index + expandedText.length;
    }
  });

  // Add any remaining text
  if (currentText.trim()) {
    elements.push(<span key="text-after">{currentText}</span>);
  }

  // If no mentions were found, return original text
  return elements.length > 0 ? <>{elements}</> : text;
};
