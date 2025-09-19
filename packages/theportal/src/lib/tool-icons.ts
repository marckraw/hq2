import {
  Wrench,
  CloudSun,
  Search,
  Globe,
  FileText,
  Calculator,
  Database,
  Image as ImageIcon,
  Mic,
  Scissors,
} from "lucide-react";

export const pickToolIcon = (name: string) => {
  const n = (name || "").toLowerCase();
  if (n.includes("weather")) return CloudSun;
  if (n.includes("search")) return Search;
  if (n.includes("web") || n.includes("url") || n.includes("http")) return Globe;
  if (n.includes("file")) return FileText;
  if (n.includes("calc") || n.includes("math")) return Calculator;
  if (n.includes("db") || n.includes("memory") || n.includes("store")) return Database;
  if (n.includes("image") || n.includes("img")) return ImageIcon;
  if (n.includes("transcribe") || n.includes("audio")) return Mic;
  if (n.includes("clip") || n.includes("trim")) return Scissors;
  return Wrench;
};
