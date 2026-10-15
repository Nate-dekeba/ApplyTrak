/**
 * URL import — fetches a job posting page server-side and extracts
 * title/company/location/description from schema.org JobPosting JSON-LD,
 * falling back to OpenGraph/meta tags.
 *
 * safeFetchHtml is the security-sensitive half: it fetches a URL supplied
 * by the user, which is a classic SSRF vector (could otherwise be used to
 * probe internal services or cloud metadata endpoints). It validates the
 * resolved IP of the host — and of every redirect hop — against private/
 * reserved ranges before connecting, disables automatic redirects so each
 * hop can be re-validated, and bounds both time and response size.
 */
import dns from 'node:dns'
import { promisify } from 'node:util'
import * as cheerio from 'cheerio'

const dnsLookup = promisify(dns.lookup)

const MAX_RESPONSE_BYTES = 3 * 1024 * 1024 // 3MB — generous for a career page, not for arbitrary payloads
const FETCH_TIMEOUT_MS = 8000
const MAX_REDIRECTS = 3
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

function isPrivateIPv4(ip) {
    const parts = ip.split('.').map(Number)
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true // malformed -> treat as unsafe
    const [a, b, c] = parts
    if (a === 0) return true                           // 0.0.0.0/8
    if (a === 10) return true                           // 10.0.0.0/8
    if (a === 127) return true                          // 127.0.0.0/8 loopback
    if (a === 100 && b >= 64 && b <= 127) return true    // 100.64.0.0/10 CGNAT
    if (a === 169 && b === 254) return true              // 169.254.0.0/16 link-local (covers 169.254.169.254 cloud metadata)
    if (a === 172 && b >= 16 && b <= 31) return true      // 172.16.0.0/12
    if (a === 192 && b === 168) return true               // 192.168.0.0/16
    if (a === 192 && b === 0 && c === 2) return true       // 192.0.2.0/24 documentation
    if (a >= 224) return true                             // multicast/reserved
    return false
}

function isPrivateIPv6(ip) {
    const lower = ip.toLowerCase()
    if (lower === '::1' || lower === '::') return true
    if (lower.startsWith('::ffff:')) {
        const embedded = lower.slice('::ffff:'.length)
        if (embedded.includes('.')) return isPrivateIPv4(embedded)
    }
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true // fc00::/7 unique local
    if (/^fe[89ab]/.test(lower)) return true                          // fe80::/10 link-local
    return false
}

export function isPrivateAddress(ip, family) {
    return family === 6 || ip.includes(':') ? isPrivateIPv6(ip) : isPrivateIPv4(ip)
}

async function isHostSafe(hostname) {
    let results
    try {
        results = await dnsLookup(hostname, { all: true })
    } catch {
        return false // unresolvable -> treat as unsafe
    }
    if (!results.length) return false
    return results.every((r) => !isPrivateAddress(r.address, r.family))
}

// Fetches a URL with SSRF guards. Returns { html, finalUrl } on success, or
// null on any failure — callers treat null as "couldn't extract," not an error.
export async function safeFetchHtml(inputUrl) {
    let currentUrl = inputUrl

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
        let parsed
        try {
            parsed = new URL(currentUrl)
        } catch {
            return null
        }
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null

        if (!(await isHostSafe(parsed.hostname))) {
            console.warn('urlImport: blocked unsafe host', parsed.hostname)
            return null
        }

        let res
        try {
            res = await fetch(currentUrl, {
                redirect: 'manual',
                signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
                headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
            })
        } catch (err) {
            console.warn('urlImport: fetch failed for', currentUrl, '-', err.message)
            return null
        }

        if ([301, 302, 303, 307, 308].includes(res.status)) {
            const location = res.headers.get('location')
            if (!location) return null
            try {
                currentUrl = new URL(location, currentUrl).toString()
            } catch {
                return null
            }
            continue // re-validate the new host next loop iteration
        }

        if (!res.ok) {
            console.warn('urlImport: non-OK response', res.status, 'for', currentUrl)
            return null
        }

        const contentType = res.headers.get('content-type') || ''
        if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
            return null
        }

        const reader = res.body?.getReader()
        if (!reader) return null

        const decoder = new TextDecoder()
        let html = ''
        let bytes = 0
        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            bytes += value.byteLength
            if (bytes > MAX_RESPONSE_BYTES) {
                reader.cancel()
                break
            }
            html += decoder.decode(value, { stream: true })
        }

        return { html, finalUrl: currentUrl }
    }

    return null // too many redirects
}

function stripHtml(str) {
    if (!str) return ''
    return cheerio.load(str).text().replace(/\s+/g, ' ').trim()
}

function truncate(str, max) {
    return str.length > max ? str.slice(0, max).trim() + '…' : str
}

function findJobPosting($) {
    let jobPosting = null

    $('script[type="application/ld+json"]').each((_, el) => {
        if (jobPosting) return
        let data
        try {
            data = JSON.parse($(el).html())
        } catch {
            return
        }
        const candidates = Array.isArray(data) ? data : Array.isArray(data?.['@graph']) ? data['@graph'] : [data]
        for (const candidate of candidates) {
            const types = Array.isArray(candidate?.['@type']) ? candidate['@type'] : [candidate?.['@type']]
            if (types.includes('JobPosting')) {
                jobPosting = candidate
                break
            }
        }
    })

    return jobPosting
}

// Bot-protection vendors commonly respond 200 OK with a normal HTML page
// (a CAPTCHA/challenge page) rather than a 4xx/5xx — content-type and status
// checks in safeFetchHtml don't catch this. Recognize the common ones so we
// don't "successfully" extract a block page's title as if it were job data.
const BLOCK_PAGE_SIGNATURES = [
    'radware', 'shieldsquare', 'perfdrive.com',
    'captcha-delivery.com', // DataDome
    'distil_r_captcha', 'incapsula incident id', 'request unsuccessful. incapsula', // Imperva/Incapsula
    'px-captcha', // PerimeterX/HUMAN
    'checking your browser before accessing', 'cf-chl', 'cf_chl', 'just a moment...', 'attention required', // Cloudflare
    'are you a human', 'pardon our interruption', 'please verify you are a human',
    'robot check', // Amazon
    'bot detection', 'access denied',
]

function isBotChallengePage(html, title) {
    const haystack = `${title} ${html.slice(0, 8000)}`.toLowerCase()
    return BLOCK_PAGE_SIGNATURES.some((sig) => haystack.includes(sig))
}

function formatSalaryLine(jobPosting) {
    const salary = jobPosting.baseSalary?.value
    if (!salary || typeof salary !== 'object') return ''
    const { minValue, maxValue, unitText } = salary
    if (!minValue && !maxValue) return ''
    const currency = jobPosting.baseSalary.currency || 'USD'
    const range = minValue && maxValue ? `${minValue}–${maxValue}` : minValue || maxValue
    return `Salary: ${currency} ${range}${unitText ? '/' + String(unitText).toLowerCase() : ''}`
}

// Returns { title, company, location, notes } or null if nothing usable was found.
export function extractJobFromHtml(html) {
    const $ = cheerio.load(html)

    if (isBotChallengePage(html, $('title').text())) return null

    const jobPosting = findJobPosting($)

    if (jobPosting) {
        const title = typeof jobPosting.title === 'string' ? jobPosting.title.trim() : ''
        if (!title) return null // a JobPosting without even a title isn't useful

        const company = typeof jobPosting.hiringOrganization?.name === 'string'
            ? jobPosting.hiringOrganization.name.trim()
            : ''

        const jobLocation = Array.isArray(jobPosting.jobLocation) ? jobPosting.jobLocation[0] : jobPosting.jobLocation
        const address = jobLocation?.address
        let location = address
            ? [address.addressLocality, address.addressRegion].filter(Boolean).join(', ')
            : ''
        if (!location && jobPosting.jobLocationType === 'TELECOMMUTE') location = 'Remote'

        const salaryLine = formatSalaryLine(jobPosting)
        const description = truncate(stripHtml(jobPosting.description), 600)
        const notes = [salaryLine, description].filter(Boolean).join('\n\n')

        return { title, company, location, notes }
    }

    // Fallback: OpenGraph / basic meta tags
    const title = ($('meta[property="og:title"]').attr('content') || $('title').text() || '').trim()
    if (!title) return null

    const company = ($('meta[property="og:site_name"]').attr('content') || '').trim()
    const notes = truncate(($('meta[property="og:description"]').attr('content') || '').trim(), 600)

    return { title, company, location: '', notes }
}
