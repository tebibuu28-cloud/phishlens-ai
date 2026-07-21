import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import {
  Search,
  FileText,
  UploadCloud,
  ShieldCheck,
  Sparkles
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"

import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { parseEmail } from "@/lib/parser"
import { analyzeEmail } from "@/lib/detector"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"


const textSchema = z.object({
  content: z.string().min(10, {
    message: "Email content must be at least 10 characters.",
  }),
})


const SAMPLE_EMAIL = `
From: security@paypa1-support.com
Subject: URGENT! Your account will be suspended

Dear customer,

We detected unusual activity.
Click here immediately to verify your account:

http://fake-paypal-login.com

Failure to respond within 24 hours will permanently lock your account.

Thank you.
`


export function Analyzer() {

  const navigate = useNavigate()

  const [activeTab,setActiveTab] = useState("text")
  const [isAnalyzing,setIsAnalyzing] = useState(false)
  const [file,setFile] = useState<File|null>(null)
  const [saveError,setSaveError] = useState<string | null>(null)
  const { user } = useAuth()


  const textForm = useForm<z.infer<typeof textSchema>>({

    resolver:zodResolver(textSchema),

    defaultValues:{
      content:""
    }

  })


  async function analyze(content:string) {
    setSaveError(null)
    setIsAnalyzing(true)

    const parsedData = parseEmail(content)
    const analysisResult = analyzeEmail(parsedData)

    if (!user) {
      setSaveError("Please log in to save this analysis.")
      setIsAnalyzing(false)
      navigate("/login")
      return
    }

    const { data, error } = await (supabase as any)
      .from("email_analysis")
      .insert({
        user_id: user.id,
        sender: parsedData.sender,
        subject: parsedData.subject,
        body: parsedData.body,
        risk_score: analysisResult.score,
        level:
          analysisResult.riskLevel === "High Risk"
            ? "high"
            : analysisResult.riskLevel === "Suspicious"
            ? "medium"
            : "low",
        reasons: analysisResult.reasons,
        recommendations: analysisResult.recommendations,
      })
      .select()
      .single()

    setIsAnalyzing(false)

    if (error || !data) {
      setSaveError(error?.message ?? "Unable to save analysis. Please try again.")
      return
    }

    navigate("/results", {
      state: {
        parsedData,
        analysisResult,
        savedAnalysis: data,
      },
    })
  }



  function onTextSubmit(values:z.infer<typeof textSchema>){

    analyze(values.content)

  }



  function loadExample(){

    textForm.setValue(
      "content",
      SAMPLE_EMAIL
    )

  }



  function onFileSubmit(e:React.FormEvent){

    e.preventDefault()


    if(!file){

      alert("Please select a file first.")

      return

    }


    const reader=new FileReader()


    reader.onload=(event)=>{

      const content=event.target?.result as string

      analyze(content)

    }


    reader.readAsText(file)

  }



return (

<div className="container max-w-4xl mx-auto py-12 px-4">


<div className="text-center mb-8">

<h1 className="text-4xl font-bold text-white mb-4">

Analyze Suspicious Email

</h1>


<p className="text-muted-foreground text-lg">

      {saveError ? (
        <div className="mb-6 rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          {saveError}
        </div>
      ) : null}

Detect phishing attacks, social engineering,
and hidden threats using AI analysis.

</p>


</div>



<Card className="glass border-border/50 shadow-xl">


<Tabs value={activeTab} onValueChange={setActiveTab}>


<CardHeader>


<TabsList className="grid grid-cols-2">

<TabsTrigger value="text">

<FileText className="w-4 h-4 mr-2"/>

Paste Text

</TabsTrigger>


<TabsTrigger value="file">

<UploadCloud className="w-4 h-4 mr-2"/>

Upload .eml

</TabsTrigger>


</TabsList>


</CardHeader>




<CardContent>


<TabsContent value="text">


<Form {...textForm}>


<form
onSubmit={
textForm.handleSubmit(onTextSubmit)
}
className="space-y-6"
>



<FormField

control={textForm.control}

name="content"

render={({field})=>(

<FormItem>


<FormControl>


<Textarea

{...field}

placeholder="Paste suspicious email here..."

className="min-h-[260px] font-mono"

/>


</FormControl>


<FormMessage/>

</FormItem>

)}

/>




<div className="flex gap-3">


<Button

type="button"

variant="outline"

onClick={loadExample}

>

<Sparkles className="mr-2 w-4 h-4"/>

Try Example

</Button>



<Button

disabled={isAnalyzing}

className="bg-blue-600"

>


<Search className="mr-2 w-4 h-4"/>


{
isAnalyzing
?
"Analyzing..."
:
"Analyze Email"
}


</Button>


</div>


</form>


</Form>


</TabsContent>






<TabsContent value="file">


<form
onSubmit={onFileSubmit}
className="space-y-6"
>


<div className="border-2 border-dashed rounded-xl p-10 text-center">


<UploadCloud className="mx-auto w-12 h-12 mb-4 text-blue-400"/>


<Label
htmlFor="file"
className="cursor-pointer text-white"
>

Choose .eml file

</Label>


<Input

id="file"

type="file"

accept=".eml"

className="hidden"

onChange={(e)=>
setFile(
e.target.files?.[0] || null
)
}

/>


{
file &&

<p className="mt-4 text-green-400">

{file.name}

</p>

}


</div>




<Button

disabled={!file || isAnalyzing}

className="bg-emerald-600"

>

<Search className="mr-2 w-4 h-4"/>

Analyze File

</Button>


</form>


</TabsContent>



</CardContent>



<CardFooter className="border-t text-sm text-muted-foreground flex gap-2">


<ShieldCheck className="w-5 h-5 text-green-400"/>


Your email content is processed securely and not permanently stored.


</CardFooter>



</Tabs>


</Card>



<div className="mt-12 grid md:grid-cols-3 gap-6">


<div className="glass p-5 rounded-xl">

<h3 className="text-white font-bold">

URL Detection

</h3>

<p className="text-muted-foreground">

Find malicious links and suspicious domains.

</p>

</div>



<div className="glass p-5 rounded-xl">

<h3 className="text-white font-bold">

Social Engineering

</h3>

<p className="text-muted-foreground">

Detect urgency, fear tactics, and manipulation.

</p>

</div>




<div className="glass p-5 rounded-xl">

<h3 className="text-white font-bold">

Security Learning

</h3>

<p className="text-muted-foreground">

Understand why attackers use these methods.

</p>

</div>



</div>


</div>

)

}