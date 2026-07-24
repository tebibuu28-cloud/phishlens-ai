import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const MAX_EMAIL_INPUT_LENGTH = 200000;
const MAX_EMAIL_FILE_SIZE = 200000; // 200KB max file size

import {
  Search,
  FileText,
  UploadCloud,
  ShieldCheck,
  Sparkles,
  PlayCircle,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Info,
  Globe,
  Mail
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { parseEmail } from "@/lib/parser";
import { analyzeEmail } from "@/lib/detector";
import { DEMO_SAMPLES, type DemoSample } from "@/lib/demoSamples";
import { URLAnalyzer } from "@/components/shared/URLAnalyzer";

const textSchema = z.object({
  content: z.string()
    .min(10, {
      message: "Email content must be at least 10 characters long.",
    })
    .max(MAX_EMAIL_INPUT_LENGTH, {
      message: `Email content must be ${MAX_EMAIL_INPUT_LENGTH.toLocaleString()} characters or less.`,
    }),
});

export function Analyzer() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"email" | "url">("email");
  const [activeTab, setActiveTab] = useState("text");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const textForm = useForm<z.infer<typeof textSchema>>({
    resolver: zodResolver(textSchema),
    defaultValues: {
      content: "",
    },
  });

  const contentValue = textForm.watch("content");
  const charCount = contentValue ? contentValue.length : 0;

  function processAnalysis(content: string) {
    const trimmedContent = content.trim();
    if (trimmedContent.length > MAX_EMAIL_INPUT_LENGTH) {
      textForm.setError("content", {
        type: "max",
        message: `Email content must be ${MAX_EMAIL_INPUT_LENGTH.toLocaleString()} characters or less.`,
      });
      return;
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      const parsedData = parseEmail(trimmedContent);
      const analysisResult = analyzeEmail(parsedData);
      setIsAnalyzing(false);
      navigate("/results", {
        state: {
          parsedData,
          analysisResult,
        },
      });
    }, 400);
  }

  function onTextSubmit(values: z.infer<typeof textSchema>) {
    processAnalysis(values.content);
  }

  function handleRunDemo(sample: DemoSample) {
    textForm.setValue("content", sample.emailContent);
    processAnalysis(sample.emailContent);
  }

  function onFileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    if (file.size > MAX_EMAIL_FILE_SIZE) {
      alert(`Selected file is too large. Please choose a file smaller than ${Math.round(MAX_EMAIL_FILE_SIZE / 1024)} KB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== "string") {
        alert("Unable to read the selected file. Please try a valid .eml file.");
        return;
      }
      processAnalysis(content);
    };
    reader.onerror = () => {
      alert("Unable to read the selected file. Please try again.");
    };
    reader.readAsText(file);
  }

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-10 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 font-mono py-1 px-3">
          PhishLens AI Security Suite
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Investigate Threats & Impersonation
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Switch between email header & body scanner or URL lookalike domain intelligence.
        </p>
      </div>

      {/* Top Mode Selector Tabs */}
      <div className="flex justify-center">
        <div className="glass p-1.5 rounded-xl border border-border/60 inline-flex gap-2">
          <Button
            onClick={() => setMode("email")}
            variant={mode === "email" ? "default" : "ghost"}
            size="sm"
            className={mode === "email" ? "bg-blue-600 hover:bg-blue-700 text-white font-semibold" : "text-slate-300 hover:text-white"}
          >
            <Mail className="w-4 h-4 mr-2" /> Analyze Email
          </Button>
          <Button
            onClick={() => setMode("url")}
            variant={mode === "url" ? "default" : "ghost"}
            size="sm"
            className={mode === "url" ? "bg-blue-600 hover:bg-blue-700 text-white font-semibold" : "text-slate-300 hover:text-white"}
          >
            <Globe className="w-4 h-4 mr-2" /> Analyze Link / Domain
          </Button>
        </div>
      </div>

      {/* Mode 1: Email Analyzer */}
      {mode === "email" && (
        <div className="space-y-10">
          {/* Main Analysis Input Card */}
          <Card className="glass border-border/60 shadow-2xl overflow-hidden max-w-4xl mx-auto relative">
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-200">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                <p className="text-sm font-semibold text-white">Inspecting Headers & Threat Vectors...</p>
                <p className="text-xs text-muted-foreground">Evaluating display spoofing, IP links, and urgency tactics</p>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="pb-2 border-b border-border/40">
                <TabsList className="grid grid-cols-2 max-w-xs">
                  <TabsTrigger value="text" className="text-xs sm:text-sm">
                    <FileText className="w-3.5 h-3.5 mr-2" /> Paste Text
                  </TabsTrigger>
                  <TabsTrigger value="file" className="text-xs sm:text-sm">
                    <UploadCloud className="w-3.5 h-3.5 mr-2" /> Upload .eml
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="pt-5">
                <TabsContent value="text" className="mt-0 space-y-4">
                  <Form {...textForm}>
                    <form onSubmit={textForm.handleSubmit(onTextSubmit)} className="space-y-3">
                      <FormField
                        control={textForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder={`From: Microsoft Support <support@micros0ft-security.com>\nSubject: URGENT: Your account will be suspended within 24 hours\n\nDear customer,\nPlease verify account immediately at http://micros0ft-security.com/login`}
                                className="min-h-[220px] font-mono text-xs sm:text-sm bg-background/50 border-border/60 focus:border-blue-500 text-slate-200 leading-relaxed"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{charCount} characters</span>
                        </div>

                        <Button type="submit" disabled={isAnalyzing} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20">
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                            </>
                          ) : (
                            <>
                              <Search className="mr-2 w-4 h-4" /> Analyze Email
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="file" className="mt-0">
                  <form onSubmit={onFileSubmit} className="space-y-5">
                    <div className="border-2 border-dashed border-border/60 hover:border-blue-500/50 rounded-xl p-8 text-center transition-colors bg-background/30">
                      <UploadCloud className="mx-auto w-10 h-10 mb-3 text-blue-400" />
                      <Label htmlFor="file" className="cursor-pointer text-white text-sm font-medium hover:text-blue-300">
                        Choose a raw .eml file from your device
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">RFC 822 compliant email files</p>
                      <Input
                        id="file"
                        type="file"
                        accept=".eml"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                      {file && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono">
                          <span>File: {file.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button disabled={!file || isAnalyzing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Search className="mr-2 w-4 h-4" />
                        {isAnalyzing ? "Processing..." : "Analyze File"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </CardContent>

              <CardFooter className="border-t border-border/40 text-xs text-muted-foreground flex items-center gap-2 py-2.5 bg-background/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Deterministic client-side processing preserves full data confidentiality.</span>
              </CardFooter>
            </Tabs>
          </Card>

          {/* Demo Section: 6 Realistic Scenarios */}
          <div className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border/40 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-amber-400" /> Try PhishLens with Real Phishing Examples
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Test real-world attack vectors with 1-click instant analysis.
                </p>
              </div>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/30 font-mono text-xs">
                6 Presets Available
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {DEMO_SAMPLES.map((sample) => (
                <Card
                  key={sample.id}
                  className="glass border-border/50 hover:border-blue-500/50 transition-all duration-200 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge variant="secondary" className="bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] uppercase font-mono">
                        {sample.category}
                      </Badge>
                      <ShieldAlert className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <CardTitle className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                      {sample.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {sample.description}
                    </CardDescription>
                  </CardHeader>

                  <CardFooter className="pt-2 pb-3.5">
                    <Button
                      onClick={() => handleRunDemo(sample)}
                      variant="outline"
                      size="sm"
                      className="w-full bg-background/50 hover:bg-blue-600 hover:text-white border-border/60 text-xs font-semibold group-hover:border-blue-500/50"
                    >
                      <Sparkles className="mr-1.5 w-3.5 h-3.5 text-amber-400 group-hover:text-white" /> Analyze Demo
                      <ArrowRight className="ml-auto w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: URL Analyzer Component */}
      {mode === "url" && <URLAnalyzer />}

    </div>
  );
}