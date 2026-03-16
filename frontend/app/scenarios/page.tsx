"use client"
import { useState } from 'react'

export default function ScenariosPage() {
    const [patientId, setPatientId] = useState<string>('5f64479f-fa77-4699-8709-400070245c60')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    const handleRun = async () => {
        if (!patientId) return
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/run-scenario`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patient_id: patientId })
            })
            const data = await res.json()
            setResult(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Extractor helpers
    const extractPatient = (patientObj: any) => {
        const r = patientObj?.fhir_response?.entry?.[0]?.resource || {}
        const name = r.name?.[0] ? `${r.name[0].given?.join(' ')} ${r.name[0].family}` : 'Unknown'
        return { name, birthDate: r.birthDate || 'Unknown', gender: r.gender || 'Unknown' }
    }

    const extractConditions = (condObj: any) => {
        return condObj?.conditions || []
    }

    const extractCoverage = (covObj: any) => {
        return covObj?.coverage || []
    }

    return (
        <main className="min-h-screen bg-background text-foreground p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                <header className="border-b border-white/10 pb-6">
                    <h1 className="font-serif text-4xl text-primary mb-2">Clinical Scenario Walkthrough</h1>
                    <p className="text-gray-400">Step-by-step LLM reasoning over FHIR resources</p>
                </header>

                <div className="backdrop-blur-md bg-[rgba(22,32,41,0.7)] border border-white/10 rounded-2xl p-6 flex gap-4">
                    <input
                        type="text"
                        className="flex-1 bg-[#0F1923] border border-white/20 rounded p-3 text-white"
                        placeholder="Patient ID"
                        value={patientId}
                        onChange={e => setPatientId(e.target.value)}
                    />
                    <button
                        onClick={handleRun}
                        disabled={loading}
                        className="bg-gradient-to-r from-primary to-accent text-white font-bold px-8 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? 'Running...' : 'Run Full Scenario'}
                    </button>
                </div>

                {result && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-serif mt-8 mb-4">Patient Profile</h2>
                        <div className="backdrop-blur-md bg-[rgba(22,32,41,0.7)] border border-white/10 rounded-2xl p-6">
                            {(() => {
                                const pt = extractPatient(result.patient)
                                return (
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-sm text-gray-400">Name</div>
                                            <div className="text-xl font-bold">{pt.name}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-400">Birth Date</div>
                                            <div className="text-xl font-bold">{pt.birthDate}</div>
                                        </div>
                                        <div className="capitalize">
                                            <div className="text-sm text-gray-400">Gender</div>
                                            <div className="text-xl font-bold">{pt.gender}</div>
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>

                        <h2 className="text-2xl font-serif mt-8 mb-4">Active Conditions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {extractConditions(result.conditions).map((c: any, i: number) => (
                                <div key={i} className="backdrop-blur-md bg-[rgba(22,32,41,0.7)] border border-l-4 border-l-gold border-white/10 rounded p-4">
                                    <div className="font-bold">{c.display || 'Unnamed Condition'}</div>
                                    <div className="flex gap-4 mt-2 text-sm font-mono text-gray-400">
                                        <span>SNOMED: {c.code || 'N/A'}</span>
                                        <span className="text-blue">{c.clinicalStatus || 'active'}</span>
                                    </div>
                                </div>
                            ))}
                            {extractConditions(result.conditions).length === 0 && (
                                <div className="text-gray-500">No conditions found.</div>
                            )}
                        </div>

                        <h2 className="text-2xl font-serif mt-8 mb-4">Coverage Status</h2>
                        <div className="backdrop-blur-md bg-[rgba(22,32,41,0.7)] border border-l-4 border-l-blue border-white/10 rounded p-6">
                            {extractCoverage(result.coverage).length > 0 ? (
                                extractCoverage(result.coverage).map((cov: any, i: number) => (
                                    <div key={i}>
                                        <div className="text-lg font-bold">{cov.payer || 'Unknown Payer'}</div>
                                        <div className="text-gray-400 mt-1">{cov.type || 'Unknown Type'}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-400 italic">No coverage data on file. (Expected in Synthea sample)</div>
                            )}
                        </div>

                        <h2 className="text-2xl font-serif mt-8 mb-4">LLM Clinical Summary</h2>
                        <div className="backdrop-blur-md bg-gradient-to-br from-[rgba(13,115,119,0.2)] to-[rgba(0,191,165,0.1)] border border-accent/30 rounded-2xl p-6">
                            <p className="text-lg leading-relaxed">{result.summary}</p>
                        </div>

                        <h2 className="text-xl font-serif mt-8 mb-4 text-gray-400">Agent Reasoning Trace</h2>
                        <div className="space-y-2">
                            {result.reasoning_trace?.map((step: any, i: number) => (
                                <div key={i} className="flex items-center gap-4 text-sm font-mono bg-[#0F1923] p-3 rounded">
                                    <div className="text-accent min-w-[120px]">{step.tool}</div>
                                    <div className="text-gray-500 flex-1 truncate">{JSON.stringify(step.input)}</div>
                                    <div className="text-gold">{step.duration_ms}ms</div>
                                </div>
                            ))}
                        </div>

                    </div>
                )}
            </div>
        </main>
    )
}
