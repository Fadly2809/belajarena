/**
 * Realtime Presentation Studio Engine
 * Mendukung sinkronisasi slide, web demo, live voting, dan laser pointer
 * Menggunakan Continuous Dual-Sync: HTTP Fast Polling (500ms) + SSE Push + BroadcastChannel
 */

import api from '@/services/api'

export interface SlideState {
  sessionId: string
  activeSlide: number
  totalSlides: number
  stateVersion?: number
  seq?: number
  isLocked: boolean
  timestamp: number
}

export interface ParticipantState {
  id: string
  studentId: string
  name: string
  nis: string
  classroom: string
  connectionStatus: 'connected' | 'syncing' | 'idle' | 'disconnected'
  lastAcknowledgedSlide: number
  hasAnsweredVote: boolean
  lastHeartbeat: number
}

export interface LiveVoteState {
  id: string
  sessionId: string
  slideNumber: number
  question: string
  type: 'single_choice' | 'multiple_choice' | 'yes_no' | 'true_false' | 'rating_scale' | 'short_text'
  options: { id: string; text: string; color?: string }[]
  isAnonymous: boolean
  allowChangeAnswer: boolean
  timeLimitSeconds: number | null
  status: 'draft' | 'open' | 'closed'
  responsesCount: number
  distribution: Record<string, number>
}

export interface WebDemoState {
  sessionId: string
  isActive: boolean
  url: string
  title?: string
  presetId?: string
  mode?: 'screen' | 'embed'
  allowStudentInteraction?: boolean
  timestamp: number
}

export interface LaserPointerState {
  active: boolean
  x: number // percentage 0 - 100
  y: number // percentage 0 - 100
  timestamp: number
}

const WEB_DEMO_STORAGE_PREFIX = 'agd_presentation_web_demo_'

export function saveWebDemoState(state: WebDemoState) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(WEB_DEMO_STORAGE_PREFIX + state.sessionId, JSON.stringify(state))
}

export function getWebDemoState(sessionId: string): WebDemoState | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(WEB_DEMO_STORAGE_PREFIX + sessionId)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function resolveSlideImageUrl(url?: string): string {
  if (!url) return ''
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url
  }
  const base = api.defaults.baseURL || '/api/v1'
  if (base.startsWith('http')) {
    const root = base.replace(/\/api\/v1\/?$/, '')
    return `${root}${url.startsWith('/') ? '' : '/'}${url}`
  }
  return url
}

export function preloadSlideImages(slides: Array<{ image?: string }>) {
  if (!Array.isArray(slides) || slides.length === 0) return
  slides.forEach((slide) => {
    if (slide && slide.image) {
      const fullUrl = resolveSlideImageUrl(slide.image)
      const img = new Image()
      img.src = fullUrl
    }
  })
}

class RealtimePresentationEngine {
  private channel: BroadcastChannel | null = null
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private eventSource: EventSource | null = null
  private pollTimer: any = null
  private currentSessionId: string | null = null
  private lastSinceTimestamp: number = 0
  private lastLaserTime: number = 0
  private isLaserInFlight: boolean = false
  private pendingLaserPayload: any = null
  private laserTimer: any = null
  private lastSeenVoteId: string | null = null
  private lastLaserTimestamp: number = 0
  private lastSeenWebDemoKey: string | null = null
  private isScreenFrameInFlight: boolean = false
  private pendingScreenFrame: any = null
  private lastFrameSeq: number = 0
  private currentPollIntervalMs: number = 500

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('agd_presentation_realtime')
      this.channel.onmessage = (event) => {
        const { type, payload } = event.data || {}
        if (type && this.listeners.has(type)) {
          this.listeners.get(type)?.forEach(cb => cb(payload))
        }
      }
    }
  }

  public subscribe(eventType: string, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)?.add(callback)
    return () => {
      this.listeners.get(eventType)?.delete(callback)
    }
  }

  public connectSession(sessionId: string, _role: 'teacher' | 'student' = 'student') {
    if (!sessionId) return
    if (this.currentSessionId === sessionId && this.pollTimer) {
      return
    }

    this.disconnectSession()
    this.currentSessionId = sessionId
    this.lastSinceTimestamp = Date.now() - 5000

    // 1. Jalankan Polling Cepat Aktif Secara Kontinu (Pondasi Utama yang 100% Reliabel)
    this.startPolling(sessionId)

    // 2. Pasang SSE untuk Push Instan jika didukung jaringan / browser
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        const apiBase = api.defaults.baseURL || '/api/v1'
        const sseUrl = `${apiBase}/presentation-sessions/${encodeURIComponent(sessionId)}/stream`
        this.eventSource = new EventSource(sseUrl, { withCredentials: true })

        this.eventSource.onopen = () => {
          // Dual-sync ultra-realtime: SSE push langsung + fast poll 350ms
          this.currentPollIntervalMs = 350
          if (this.pollTimer) {
            clearInterval(this.pollTimer)
            this.pollTimer = setInterval(() => {
              if (this.currentSessionId) this.pollSession(this.currentSessionId)
            }, this.currentPollIntervalMs)
          }
        }

        this.eventSource.onerror = () => {
          this.currentPollIntervalMs = 350
          if (this.pollTimer) {
            clearInterval(this.pollTimer)
            this.pollTimer = setInterval(() => {
              if (this.currentSessionId) this.pollSession(this.currentSessionId)
            }, this.currentPollIntervalMs)
          }
        }

        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'INIT_SYNC' && data.payload) {
              const p = data.payload
              if (p.activeSlide !== undefined) {
                this.dispatchLocal('SLIDE_CHANGED', {
                  sessionId,
                  activeSlide: p.activeSlide,
                  totalSlides: p.totalSlides || 5,
                  isLocked: Boolean(p.isLocked),
                  timestamp: Date.now()
                })
              }
              if (p.laserPointer && (p.laserPointer.timestamp || 0) >= this.lastLaserTimestamp) {
                this.lastLaserTimestamp = p.laserPointer.timestamp || Date.now()
                this.dispatchLocal('LASER_POINTER', p.laserPointer)
              }
              if (p.webDemo) {
                const demoKey = `${Boolean(p.webDemo.isActive)}_${p.webDemo.url || ''}_${p.webDemo.timestamp || 0}_${p.webDemo.mode || 'embed'}`
                this.lastSeenWebDemoKey = demoKey
                this.dispatchLocal('WEB_DEMO_CHANGED', p.webDemo)
              }
              if (p.screenFrame) {
                this.dispatchLocal('WEB_SCREEN_FRAME', p.screenFrame)
              }
              if (p.activeVote !== undefined) {
                if (p.activeVote && p.activeVote.status === 'open') {
                  if (p.activeVote.id !== this.lastSeenVoteId) {
                    this.lastSeenVoteId = p.activeVote.id
                    this.dispatchLocal('VOTE_OPENED', p.activeVote)
                  }
                } else {
                  if (this.lastSeenVoteId) {
                    this.lastSeenVoteId = null
                    this.dispatchLocal('VOTE_CLOSED', p.activeVote || null)
                  }
                }
                this.dispatchLocal('VOTE_STATE', p.activeVote || null)
              }
              if (Array.isArray(p.participants)) this.dispatchLocal('PARTICIPANTS_SYNC', p.participants)
            } else if (data.type && data.payload !== undefined) {
              if (data.type === 'LASER_POINTER') {
                this.dispatchLocal('LASER_POINTER', data.payload)
              } else if (data.type === 'WEB_DEMO_CHANGED') {
                const d = data.payload
                const demoKey = d ? `${Boolean(d.isActive)}_${d.url || ''}_${d.timestamp || 0}_${d.mode || 'embed'}` : 'inactive'
                this.lastSeenWebDemoKey = demoKey
                this.dispatchLocal(data.type, data.payload)
              } else {
                this.dispatchLocal(data.type, data.payload)
              }
            }
          } catch (_) {}
        }
      } catch (e) {
        console.warn('SSE push fallback:', e)
      }
    }
  }

  private startPolling(sessionId: string) {
    if (this.pollTimer) clearInterval(this.pollTimer)
    // Langsung eksekusi 1x di awal
    this.pollSession(sessionId)
    this.pollTimer = setInterval(() => {
      this.pollSession(sessionId)
    }, 350)
  }

  private async pollSession(sessionId: string) {
    if (!sessionId) return
    try {
      const res = await api.get(`/presentation-sessions/${sessionId}/poll?since=${this.lastSinceTimestamp}&last_frame_seq=${this.lastFrameSeq}`)
      const data = res.data?.data
      if (data) {
        if (data.server_time) this.lastSinceTimestamp = data.server_time
        if (data.frame_seq !== undefined) this.lastFrameSeq = Number(data.frame_seq)

        // 0. Deteksi transisi jika server mengalihkan sesi ke sesi aktif baru
        if (data.sessionId && this.currentSessionId && data.sessionId !== this.currentSessionId) {
          const oldSessionId = this.currentSessionId
          this.currentSessionId = data.sessionId
          this.dispatchLocal('SESSION_TRANSITION', { oldSessionId, newSessionId: data.sessionId })
        }

        // 0b. Deteksi jika sesi ini telah selesai / diakhiri oleh guru
        if (data.sessionStatus === 'completed' || data.sessionStatus === 'ended') {
          this.dispatchLocal('SESSION_ENDED', { sessionId })
        }

        // 1. Rekonsiliasi Slide Terkini
        if (data.activeSlide !== undefined) {
          this.dispatchLocal('SLIDE_CHANGED', {
            sessionId,
            activeSlide: Number(data.activeSlide),
            totalSlides: Number(data.totalSlides || 5),
            isLocked: Boolean(data.isLocked),
            timestamp: data.server_time || Date.now()
          })
        }

        // 2. Rekonsiliasi Laser Pointer
        if (data.laserPointer) {
          this.dispatchLocal('LASER_POINTER', data.laserPointer)
        }

        // 3. Rekonsiliasi Siaran Web Demo (Hanya jika state-nya benar-benar berubah, cegah reload loop!)
        if (data.webDemo !== undefined) {
          const currentDemo = data.webDemo || { isActive: false, url: '' }
          const demoKey = `${Boolean(currentDemo.isActive)}_${currentDemo.url || ''}_${currentDemo.timestamp || 0}_${currentDemo.mode || 'embed'}`
          if (demoKey !== this.lastSeenWebDemoKey) {
            this.lastSeenWebDemoKey = demoKey
            this.dispatchLocal('WEB_DEMO_CHANGED', currentDemo)
          }
        }

        // 3b. Screen Frame (hanya kirim update jika ada frame baru, skip jika frame_unchanged)
        if (data.screenFrame) {
          this.dispatchLocal('WEB_SCREEN_FRAME', data.screenFrame)
        }

        // 4. Rekonsiliasi Status Live Voting & Distribusi Suara
        if (data.activeVote !== undefined) {
          if (data.activeVote && data.activeVote.status === 'open') {
            if (data.activeVote.id !== this.lastSeenVoteId) {
              this.lastSeenVoteId = data.activeVote.id
              this.dispatchLocal('VOTE_OPENED', data.activeVote)
            }
          } else {
            if (this.lastSeenVoteId) {
              this.lastSeenVoteId = null
              this.dispatchLocal('VOTE_CLOSED', data.activeVote || null)
            }
          }
          this.dispatchLocal('VOTE_STATE', data.activeVote || null)
        }

        // 5. Rekonsiliasi Seluruh Partisipan Siswa
        if (Array.isArray(data.participants)) {
          this.dispatchLocal('PARTICIPANTS_SYNC', data.participants)
        }

        // 6. Rekonsiliasi Riwayat Polling
        if (Array.isArray(data.votes)) {
          this.dispatchLocal('VOTES_SYNC', data.votes)
        }

        // 7. Dispatch event delta yang belum terbaca
        if (Array.isArray(data.events) && data.events.length > 0) {
          for (const ev of data.events) {
            this.dispatchLocal(ev.type, ev.payload)
          }
        }
      }
    } catch (_) {}
  }

  public disconnectSession() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
    this.currentSessionId = null
    this.lastSeenVoteId = null
    this.lastLaserTimestamp = 0
    this.lastSeenWebDemoKey = null
    this.pendingLaserPayload = null
    this.lastFrameSeq = 0
    if (this.laserTimer) {
      clearTimeout(this.laserTimer)
      this.laserTimer = null
    }
  }

  private dispatchLocal(eventType: string, payload: any) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType)?.forEach(cb => cb(payload))
    }
  }

  public async sendScreenFrame(frameData: string | null): Promise<void> {
    this.dispatchLocal('WEB_SCREEN_FRAME', frameData)
    if (!this.currentSessionId) return
    try {
      await api.post(`/presentation-sessions/${this.currentSessionId}/screen-frame`, {
        frame: frameData
      })
    } catch (_) {}
  }

  public broadcast(eventType: string, payload: any) {
    // 1. Dispatch lokal
    this.dispatchLocal(eventType, payload)

    // 2. Dispatch BroadcastChannel (antar-tab di komputer yang sama)
    if (this.channel) {
      try {
        this.channel.postMessage({ type: eventType, payload })
      } catch (_) {}
    }

    // 3. Kirim ke Backend API untuk sinkronisasi antar-perangkat (Guru <-> HP Siswa)
    if (this.currentSessionId) {
      // Throttle laser pointer responsif (~28fps / 35ms) fire-and-forget tanpa macet
      if (eventType === 'LASER_POINTER') {
        const now = Date.now()
        if (now - this.lastLaserTime < 35 && payload?.active) {
          return
        }
        this.lastLaserTime = now

        api.post(`/presentation-sessions/${this.currentSessionId}/events`, {
          type: 'LASER_POINTER',
          payload
        }).catch(() => {})
        return
      }

      if (eventType === 'WEB_SCREEN_FRAME') {
        this.sendScreenFrame(payload)
        return
      }

      api.post(`/presentation-sessions/${this.currentSessionId}/events`, {
        type: eventType,
        payload
      }).catch(err => {
        console.warn('Gagal broadcast event presentasi ke server:', err)
      })
    }
  }

  public close() {
    this.disconnectSession()
    if (this.channel) {
      this.channel.close()
      this.channel = null
    }
    this.listeners.clear()
  }
}

export const presentationRealtime = new RealtimePresentationEngine()
