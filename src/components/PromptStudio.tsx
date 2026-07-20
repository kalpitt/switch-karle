import { useEffect, useMemo, useState } from 'react'
import type { Application } from '../tracker/types'
import { addInsight, load, removeInsight, save } from '../tracker/store'
import { TEMPLATES } from '../prompts/templates'
import type { PromptContext, PromptTemplate } from '../prompts/templates'
import type { OfferInput, RedFlag, SalaryBreakdown } from '../engine/types'
import { decodeOffer } from '../engine/salary'
import { scanRedFlags } from '../engine/redFlags'
import { Card, Details, Select, TextArea } from './ui'

const DECODER_STORAGE_KEY = 'chhalaang.decoder.v1'
const NO_APP = 'none'

const CATEGORY_LABEL: Record<PromptTemplate['category'], string> = {
  research: 'Research',
  prepare: 'Prepare',
  negotiate: 'Negotiate',
  outreach: 'Outreach',
}

const CATEGORY_CLASS: Record<PromptTemplate['category'], string> = {
  research: 'bg-leaf-soft text-leaf',
  prepare: 'bg-saffron-soft text-saffron',
  negotiate: 'bg-alarm-soft text-alarm',
  outreach: 'bg-amberflag-soft text-amberflag',
}

/** Best-effort read of the decoder's saved offer, run through the same pure engine the Decoder tab uses. Never throws. */
function loadDecoderContext(): { breakdown?: SalaryBreakdown; flags?: RedFlag[] } {
  try {
    const raw = localStorage.getItem(DECODER_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<OfferInput>
    if (typeof parsed.ctcAnnual !== 'number') return {}
    const breakdown = decodeOffer(parsed as OfferInput)
    const flags = scanRedFlags(breakdown)
    return { breakdown, flags }
  } catch {
    return {}
  }
}

export function PromptStudio({ onGoToTracker }: { onGoToTracker?: () => void }) {
  const [list, setList] = useState<Application[]>(() => load())
  const [selectedAppId, setSelectedAppId] = useState<string>(NO_APP)
  const [insightTemplateId, setInsightTemplateId] = useState<string>(TEMPLATES[0].id)
  const [insightContent, setInsightContent] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    save(list)
  }, [list])

  // Decoder's saved offer never changes while this tab is mounted (the Decoder tab is unmounted whenever
  // this one is visible), so a one-time read on mount is enough — re-computed fresh each time the user
  // switches into this tab.
  const decoderCtx = useMemo(() => loadDecoderContext(), [])

  const selectedApp = list.find((a) => a.id === selectedAppId)

  const ctx: PromptContext = useMemo(
    () => ({ app: selectedApp, breakdown: decoderCtx.breakdown, flags: decoderCtx.flags }),
    [selectedApp, decoderCtx],
  )

  const handleCopy = (template: PromptTemplate, prompt: string) => {
    navigator.clipboard.writeText(prompt).catch(() => {
      /* clipboard permission denied — nothing more we can do client-side */
    })
    setInsightTemplateId(template.id)
    setCopiedId(template.id)
    setTimeout(() => setCopiedId((cur) => (cur === template.id ? null : cur)), 2000)
  }

  const handleSaveInsight = () => {
    if (!selectedApp || !insightContent.trim()) return
    const template = TEMPLATES.find((t) => t.id === insightTemplateId) ?? TEMPLATES[0]
    setList((l) =>
      addInsight(l, selectedApp.id, {
        templateId: template.id,
        title: template.title,
        content: insightContent.trim(),
      }),
    )
    setInsightContent('')
  }

  const handleDeleteInsight = (insightId: string) => {
    if (!selectedApp) return
    if (!confirm('Delete this saved insight? This cannot be undone.')) return
    setList((l) => removeInsight(l, selectedApp.id, insightId))
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h2 className="text-lg font-bold">Prompt Studio</h2>
        <p className="text-[13px] text-ink-soft">
          Generate a context-rich prompt, copy it into ChatGPT/Claude/Gemini, then paste the answer back here to
          save it against your tracked application.
        </p>
        <Select
          label="Personalize for"
          value={selectedAppId}
          onChange={setSelectedAppId}
          options={[
            { value: NO_APP, label: 'No application — generic' },
            ...list.map((a) => ({ value: a.id, label: `${a.company} — ${a.role}` })),
          ]}
        />
      </Card>

      {list.length === 0 && (
        <Card className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-[14px] font-semibold">
            Track an application to personalize these prompts.
          </p>
          <p className="text-[13px] text-ink-soft">
            Prompts below still work generically — add company, role, CTC and notice period in the Tracker to get
            sharper, name-specific prompts.
          </p>
          {onGoToTracker && (
            <button
              type="button"
              onClick={onGoToTracker}
              className="rounded-xl border border-line px-4 py-2 text-[13px] font-semibold text-ink-soft"
            >
              Go to Tracker
            </button>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            ctx={ctx}
            copied={copiedId === template.id}
            onCopy={(prompt) => handleCopy(template, prompt)}
          />
        ))}
      </div>

      {selectedApp && (
        <Card className="space-y-4">
          <div>
            <h3 className="text-base font-bold">Paste what your AI found</h3>
            <p className="text-[13px] text-ink-soft">
              Save the answer against {selectedApp.company} — {selectedApp.role}.
            </p>
          </div>
          <Select
            label="This answer is for"
            value={insightTemplateId}
            onChange={setInsightTemplateId}
            options={TEMPLATES.map((t) => ({ value: t.id, label: t.title }))}
          />
          <TextArea label="Paste the AI's answer" value={insightContent} onChange={setInsightContent} rows={6} />
          <button
            type="button"
            disabled={!insightContent.trim()}
            onClick={handleSaveInsight}
            className="rounded-xl bg-saffron px-4 py-2.5 text-[14px] font-bold text-white shadow-lg shadow-saffron/25 transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            Save to {selectedApp.company}
          </button>

          {selectedApp.insights && selectedApp.insights.length > 0 && (
            <div className="space-y-2 border-t border-line pt-3">
              <h4 className="text-[13px] font-semibold text-ink-soft">Saved insights</h4>
              {selectedApp.insights
                .slice()
                .reverse()
                .map((insight) => (
                  <Details key={insight.id} summary={`${insight.title} · ${formatSavedAt(insight.savedAt)}`}>
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{insight.content}</p>
                    <button
                      type="button"
                      onClick={() => handleDeleteInsight(insight.id)}
                      className="text-xs font-semibold text-alarm"
                    >
                      Delete
                    </button>
                  </Details>
                ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

function TemplateCard({
  template,
  ctx,
  copied,
  onCopy,
}: {
  template: PromptTemplate
  ctx: PromptContext
  copied: boolean
  onCopy: (prompt: string) => void
}) {
  const prompt = useMemo(() => template.build(ctx), [template, ctx])

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${CATEGORY_CLASS[template.category]}`}
          >
            {CATEGORY_LABEL[template.category]}
          </span>
          <h3 className="mt-1.5 text-[15px] font-bold leading-tight">{template.title}</h3>
        </div>
      </div>
      <p className="text-[13px] leading-snug text-ink-soft">{template.description}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => onCopy(prompt)}
          className="rounded-xl bg-saffron px-4 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-saffron/25 transition-transform active:scale-[0.98]"
        >
          {copied ? 'Copied ✓' : 'Copy prompt'}
        </button>
      </div>
      <Details summary="Preview prompt">
        <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap text-[12px] leading-relaxed text-ink-soft">
          {prompt}
        </pre>
      </Details>
    </Card>
  )
}

function formatSavedAt(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
