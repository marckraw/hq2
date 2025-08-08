import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignalsTable } from "./_components/signals-table";
import { ChangelogsTable } from "./_components/changelogs-table";
import { MemoriesTable } from "./_components/memories-table";
import { PipelinesTable } from "./_components/pipelines-table";
import { StoryblokComponentsTable } from "./_components/storyblok-components-table";

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <Tabs defaultValue="signals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="changelogs">Changelogs</TabsTrigger>
          <TabsTrigger value="memories">Memories</TabsTrigger>
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          <TabsTrigger value="storyblok">Storyblok Components</TabsTrigger>
        </TabsList>
        <TabsContent value="signals">
          <SignalsTable />
        </TabsContent>
        <TabsContent value="changelogs">
          <ChangelogsTable />
        </TabsContent>
        <TabsContent value="memories">
          <MemoriesTable />
        </TabsContent>
        <TabsContent value="pipelines">
          <PipelinesTable />
        </TabsContent>
        <TabsContent value="storyblok">
          <StoryblokComponentsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
