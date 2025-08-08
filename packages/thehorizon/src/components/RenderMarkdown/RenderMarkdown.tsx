import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const isImageUrl = (str: string) => {
  // Remove whitespace and check if it's a URL
  const trimmed = str.trim();

  // Common image extensions pattern
  const imageExtensionsPattern = /\.(jpg|jpeg|png|gif|webp)($|\?)/i;

  // Check if it's a valid URL
  try {
    new URL(trimmed);
  } catch {
    return false;
  }

  // Check for specific patterns
  const isLeonardoAI =
    trimmed.includes("cdn.leonardo.ai") && imageExtensionsPattern.test(trimmed);
  const isOpenAI =
    trimmed.includes("oaidalleapiprodscus.blob.core.windows.net") &&
    trimmed.includes("/img-");
  const isHQS3Image =
    trimmed.includes("hq-ai-images.s3.") &&
    (imageExtensionsPattern.test(trimmed) || trimmed.includes("/images/"));
  const isCommonImage = /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)($|\?)/i.test(
    trimmed
  );

  return isLeonardoAI || isOpenAI || isHQS3Image || isCommonImage;
};

const ImageComponent = ({ src }: { src: string }) => (
  <div className="relative group my-4">
    <a href={src} target="_blank" rel="noopener noreferrer" className="block">
      <img
        src={src}
        alt="AI Generated Image"
        className="max-w-full h-auto rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity shadow-md"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          // Create a fallback element
          const fallback = document.createElement("div");
          fallback.className =
            "p-4 border border-red-200 rounded-lg bg-red-50 text-red-700 text-sm";
          fallback.textContent = `Failed to load image: ${src}`;
          e.currentTarget.parentNode?.insertBefore(fallback, e.currentTarget);
        }}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg pointer-events-none" />
    </a>
    <div className="mt-2 text-xs text-muted-foreground">
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        Click to open in new tab
      </a>
    </div>
  </div>
);

// Function to process text and extract image URLs
const processTextWithImages = (text: string) => {
  // Improved URL pattern that handles punctuation better
  // This pattern stops at common punctuation that's likely not part of the URL
  const urlPattern =
    /(https?:\/\/[^\s<>"{}|\\^`[\]()]+)(?:[^\s\w](?![^\s]*\.[a-z]{2,4}))?/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = urlPattern.exec(text)) !== null) {
    // Add text before the URL
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }

    // Clean the URL by removing trailing punctuation
    let url = match[1];
    // Remove trailing punctuation that's commonly not part of URLs
    url = url.replace(/[.,;:!?)\]}>'"]*$/, "");

    // Check if the cleaned URL is an image
    if (isImageUrl(url)) {
      parts.push({
        type: "image",
        content: url,
      });
    } else {
      parts.push({
        type: "link",
        content: url,
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return parts;
};

export const RenderMarkdown = ({ children }: { children: string }) => {
  // If the content is just an image URL, render it directly
  if (typeof children === "string" && isImageUrl(children.trim())) {
    return <ImageComponent src={children.trim()} />;
  }

  // Process the text to find and render inline images
  const processedParts = processTextWithImages(children);

  // If we found images in the text, render them specially
  if (processedParts.some((part) => part.type === "image")) {
    return (
      <div className="space-y-4">
        {processedParts.map((part, index) => {
          if (part.type === "image") {
            return <ImageComponent key={index} src={part.content} />;
          } else if (part.type === "link") {
            return (
              <a
                key={index}
                href={part.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline break-all"
              >
                {part.content}
              </a>
            );
          } else {
            // Render text content as markdown if it has markdown syntax
            if (
              part.content.includes("**") ||
              part.content.includes("*") ||
              part.content.includes("#") ||
              part.content.includes("`")
            ) {
              return (
                <div key={index}>
                  <ReactMarkdown
                    components={{
                      code({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={atomDark}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {part.content}
                  </ReactMarkdown>
                </div>
              );
            } else {
              // Plain text with line breaks preserved
              return (
                <div key={index} className="whitespace-pre-wrap">
                  {part.content}
                </div>
              );
            }
          }
        })}
      </div>
    );
  }

  // Fallback to regular markdown processing
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              style={atomDark}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        // Modify the paragraph component to handle images
        p: ({ children, ...props }) => {
          // Check if the child is an image
          const hasImg = React.Children.toArray(children).some(
            (child: any) =>
              child?.type === "img" ||
              (child?.props?.href && isImageUrl(child?.props?.href))
          );

          // If contains image, render without p wrapper
          if (hasImg) {
            return <>{children}</>;
          }

          // Otherwise render normal paragraph
          return <p {...props}>{children}</p>;
        },
        // Handle both images and links
        a({ node, href, children, ...props }: any) {
          // Check if the href is an image URL
          if (href && isImageUrl(href)) {
            return <ImageComponent src={href} />;
          }
          // Regular link handling
          return (
            <a href={href} {...props} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          );
        },
        // Handle direct image tags
        img({ node, src, alt, ...props }: any) {
          return <ImageComponent src={src} />;
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
};
