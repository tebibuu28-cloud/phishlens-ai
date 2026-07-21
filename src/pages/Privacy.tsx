export function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-8">

      <h1 className="text-5xl font-bold text-white">
        Privacy Policy
      </h1>

      <p className="text-muted-foreground text-lg">
        PhishLens AI is designed with privacy in mind.
        We analyze suspicious emails while minimizing data collection.
      </p>


      <div className="space-y-4">

        <h2 className="text-2xl font-bold text-white">
          Email Processing
        </h2>

        <p className="text-muted-foreground">
          Email content is processed only to generate security analysis.
          We do not permanently store your email messages.
        </p>

      </div>


      <div className="space-y-4">

        <h2 className="text-2xl font-bold text-white">
          Local Storage
        </h2>

        <p className="text-muted-foreground">
          Browser history features may store information locally on your device.
        </p>

      </div>


    </div>
  )
}
