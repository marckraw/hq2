import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JsonViewer } from "@/components/ui/json-viewer";

interface MemoryDetailsProps {
  memory: {
    id: number;
    type: string;
    content: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
  };
}

export function MemoryDetails({ memory }: MemoryDetailsProps) {
  return (
    <div className="space-y-4 overflow-hidden w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Memory ID</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-xs break-all">{memory.id}</code>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="break-all">
              {memory.type}
            </Badge>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-xs break-all">
              {new Date(memory.createdAt).toLocaleString()}
            </code>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-xs break-all">
              {new Date(memory.updatedAt).toLocaleString()}
            </code>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] lg:max-h-[500px] overflow-y-auto">
            <div className="whitespace-pre-wrap text-sm break-words">
              {memory.content}
            </div>
          </div>
        </CardContent>
      </Card>

      {memory.tags && memory.tags.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {memory.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="break-all">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {memory.metadata && Object.keys(memory.metadata).length > 0 && (
        <Tabs defaultValue="metadata">
          <TabsList className="grid w-full grid-cols-1 dark:bg-slate-900">
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>
          <TabsContent value="metadata" className="mt-2">
            <Card className="overflow-hidden">
              <CardContent className="pt-4">
                <JsonViewer
                  data={memory.metadata}
                  collapsed={1}
                  maxHeight="500px"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
