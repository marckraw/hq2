import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JsonViewer } from "@/components/ui/json-viewer";

interface SignalDetailsProps {
  signal: {
    id: string;
    timestamp: string;
    source: string;
    type: string;
    payload: any;
    metadata: Record<string, unknown> | null;
  };
}

export function SignalDetails({ signal }: SignalDetailsProps) {
  return (
    <div className="space-y-4 overflow-hidden w-full max-w-[800px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Signal ID</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-xs break-all">{signal.id}</code>
          </CardContent>
        </Card>
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Timestamp</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-xs break-all">
              {new Date(signal.timestamp).toLocaleString()}
            </code>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Source</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="break-all">
              {signal.source}
            </Badge>
          </CardContent>
        </Card>
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="break-all">
              {signal.type}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payload">
        <TabsList className="grid w-full grid-cols-2 dark:bg-slate-900">
          <TabsTrigger value="payload">Payload</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>
        <TabsContent value="payload" className="mt-2">
          <Card className="overflow-hidden">
            <CardContent className="pt-4">
              <JsonViewer
                data={signal.payload}
                collapsed={1}
                maxHeight="500px"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="metadata" className="mt-2">
          <Card className="overflow-hidden">
            <CardContent className="pt-4">
              {signal.metadata ? (
                <JsonViewer
                  data={signal.metadata}
                  collapsed={1}
                  maxHeight="500px"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No metadata available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
