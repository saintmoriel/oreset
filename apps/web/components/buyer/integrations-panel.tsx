'use client'

import { useState } from 'react'
import { Copy, KeyRound, Loader2, Plus, RefreshCw, Trash2, Webhook, Power } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api/client'
import { StatusTag } from '@/components/capture/status-tag'
import { toast } from '@/components/ui/toast'
import {
  WEBHOOK_EVENTS,
  listApiTokens, createApiToken, revokeApiToken,
  listWebhooks, createWebhook, updateWebhook, deleteWebhook, rotateWebhookSecret,
} from '@/lib/api/endpoints/integrations'
import type { ApiToken, WebhookConfig } from '@/lib/api/endpoints/integrations'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.oreset.africa'
const input = 'cx-body w-full rounded-lg border border-border bg-card px-3 py-2 text-navy-800 placeholder:text-navy-300 focus:border-accent/50 focus:outline-none'

function Secret({ label, value, hint, onDone }: { label: string; value: string; hint: string; onDone: () => void }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="rounded-lg border border-warning/40 bg-warning/5 p-4">
      <p className="cx-meta font-semibold text-warning">{label}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <code className="break-all rounded bg-card px-3 py-1.5 font-mono text-sm text-navy-900">{value}</code>
        <button type="button" onClick={() => { void navigator.clipboard.writeText(value); setCopied(true) }} className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 cx-meta font-semibold text-navy-700 hover:bg-navy-50">
          <Copy className="size-3.5" /> {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="cx-meta mt-2 text-navy-600">{hint}</p>
      <button type="button" onClick={onDone} className="cx-meta mt-2 font-semibold text-navy-500 hover:text-navy-800">Done, hide it</button>
    </div>
  )
}

function TokensSection({ initial }: { initial: ApiToken[] }) {
  const [tokens, setTokens] = useState(initial)
  const [name, setName] = useState('')
  const [expires, setExpires] = useState<'never' | '90' | '365'>('365')
  const [busy, setBusy] = useState(false)
  const [secret, setSecret] = useState<{ name: string; value: string } | null>(null)

  async function refresh() { setTokens((await listApiTokens()).tokens) }

  async function create() {
    setBusy(true)
    try {
      const res = await createApiToken({ name, expiresInDays: expires === 'never' ? undefined : Number(expires) })
      setSecret({ name, value: res.secret })
      toast.success('Token created', 'Copy it now. It will not be shown again.')
      setName('')
      await refresh()
    } catch (err) {
      toast.error('Token not created', err instanceof ApiError ? err.message : undefined)
    }
    setBusy(false)
  }

  async function revoke(t: ApiToken) {
    if (!confirm(`Revoke "${t.name}"? Anything using it stops working immediately.`)) return
    setBusy(true)
    try {
      await revokeApiToken(t.id)
      toast.success('Token revoked', t.name)
      await refresh()
    } catch (err) {
      toast.error('Could not revoke', err instanceof ApiError ? err.message : undefined)
    }
    setBusy(false)
  }

  const active = tokens.filter((t) => !t.revokedAt)
  const example = `curl -H "Authorization: Bearer ${secret?.value ?? 'ort_...'}" \\\n  "${API_BASE}/api/v1/buyer/regressions?format=jsonl" \\\n  -o oreset-regressions.jsonl`

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <KeyRound className="size-4 text-accent" />
        <h2 className="cx-title text-navy-900">API tokens</h2>
      </div>
      <p className="cx-meta text-navy-500">
        Read-only. A token can pull your scenarios, findings, and regression suite. It cannot change anything, create webhooks, or mint other tokens.
      </p>

      {secret ? (
        <Secret label={`Token "${secret.name}"`} value={secret.value} hint="Shown once. Store it in your CI secrets, not in the repository." onDone={() => setSecret(null)} />
      ) : (
        <div className="cx-card flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-[14rem] flex-1">
            <label className="cx-meta mb-1 block font-medium text-navy-500">Token name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. GitHub Actions, main pipeline" className={input} />
          </div>
          <div>
            <label className="cx-meta mb-1 block font-medium text-navy-500">Expires</label>
            <select value={expires} onChange={(e) => setExpires(e.target.value as typeof expires)} className={input}>
              <option value="90">In 90 days</option>
              <option value="365">In a year</option>
              <option value="never">Never</option>
            </select>
          </div>
          <button type="button" disabled={busy || !name.trim()} onClick={create} className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 cx-body font-semibold text-white hover:bg-accent/90 disabled:opacity-50">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Create token
          </button>
        </div>
      )}

      <div className="rounded-lg border border-border bg-navy-50/60 p-4">
        <p className="cx-meta font-semibold text-navy-600">Pull the regression suite in CI</p>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-navy-800">{example}</pre>
        <p className="cx-meta mt-2 text-navy-500">Replay each <span className="font-mono">attack_prompt</span> against your agent and fail the build if a closed finding lands again.</p>
      </div>

      {active.length === 0 ? (
        <p className="cx-meta text-navy-400">No active tokens.</p>
      ) : (
        <div className="cx-card divide-y divide-border">
          {active.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="cx-body font-medium text-navy-900">{t.name}</p>
                <p className="cx-mono-meta mt-0.5 text-navy-400">
                  {t.tokenPrefix}… · created {new Date(t.createdAt).toLocaleDateString()}
                  {t.lastUsedAt ? ` · last used ${new Date(t.lastUsedAt).toLocaleDateString()}` : ' · never used'}
                  {t.expiresAt ? ` · expires ${new Date(t.expiresAt).toLocaleDateString()}` : ''}
                </p>
              </div>
              <button type="button" disabled={busy} onClick={() => revoke(t)} className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-3 py-1.5 cx-meta font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-50">
                <Trash2 className="size-3.5" /> Revoke
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function WebhooksSection({ initial }: { initial: WebhookConfig[] }) {
  const [webhooks, setWebhooks] = useState(initial)
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [events, setEvents] = useState<string[]>(['finding.verified', 'finding.closed', 'finding.reopened'])
  const [busy, setBusy] = useState(false)
  const [secret, setSecret] = useState<{ url: string; value: string } | null>(null)

  async function refresh() { setWebhooks((await listWebhooks()).webhooks) }

  async function create() {
    setBusy(true)
    try {
      const res = await createWebhook({ url, events, description: description || undefined })
      setSecret({ url, value: res.webhook.secret })
      toast.success('Webhook created', 'Copy the signing secret now.')
      setUrl(''); setDescription(''); setOpen(false)
      await refresh()
    } catch (err) {
      toast.error('Webhook not created', err instanceof ApiError ? err.message : undefined)
    }
    setBusy(false)
  }

  async function toggle(w: WebhookConfig) {
    setBusy(true)
    try {
      await updateWebhook(w.id, { active: !w.active })
      toast.success(w.active ? 'Webhook paused' : 'Webhook resumed', w.url)
      await refresh()
    } catch (err) { toast.error('Could not update webhook', err instanceof ApiError ? err.message : undefined) }
    setBusy(false)
  }

  async function rotate(w: WebhookConfig) {
    setBusy(true)
    try {
      const res = await rotateWebhookSecret(w.id)
      setSecret({ url: w.url, value: res.webhook.secret })
      toast.success('Secret rotated', 'Update your receiver before the next event.')
      await refresh()
    } catch (err) { toast.error('Could not rotate secret', err instanceof ApiError ? err.message : undefined) }
    setBusy(false)
  }

  async function remove(w: WebhookConfig) {
    if (!confirm(`Delete the webhook for ${w.url}?`)) return
    setBusy(true)
    try {
      await deleteWebhook(w.id)
      toast.success('Webhook deleted', w.url)
      await refresh()
    } catch (err) { toast.error('Could not delete webhook', err instanceof ApiError ? err.message : undefined) }
    setBusy(false)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Webhook className="size-4 text-accent" />
        <h2 className="cx-title text-navy-900">Webhooks</h2>
      </div>
      <p className="cx-meta text-navy-500">
        We POST a JSON body to your URL on each selected event, signed with <span className="font-mono">X-Oreset-Signature</span> (HMAC SHA-256 of the body using your secret). Point it at Slack, Jira, PagerDuty, or your own service.
      </p>

      {secret && (
        <Secret label={`Signing secret for ${secret.url}`} value={secret.value} hint="Shown once. Verify every delivery against it." onDone={() => setSecret(null)} />
      )}

      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="cx-card flex w-full items-center justify-center gap-2 p-4 text-accent hover:bg-accent/5 cx-fade">
          <Plus className="size-4" /> <span className="cx-body font-semibold">Add a webhook</span>
        </button>
      ) : (
        <div className="cx-card space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="cx-meta mb-1 block font-medium text-navy-500">Endpoint URL</label>
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://hooks.example.com/oreset" className={cn(input, 'font-mono')} />
            </div>
            <div>
              <label className="cx-meta mb-1 block font-medium text-navy-500">Description (optional)</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. #security-alerts in Slack" className={input} />
            </div>
          </div>
          <div>
            <p className="cx-meta mb-1.5 font-medium text-navy-500">Events</p>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {WEBHOOK_EVENTS.map((e) => (
                <label key={e.key} className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
                  <input type="checkbox" checked={events.includes(e.key)} onChange={(ev) => setEvents((prev) => ev.target.checked ? [...prev, e.key] : prev.filter((k) => k !== e.key))} className="rounded border-border" />
                  <span className="cx-meta text-navy-800">{e.label}</span>
                  <span className="ml-auto font-mono text-[10px] text-navy-400">{e.key}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-border px-4 py-2 cx-meta font-semibold text-navy-600 hover:bg-navy-50">Cancel</button>
            <button type="button" disabled={busy || !/^https?:\/\//.test(url) || events.length === 0} onClick={create} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 cx-body font-semibold text-white hover:bg-accent/90 disabled:opacity-50">
              {busy && <Loader2 className="size-4 animate-spin" />} Create webhook
            </button>
          </div>
        </div>
      )}

      {webhooks.length === 0 ? (
        <p className="cx-meta text-navy-400">No webhooks yet.</p>
      ) : (
        <div className="cx-card divide-y divide-border">
          {webhooks.map((w) => (
            <div key={w.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="cx-body break-all font-mono text-sm text-navy-900">{w.url}</p>
                    {w.active ? <StatusTag tone="success">Active</StatusTag> : <StatusTag tone="neutral">Paused</StatusTag>}
                  </div>
                  {w.description && <p className="cx-meta mt-0.5 text-navy-500">{w.description}</p>}
                  <p className="cx-mono-meta mt-1 text-navy-400">
                    {w.events.join(', ')}
                    {w.lastTriggeredAt ? ` · last delivery ${new Date(w.lastTriggeredAt).toLocaleString()} (${w.lastStatus ?? 'no status'})` : ' · never triggered'}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button type="button" disabled={busy} onClick={() => toggle(w)} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 cx-meta font-semibold text-navy-700 hover:bg-navy-50 disabled:opacity-50">
                    <Power className="size-3.5" /> {w.active ? 'Pause' : 'Resume'}
                  </button>
                  <button type="button" disabled={busy} onClick={() => rotate(w)} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 cx-meta font-semibold text-navy-700 hover:bg-navy-50 disabled:opacity-50">
                    <RefreshCw className="size-3.5" /> Rotate secret
                  </button>
                  <button type="button" disabled={busy} onClick={() => remove(w)} className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-3 py-1.5 cx-meta font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-50">
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export function IntegrationsPanel({ initialTokens, initialWebhooks }: { initialTokens: ApiToken[]; initialWebhooks: WebhookConfig[] }) {
  return (
    <div className="mt-6 space-y-10">
      <TokensSection initial={initialTokens} />
      <WebhooksSection initial={initialWebhooks} />
    </div>
  )
}
