import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { RenderMarkdown } from "@/components/RenderMarkdown/RenderMarkdown";
import { JsonViewer } from "@/components/ui/json-viewer";

interface ChangelogDetailsProps {
  changelog: {
    id: string;
    repoOwner: string;
    repoName: string;
    prNumber: string;
    title: string;
    summary: string;
    commits: any[];
    releaseDate: string;
    createdAt: string;
    published: boolean;
  };
}

export function ChangelogDetails({ changelog }: ChangelogDetailsProps) {
  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return String(data);
    }
  };

  const formatCommitMessage = (commit: any) => {
    const author = commit.commit.author?.name || "Unknown";
    const date = commit.commit.author?.date
      ? new Date(commit.commit.author.date).toLocaleString()
      : "Unknown date";

    return `${commit.commit.message} (by ${author} on ${date})`;
  };

  const processMarkdownText = (text: string) => {
    if (!text) return "No summary available";

    // Replace literal \n with actual line breaks
    return (
      text
        .replace(/\\n/g, "\n")
        // Replace literal \t with spaces
        .replace(/\\t/g, "  ")
        // Unescape other common escape sequences
        .replace(/\\([\\'"'])/g, "$1")
    );
  };

  const prUrl = `https://github.com/${changelog.repoOwner}/${changelog.repoName}/pull/${changelog.prNumber}`;

  return (
    <div className="space-y-4 overflow-hidden w-full max-w-[800px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Repository</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="break-all">
              {changelog.repoOwner}/{changelog.repoName}
            </Badge>
          </CardContent>
        </Card>
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pull Request</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Badge variant="secondary" className="break-all">
              #{changelog.prNumber}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 shrink-0"
              asChild
            >
              <a href={prUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Release Date</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-xs break-all">
              {new Date(changelog.releaseDate).toLocaleString()}
            </code>
          </CardContent>
        </Card>
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={changelog.published ? "default" : "outline"}
              className="break-all"
            >
              {changelog.published ? "Published" : "Draft"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Title</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm break-words">{changelog.title}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary">
        <TabsList className="grid w-full grid-cols-3 dark:bg-slate-900">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="commits">Commits</TabsTrigger>
          <TabsTrigger value="raw-data">Raw Data</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="mt-2">
          <Card className="overflow-hidden">
            <CardContent className="pt-4">
              <div className="max-h-[400px] lg:max-h-[500px] overflow-y-auto">
                <div className="prose prose-sm dark:prose-invert max-w-none p-2">
                  <RenderMarkdown>
                    {processMarkdownText(changelog.summary)}
                  </RenderMarkdown>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="commits" className="mt-2">
          <Card className="overflow-hidden">
            <CardContent className="pt-4">
              {changelog.commits && changelog.commits.length > 0 ? (
                <div className="max-h-[400px] lg:max-h-[500px] overflow-y-auto">
                  <ul className="space-y-2 text-sm p-2">
                    {changelog.commits.map((commit, index) => (
                      <li
                        key={index}
                        className="border-b pb-2 last:border-b-0 break-words"
                      >
                        {formatCommitMessage(commit)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No commits available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="raw-data" className="mt-2">
          <Card className="overflow-hidden">
            <CardContent className="pt-4">
              <JsonViewer data={changelog} collapsed={1} maxHeight="500px" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
