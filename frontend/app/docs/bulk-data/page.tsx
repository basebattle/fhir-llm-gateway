export default function BulkDataDocs() {
    return (
        <main className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-3xl mx-auto backdrop-blur-md bg-[rgba(22,32,41,0.7)] border border-white/10 rounded-2xl p-8">
                <h1 className="font-serif text-4xl text-primary mb-6">Bulk Data Access 2.0</h1>

                <div className="space-y-6 text-gray-300 leading-relaxed font-sans">
                    <p>
                        The FHIR Bulk Data Access API (Flat FHIR) is a critical standard for population-level health data exchange.
                        It allows systems to export massive datasets (thousands or millions of records) asynchronously using NDJSON
                        (Newline-Delimited JSON) rather than making repeated synchronous calls per patient.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">Relevance to Cohort Generation</h2>
                    <p>
                        In Phase 2 of this portfolio (P09: Synthetic Patient Cohort Generator), the ability to extract, process,
                        and validate large collections of patient bundles relies on systems capable of handling bulk data. The AI
                        reasoning layers shown in this FHIR-to-LLM gateway (P06) and the CDS Hooks bridge (P08) typically operate
                        on single-patient transactional scopes, but the underlying data foundation requires robust bulk ingestion.
                    </p>

                    <div className="mt-8 p-4 bg-orange-500/20 border-l-4 border-l-gold rounded">
                        <h3 className="font-bold text-gold mb-2">Cloud Strategy Note & Azure Retirement</h3>
                        <p className="text-sm">
                            When migrating these architectures to enterprise cloud providers, it's crucial to follow official roadmaps.
                            <strong> The Azure API for FHIR is slated for retirement in September 2026.</strong>
                            All new deployments should utilize <strong>Azure Health Data Services (AHDS)</strong> FHIR service workspaces.
                            AHDS introduces enhanced managed identity (RBAC), superior event routing (Azure Event Grid), and native
                            DICOM/MedTech integrations alongside standard FHIR.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
