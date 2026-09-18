import 'dotenv/config'
import { eq } from 'drizzle-orm'

// Exercises the red-team service layer against the seeded demo engagement
// (seed-redteam.ts) and asserts the numbers the dashboards will show.
// Run: pnpm --filter @oreset/api exec tsx src/db/smoke-redteam.ts

async function main() {
  const { db } = await import('./client')
  const { users } = await import('./schema')
  const findings = await import('../modules/findings/findings.service')
  const operator = await import('../modules/operator/operator.service')

  const failures: string[] = []
  const check = (label: string, ok: boolean, got: unknown) => {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `  (got ${JSON.stringify(got)})`}`)
    if (!ok) failures.push(label)
  }

  const buyer = await db.query.users.findFirst({ where: eq(users.email, 'client@safaripay.demo') })
  const tester1 = await db.query.users.findFirst({ where: eq(users.email, 'tester-1@oreset.dev') })
  if (!buyer || !tester1) throw new Error('Seed users missing. Run seed-redteam.ts first.')

  // Client dashboard
  const client = await findings.getBuyerFindings(buyer.id)
  // Open P0 (25) + P1 in retest (15) count. Closed P1 and pending P2 do not.
  check('client score is 60', client.score === 60, client.score)
  check('client label is Significant risk', client.label === 'Significant risk', client.label)
  check('client open count is 2', client.counts.open === 2, client.counts)
  check('client closed count is 1', client.counts.closed === 1, client.counts)
  check('client pending verification is 1', client.counts.pendingVerification === 1, client.counts)
  check('client fix submitted is 1', client.counts.fixSubmitted === 1, client.counts)
  check('client findings list has 4 entries', client.findings.length === 4, client.findings.length)
  check('first finding is the P0', client.findings[0]?.severity === 'P0', client.findings[0]?.severity)
  check('severity-adjusted finding shows adjusted severity', client.findings.some((f) => f.verdict === 'severity_adjusted' && f.severity === 'P1'), null)
  check('breakdown by severity', client.breakdown.bySeverity.P0 === 1 && client.breakdown.bySeverity.P1 === 1, client.breakdown.bySeverity)

  // Lead auditor console: only the escalation is waiting (P2 exploit is below the bar)
  // Scope to the demo client: a shared dev database may hold other clients' escalations.
  const queue = (await findings.getVerificationQueue()).filter(
    (e) => (e.decision.clientItemSnapshot as { clientName?: string } | null)?.clientName === 'SafariPay support agent',
  )
  check('auditor queue has 1 SafariPay entry', queue.length === 1, queue.length)
  check('auditor queue entry is the escalation', queue[0]?.decision.decision === 'escalated', queue[0]?.decision.decision)
  const stats = await findings.getVerificationStats()
  check('verification stats total 3', stats.totalVerified === 3, stats)
  check('verification stats: 2 verified, 1 adjusted', stats.byVerdict.verified === 2 && stats.byVerdict.severity_adjusted === 1, stats.byVerdict)

  // Tester queue: two fresh scenarios plus one retest
  const testerQueue = await operator.getQueue(tester1.id)
  check('tester queue has 3 scenarios', testerQueue.length === 3, testerQueue.map((i) => i.externalRef))
  check('tester queue includes the retest', testerQueue.some((i) => (i.traceData as Record<string, unknown> | null)?.retestOf), null)

  const testerStats = await operator.getMyStats(tester1.id)
  check('tester 1 has 4 decisions', testerStats.reviewedAllTime === 4, testerStats.reviewedAllTime)
  check('tester 1 exploit rate 50%', testerStats.exploitRate === 50, testerStats.exploitRate)
  check('tester 1 has 1 open escalation ticket', testerStats.openTicketsFromMe === 1, testerStats.openTicketsFromMe)

  // Admin operations console
  const admin = await import('../modules/admin/admin.service')
  const overview = await admin.getOverview('admin')
  if (overview.role === 'admin') {
    check('admin overview: at least 1 finding awaiting verification', overview.findingsAwaitingVerification >= 1, overview.findingsAwaitingVerification)
    check('admin overview: at least 1 active client', overview.activeClients >= 1, overview.activeClients)
    check('admin overview: 1 finding in retest', overview.findingsInRetest === 1, overview.findingsInRetest)
    check('admin overview: 1 finding closed', overview.findingsClosed === 1, overview.findingsClosed)
    check('admin overview: retests queued is 1', overview.retestsQueued === 1, overview.retestsQueued)
    check('admin overview: needsAttention counts everything', overview.needsAttention >= overview.findingsAwaitingVerification + overview.openEscalations, overview.needsAttention)
  } else {
    check('admin overview returns admin role', false, overview.role)
  }
  const lead = await admin.getOverview('reviewer_lead')
  check('reviewer lead overview has verification count', lead.role === 'reviewer_lead' && lead.findingsAwaitingVerification >= 1, lead)

  // Owner's console
  const people = await import('../modules/admin/people.service')
  const directory = await people.listPeople()
  check('people directory lists the demo accounts', directory.filter((p) => p.email?.endsWith('@oreset.dev') || p.email === 'client@safaripay.demo').length >= 4, directory.length)
  check('people directory labels the lead auditor', directory.some((p) => p.email === 'lead-auditor@oreset.dev' && p.accessLabel === 'Lead auditor'), null)
  const clients = await people.listClients()
  const safaripay = clients.find((c) => c.email === 'client@safaripay.demo')
  check('clients list includes SafariPay', Boolean(safaripay), clients.map((c) => c.email))
  check('SafariPay resilience score is 60', safaripay?.resilienceScore === 60, safaripay?.resilienceScore)
  check('SafariPay has 10 scenarios', safaripay?.scenariosTotal === 10, safaripay?.scenariosTotal)
  if (overview.role === 'admin') {
    check('business numbers: at least 1 active client', overview.business.clientsActive >= 1, overview.business)
    check('business numbers: 1 engagement running', overview.business.engagementsRunning >= 1, overview.business)
  }

  // Leads: the two site forms post here. Create one, see it counted, close it.
  const leadsSvc = await import('../modules/leads/leads.service')
  const before = await leadsSvc.countNewLeads()
  const newLead = await leadsSvc.createLead({
    kind: 'pilot',
    name: 'Smoke Test',
    email: 'smoke@example.test',
    organization: 'Smoke Co',
    agentType: 'Customer support agent',
    message: 'Automated smoke check. Safe to close.',
  })
  check('lead created', Boolean(newLead.id), newLead)
  check('new leads count increments', (await leadsSvc.countNewLeads()) === before + 1, null)
  const closed = await leadsSvc.updateLead({ id: tester1.id, role: 'staff:admin' }, newLead.id, { status: 'closed', notes: 'smoke' })
  check('lead can be closed', closed.status === 'closed' && closed.notes === 'smoke', closed.status)

  // Client API tokens: created once with a plaintext, listed without it, revoked.
  const tokensSvc = await import('../modules/api-tokens/api-tokens.service')
  const created = await tokensSvc.createToken(buyer.id, { name: 'smoke ci', expiresInDays: 1 })
  check('api token plaintext has prefix', created.secret.startsWith('ort_'), created.secret.slice(0, 4))
  check('api token record carries no hash', !('tokenHash' in created.token), Object.keys(created.token))
  const listed = await tokensSvc.listTokens(buyer.id)
  check('api token appears in list', listed.some((t) => t.id === created.token.id), listed.length)
  const revoked = await tokensSvc.revokeToken(buyer.id, created.token.id)
  check('api token can be revoked', Boolean(revoked.revokedAt), revoked.revokedAt)

  console.log(failures.length === 0 ? '\nAll checks passed.' : `\n${failures.length} check(s) failed.`)
  process.exit(failures.length === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error('Smoke failed:', err)
  process.exit(1)
})
