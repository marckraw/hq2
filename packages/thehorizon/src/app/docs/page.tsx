import fs from "fs";
import path from "path";
import DocsClient from "./_components/docs-client";

interface DocFile {
  path: string;
  name: string;
  category: string;
  package: string;
  content: string;
}

// Documentation structure mapping
const docStructure: Omit<DocFile, "content">[] = [
  {
    path: "docs/README.md",
    name: "Master Documentation Hub",
    category: "overview",
    package: "root",
  },
  {
    path: "docs/implemented/event-driven-architecture.md",
    name: "Event-Driven Architecture",
    category: "implemented",
    package: "root",
  },
  {
    path: "packages/thegrid/docs/README.md",
    name: "TheGrid Documentation",
    category: "overview",
    package: "thegrid",
  },
  {
    path: "packages/thegrid/docs/architecture/SERVICE_ARCHITECTURE.md",
    name: "Service Architecture",
    category: "architecture",
    package: "thegrid",
  },
  {
    path: "packages/thegrid/docs/features/QDRANT_MEMORY_GUIDE.md",
    name: "Memory System Guide",
    category: "features",
    package: "thegrid",
  },
  {
    path: "packages/thegrid/docs/features/LANGFUSE_TRACING_GUIDE.md",
    name: "Langfuse Tracing Guide",
    category: "features",
    package: "thegrid",
  },
  {
    path: "packages/thegrid/docs/guides/Prompt Engineer Techniques.md",
    name: "Prompt Engineering Techniques",
    category: "guides",
    package: "thegrid",
  },
  {
    path: "packages/thegrid/docs/roadmap/langfuse-integration-roadmap.md",
    name: "Langfuse Integration Roadmap",
    category: "roadmap",
    package: "thegrid",
  },
  {
    path: "packages/thehorizon/docs/README.md",
    name: "TheHorizon Documentation",
    category: "overview",
    package: "thehorizon",
  },
  {
    path: "packages/thehorizon/docs/state-management/README.md",
    name: "State Management Overview",
    category: "architecture",
    package: "thehorizon",
  },
  {
    path: "packages/thehorizon/docs/state-management/adding-new-atoms.md",
    name: "Adding New Atoms Guide",
    category: "guides",
    package: "thehorizon",
  },
  {
    path: "packages/thehorizon/docs/state-management/architecture.md",
    name: "State Architecture",
    category: "architecture",
    package: "thehorizon",
  },
  {
    path: "packages/thehorizon/docs/state-management/chat-state.md",
    name: "Chat State Management",
    category: "guides",
    package: "thehorizon",
  },
  {
    path: "packages/thehorizon/docs/state-management/global-state.md",
    name: "Global State Management",
    category: "guides",
    package: "thehorizon",
  },
  {
    path: "packages/thehorizon/docs/state-management/migration-guide.md",
    name: "State Migration Guide",
    category: "guides",
    package: "thehorizon",
  },
  {
    path: "packages/thehorizon/docs/features/streaming.md",
    name: "Streaming Features",
    category: "features",
    package: "thehorizon",
  },
];

// Server-side function to load all documentation
async function loadDocumentation(): Promise<DocFile[]> {
  const projectRoot = path.resolve(process.cwd(), "../..");
  const docsWithContent: DocFile[] = [];

  for (const doc of docStructure) {
    const fullPath = path.join(projectRoot, doc.path);

    try {
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        docsWithContent.push({
          ...doc,
          content,
        });
      } else {
        // File doesn't exist, add placeholder
        docsWithContent.push({
          ...doc,
          content: `# ${doc.name}\n\n❌ **File not found**: \`${doc.path}\`\n\nThis documentation file doesn't exist yet or has been moved.`,
        });
      }
    } catch (error) {
      console.error(`Error reading ${doc.path}:`, error);
      docsWithContent.push({
        ...doc,
        content: `# ${doc.name}\n\n⚠️ **Error reading file**: \`${doc.path}\`\n\nThere was an error reading this documentation file.`,
      });
    }
  }

  return docsWithContent;
}

// Server Component - runs on the server
export default async function DocsPage() {
  // Fetch data on the server
  const docs = await loadDocumentation();

  // Pass the data to the client component
  return <DocsClient docs={docs} />;
}
