"use client"
import { useState, useEffect } from 'react'

export default function PlaygroundPage() {
  const [fhirMode, setFhirMode] = useState<string>('loading...')
  const [toolName, setToolName] = useState<string>('PatientLookup')
  const [patientId, setPatientId] = useState<string>('')
  const [familyName, setFamilyName] = useState<string>('')

  const [loading, setLoading] = useState(false)
  const [fhirRequest, setFhirRequest] = useState<any>(null)
  const [fhirResponse, setFhirResponse] = useState<any>(null)
  const [reasoningTrace, setReasoningTrace] = useState<any>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(res => res.json())
      .then(data => setFhirMode(data.fhir_mode))
      .catch(err => setFhirMode('error'))
  }, [API_URL])

  const getBadgeColor = (mode: string) => {
    if (mode === 'static') return 'bg-slate-700'
    if (mode === 'cloud') return 'bg-green-600'
    if (mode === 'local') return 'bg-amber-600'
    return 'bg-gray-600'
  }

  const handleExecute = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (patientId) params.patient_id = patientId
      if (toolName === 'PatientLookup' && familyName) params.family_name = familyName

      const reqBody = { tool_name: toolName, params }

      const res = await fetch(`${API_URL}/execute-tool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody)
      })

      const data = await res.json()
      setFhirRequest(data.fhir_request)
      setFhirResponse(data.fhir_response)
      setReasoningTrace(null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRunScenario = async () => {
    if (!patientId) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/run-scenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId })
      })
      const data = await res.json()
      setReasoningTrace(data.reasoning_trace)
      setFhirRequest(null)
      setFhirResponse({ summary: data.summary })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Auto-update FHIR Request preview
  useEffect(() => {
    const params: Record<string, string> = {}
    if (patientId) params.patient_id = patientId
    if (toolName === 'PatientLookup' && familyName) params.family_name = familyName
    setFhirRequest({
      resource: toolName.replace('Lookup', '').replace('Search', ''),
      params
    })
  }, [toolName, patientId, familyName])

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="font-serif text-4xl text-primary mb-2">FHIR-to-LLM Clinical Data Gateway</h1>
            <p className="text-gray-400">Powered by Medplum | Model Context Protocol | Tri-Mode Architecture</p>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border border-white/10 ${getBadgeColor(fhirMode)}`}>
            Mode: {fhirMode}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Panel 1: Tool Selection */}
          <div className="backdrop-blur-md bg-[rgba(22,32,41,0.7)] border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
              <span>Tool Selection</span>
              <button
                onClick={handleRunScenario}
                disabled={loading || !patientId}
                className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
              >
                Run Full Scenario
              </button>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tool</label>
                <select
                  className="w-full bg-[#0F1923] border border-white/20 rounded p-2 text-white"
                  value={toolName}
                  onChange={e => setToolName(e.target.value)}
                >
                  <option value="PatientLookup">PatientLookup</option>
                  <option value="ConditionSearch">ConditionSearch</option>
                  <option value="CoverageLookup">CoverageLookup</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Patient ID (UUID)</label>
                <input
                  type="text"
                  className="w-full bg-[#0F1923] border border-white/20 rounded p-2 text-white"
                  placeholder="e.g. 5f64479f-fa77-4699-8709-400070245c60"
                  value={patientId}
                  onChange={e => setPatientId(e.target.value)}
                />
              </div>

              {toolName === 'PatientLookup' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Family Name (Optional)</label>
                  <input
                    type="text"
                    className="w-full bg-[#0F1923] border border-white/20 rounded p-2 text-white"
                    placeholder="e.g. Smith"
                    value={familyName}
                    onChange={e => setFamilyName(e.target.value)}
                  />
                </div>
              )}

              <button
                onClick={handleExecute}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Executing...' : 'Execute Tool'}
              </button>
            </div>
          </div>

          {/* Panel 2: FHIR Request preview */}
          <div className="backdrop-blur-md bg-[rgba(22,32,41,0.7)] border border-white/10 rounded-2xl p-6 flex flex-col">
            <h2 className="text-xl font-bold mb-4">FHIR Request Payload</h2>
            <div className="flex-1 bg-[#0F1923] rounded p-4 overflow-auto border border-white/5">
              <pre className="font-mono text-sm text-gray-300">
                {fhirRequest ? JSON.stringify(fhirRequest, null, 2) : '{ // Awaiting tool selection }'}
              </pre>
            </div>
          </div>

          {/* Panel 3: FHIR Response */}
          <div className="backdrop-blur-md bg-[rgba(22,32,41,0.7)] border border-white/10 rounded-2xl p-6 flex flex-col h-96">
            <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
              <span>FHIR Response</span>
              {fhirResponse?.total !== undefined && (
                <span className="text-xs bg-primary/20 text-accent px-2 py-1 rounded-full">
                  {fhirResponse.total} Entries
                </span>
              )}
            </h2>
            <div className="flex-1 bg-[#0F1923] rounded p-4 overflow-auto border border-white/5">
              {loading ? (
                <div className="text-gray-500 animate-pulse">Waiting for response...</div>
              ) : fhirResponse ? (
                <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
                  <span className="text-gray-300">
                    {/* A simple syntax highlighter approach without needing external libs */}
                    {JSON.stringify(fhirResponse, null, 2).replace(/"(.*?)"/g, (match) => {
                      return `<span class="text-accent">${match}</span>`
                    }).replace(/: ([0-9]+)/g, (match, p1) => {
                      return `: <span class="text-gold">${p1}</span>`
                    })}
                  </span>
                </pre>
              ) : (
                <div className="text-gray-600">No response yet. Run a tool to see raw FHIR data.</div>
              )}
            </div>
          </div>

          {/* Panel 4: Reasoning Trace */}
          <div className="backdrop-blur-md bg-[rgba(22,32,41,0.7)] border border-white/10 rounded-2xl p-6 flex flex-col h-96">
            <h2 className="text-xl font-bold mb-4">Reasoning Trace</h2>
            <div className="flex-1 overflow-auto pr-2">
              {!reasoningTrace ? (
                <div className="text-gray-500 text-center mt-10 p-4 border border-dashed border-gray-700 rounded-lg">
                  Trace timeline populated after generating a full clinical scenario summary.
                  <button onClick={handleRunScenario} className="block mx-auto mt-4 text-accent underline underline-offset-4">Run Scenario</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reasoningTrace.map((step: any, idx: number) => (
                    <div key={idx} className="relative pl-6 pb-4">
                      {idx !== reasoningTrace.length - 1 && (
                        <div className="absolute left-[7px] top-6 bottom-0 w-px bg-primary opacity-50" />
                      )}
                      <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-background" />

                      <div className="bg-[#0F1923] border border-white/10 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-accent">{step.tool}</span>
                          <span className="text-xs text-gold font-mono">{step.duration_ms}ms</span>
                        </div>
                        <div className="text-sm text-gray-400 truncate mb-2">Input: {JSON.stringify(step.input)}</div>
                        <div className="text-sm text-gray-200">{step.output}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
