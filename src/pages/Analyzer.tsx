import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Search, FileText, UploadCloud, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { parseEmail } from "@/lib/parser"
import { analyzeEmail } from "@/lib/detector"

const textSchema = z.object({
  content: z.string().min(10, {
    message: "Email content must be at least 10 characters.",
  }),
})

export function Analyzer() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("text")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const textForm = useForm<z.infer<typeof textSchema>>({
    resolver: zodResolver(textSchema),
    defaultValues: {
      content: "",
    },
  })

  function onTextSubmit(values: z.infer<typeof textSchema>) {
    setIsAnalyzing(true)
    
    // Parse the email text
    const parsedData = parseEmail(values.content)
    
    // Analyze the parsed data
    const analysisResult = analyzeEmail(parsedData)
    
    navigate('/results', { 
      state: { parsedData, analysisResult } 
    })
  }

  function onFileSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      alert("Please select a file first.")
      return
    }
    
    setIsAnalyzing(true)

    // Read the .eml file content
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      
      const parsedData = parseEmail(content)
      const analysisResult = analyzeEmail(parsedData)
      
      navigate('/results', { 
        state: { parsedData, analysisResult } 
      })
    }
    reader.readAsText(file)
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl font-bold text-white mb-4">Analyze Suspicious Email</h1>
        <p className="text-muted-foreground text-lg">
          Paste the raw text of an email or upload an .eml file to get an instant risk assessment.
        </p>
      </div>

      <Card className="glass border-border/50 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader className="border-b border-border/50 pb-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-background/50">
              <TabsTrigger value="text" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <FileText className="w-4 h-4 mr-2" />
                Paste Text
              </TabsTrigger>
              <TabsTrigger value="file" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <UploadCloud className="w-4 h-4 mr-2" />
                Upload .eml
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-6 pb-2">
            <TabsContent value="text" className="mt-0 outline-none">
              <Form {...textForm}>
                <form onSubmit={textForm.handleSubmit(onTextSubmit)} className="space-y-6">
                  <FormField
                    control={textForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Paste the suspicious email content here (including headers if possible)..."
                            className="min-h-[250px] resize-y bg-background/50 border-border/50 focus-visible:ring-blue-500 font-mono text-sm leading-relaxed"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={isAnalyzing} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                      {isAnalyzing ? (
                        <span className="flex items-center">
                          <Search className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Search className="mr-2 h-4 w-4" /> Analyze Text
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="file" className="mt-0 outline-none">
              <form onSubmit={onFileSubmit} className="space-y-6">
                <div className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center bg-background/30 hover:bg-background/50 transition-colors group">
                  <UploadCloud className="w-12 h-12 text-muted-foreground mx-auto mb-4 group-hover:text-emerald-400 transition-colors" />
                  <div className="space-y-2">
                    <Label htmlFor="file-upload" className="text-lg font-medium text-white cursor-pointer hover:underline">
                      Click to upload
                    </Label>
                    <p className="text-sm text-muted-foreground">or drag and drop an .eml file here</p>
                  </div>
                  <Input 
                    id="file-upload" 
                    type="file" 
                    accept=".eml" 
                    className="hidden" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file && (
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20">
                      <FileText className="w-4 h-4" />
                      {file.name}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" size="lg" disabled={isAnalyzing || !file} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
                    {isAnalyzing ? (
                      <span className="flex items-center">
                        <Search className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Search className="mr-2 h-4 w-4" /> Analyze File
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </CardContent>
          
          <CardFooter className="bg-background/30 border-t border-border/50 rounded-b-xl flex gap-2 text-sm text-muted-foreground p-4">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
            <p>Your data is processed securely. We do not store sensitive email content permanently.</p>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  )
}
