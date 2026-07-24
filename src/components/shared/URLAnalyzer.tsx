import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Globe, Search, Sparkles, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";

const MAX_URL_INPUT_LENGTH = 1000;

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { analyzeURL } from "@/lib/urlAnalyzer";
import { DEMO_URLS, type DemoURL } from "@/lib/demoUrls";
import { URLAnalysisResultView } from "./URLAnalysisResult";
import type { URLAnalysisResult } from "@/lib/urlTypes";

const urlSchema = z.object({
  urlInput: z.string()
    .min(3, {
      message: "Please enter a valid domain or URL (e.g. micros0ft-security-login.com).",
    })
    .max(MAX_URL_INPUT_LENGTH, {
      message: `URL input must be ${MAX_URL_INPUT_LENGTH} characters or less.`,
    }),
});

export function URLAnalyzer() {
  const [analysisResult, setAnalysisResult] = useState<URLAnalysisResult | null>(null);

  const form = useForm<z.infer<typeof urlSchema>>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      urlInput: "",
    },
  });

  function onSubmit(values: z.infer<typeof urlSchema>) {
    const res = analyzeURL(values.urlInput);
    setAnalysisResult(res);
  }

  function handleRunDemo(demo: DemoURL) {
    form.setValue("urlInput", demo.url);
    const res = analyzeURL(demo.url);
    setAnalysisResult(res);
  }

  return (
    <div className="space-y-8">
      {analysisResult ? (
        <URLAnalysisResultView result={analysisResult} onReset={() => setAnalysisResult(null)} />
      ) : (
        <div className="space-y-8">
          {/* Main Input Form Card */}
          <Card className="glass border-border/60 shadow-2xl overflow-hidden max-w-4xl mx-auto">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" /> Analyze Web Link or Domain
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Paste any web address, full URL, or domain to inspect lookalike typosquatting and suspicious parameters.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="urlInput"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              {...field}
                              placeholder="Paste URL or domain (e.g. micros0ft-security-login.com or chatgpt.com)..."
                              className="pl-10 h-12 font-mono text-xs sm:text-sm bg-background/50 border-border/60 focus:border-blue-500 text-slate-200"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-2">
                    <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm">
                      <Search className="mr-2 w-4 h-4" /> Analyze Link
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="border-t border-border/40 text-xs text-muted-foreground flex items-center gap-2 py-3 bg-background/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Privacy Guaranteed: Analysis is executed entirely in your browser without external API tracking.</span>
            </CardFooter>
          </Card>

          {/* Preset Demo URLs Grid */}
          <div className="space-y-4 max-w-5xl mx-auto pt-2">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Try Example Domains & Links
              </h3>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-xs font-mono">
                Preset Test Links
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEMO_URLS.map((demo) => (
                <Card
                  key={demo.id}
                  className="glass border-border/50 hover:border-blue-500/50 transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] uppercase font-mono ${
                          demo.category === "High Risk"
                            ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                            : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        } border`}
                      >
                        {demo.category}
                      </Badge>
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <CardTitle className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                      {demo.label}
                    </CardTitle>
                    <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">{demo.url}</p>
                  </CardHeader>

                  <CardFooter className="p-4 pt-2">
                    <Button
                      onClick={() => handleRunDemo(demo)}
                      variant="outline"
                      size="sm"
                      className="w-full bg-background/50 hover:bg-blue-600 hover:text-white border-border/60 text-xs font-semibold"
                    >
                      Analyze Link <ArrowRight className="ml-auto w-3.5 h-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
