export default function SmartOnFhirDocs() {
    return (
        <main className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-3xl mx-auto backdrop-blur-md bg-[rgba(22,32,41,0.7)] border border-white/10 rounded-2xl p-8">
                <h1 className="font-serif text-4xl text-primary mb-6">SMART on FHIR: Production Readiness</h1>

                <div className="space-y-6 text-gray-300 leading-relaxed font-sans">
                    <p>
                        SMART on FHIR is a standard integrating healthcare apps with EHRs (Electronic Health Records) using
                        OAuth 2.0 authorization and FHIR data access.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">OAuth 2.0 Authorization Code Flow</h2>
                    <ol className="list-decimal pl-6 space-y-3">
                        <li><strong>Launch:</strong> The user opens the app from within the EHR (EHR Launch) or externally (Standalone Launch).</li>
                        <li><strong>Authorization Request:</strong> The app redirects the user to the EHR's authorization server, requesting specific FHIR scopes (e.g., <code>patient/Patient.read</code>).</li>
                        <li><strong>Authentication & Consent:</strong> The user logs in and approves the requested scopes.</li>
                        <li><strong>Authorization Code:</strong> The EHR redirects back to the app with a temporary code.</li>
                        <li><strong>Token Exchange:</strong> The app securely exchanges the code for an Access Token (and a refresh token, plus contextual data like the selected patient ID).</li>
                        <li><strong>FHIR Access:</strong> The app uses the Access Token as a Bearer token in the Authorization header to call the FHIR API.</li>
                    </ol>

                    <div className="mt-8 p-4 bg-primary/20 border-l-4 border-l-accent rounded">
                        <h3 className="font-bold text-accent mb-2">Demo Context Note</h3>
                        <p className="text-sm">
                            This sandbox project demonstrates the FHIR data manipulation layer. For simplicity via Medplum, it uses the
                            <strong> client_credentials</strong> grant type to access the cloud project globally, rather than a true SMART
                            launch context restricted to a single patient session. A production EHR launch would require full SMART OAuth compliance.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
