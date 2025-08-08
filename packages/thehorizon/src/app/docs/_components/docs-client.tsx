"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface DocFile {
  path: string;
  name: string;
  category: string;
  package: string;
  content: string;
}

interface DocsClientProps {
  docs: DocFile[];
}

const categoryIcons = {
  overview: "📚",
  implemented: "✅",
  architecture: "🏗️",
  features: "⚡",
  guides: "📖",
  roadmap: "🚀",
};

const packageColors = {
  root: "bg-purple-100 text-purple-800",
  thegrid: "bg-blue-100 text-blue-800",
  thehorizon: "bg-green-100 text-green-800",
};

export default function DocsClient({ docs }: DocsClientProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocFile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter docs based on search and filters
  const filteredDocs = docs.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPackage =
      selectedPackage === "all" || doc.package === selectedPackage;
    const matchesCategory =
      selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesPackage && matchesCategory;
  });

  const handleDocSelect = (doc: DocFile) => {
    setSelectedDoc(doc);
  };

  if (selectedDoc) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setSelectedDoc(null)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documentation
          </Button>

          <div className="flex items-center gap-2 mb-4">
            <Badge
              className={
                packageColors[selectedDoc.package as keyof typeof packageColors]
              }
            >
              {selectedDoc.package}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {
                categoryIcons[
                  selectedDoc.category as keyof typeof categoryIcons
                ]
              }{" "}
              {selectedDoc.category}
            </span>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match;
                  return !isInline ? (
                    <SyntaxHighlighter
                      style={oneDark as any}
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
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold mb-6 text-foreground">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold mb-4 mt-8 text-foreground">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 text-muted-foreground leading-relaxed">
                    {children}
                  </p>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {selectedDoc.content}
            </ReactMarkdown>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📚 Documentation Center</h1>
        <p className="text-muted-foreground">
          Browse all documentation for the HQ platform in one place
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documentation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={selectedPackage} onValueChange={setSelectedPackage}>
          <TabsList>
            <TabsTrigger value="all">All Packages</TabsTrigger>
            <TabsTrigger value="root">🌐 Root</TabsTrigger>
            <TabsTrigger value="thegrid">🔧 TheGrid</TabsTrigger>
            <TabsTrigger value="thehorizon">🎨 TheHorizon</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap gap-2">
          {[
            "all",
            "overview",
            "implemented",
            "architecture",
            "features",
            "guides",
            "roadmap",
          ].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category === "all"
                ? "All Categories"
                : `${
                    categoryIcons[category as keyof typeof categoryIcons]
                  } ${category}`}
            </Button>
          ))}
        </div>
      </div>

      {/* Documentation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <Card
            key={doc.path}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleDocSelect(doc)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2 line-clamp-2">
                    {doc.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        packageColors[doc.package as keyof typeof packageColors]
                      }
                    >
                      {doc.package}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {
                        categoryIcons[
                          doc.category as keyof typeof categoryIcons
                        ]
                      }{" "}
                      {doc.category}
                    </span>
                  </div>
                </div>
                <FileText className="w-5 h-5 text-muted-foreground ml-2 flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {doc.path}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No documentation found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{docs.length}</div>
            <div className="text-sm text-muted-foreground">Total Docs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">
              {docs.filter((d) => d.package === "thegrid").length}
            </div>
            <div className="text-sm text-muted-foreground">Backend Docs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">
              {docs.filter((d) => d.package === "thehorizon").length}
            </div>
            <div className="text-sm text-muted-foreground">Frontend Docs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">
              {docs.filter((d) => d.category === "roadmap").length}
            </div>
            <div className="text-sm text-muted-foreground">Roadmap Items</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
