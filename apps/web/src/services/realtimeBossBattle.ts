export type BossBattleRealtimeEvent =
  | 'boss.hp.updated'
  | 'boss.hit.visual'
  | 'boss.defeated'
  | 'boss.victory'
  | 'student.score.updated'
  | 'session.state'
  | 'mvp.ready'
  | 'preview.only'
  | 'battle.started'
  | 'session.stopped'
  | 'session.cleared'


class RealtimeBossBattleEngine {
  private channel: BroadcastChannel | null = null
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map()

  constructor() {
    if (typeof window !== 'undefined') {
      if ('BroadcastChannel' in window) {
        try {
          this.channel = new BroadcastChannel('agd_boss_battle_realtime')
          this.channel.onmessage = (event) => {
            const { type, payload } = event.data || {}
            if (type && this.listeners.has(type)) {
              this.listeners.get(type)?.forEach((cb) => cb(payload))
            }
          }
        } catch (err) {
          console.warn('BroadcastChannel not available, using storage fallback:', err)
        }
      }

      // Storage event fallback for cross-tab sync
      window.addEventListener('storage', (event) => {
        if (event.key === 'agd_boss_battle_event' && event.newValue) {
          try {
            const { type, payload } = JSON.parse(event.newValue)
            if (type && this.listeners.has(type)) {
              this.listeners.get(type)?.forEach((cb) => cb(payload))
            }
          } catch {
            // Ignore parse errors
          }
        }
      })
    }
  }

  subscribe(eventType: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(eventType)) this.listeners.set(eventType, new Set())
    this.listeners.get(eventType)?.add(callback)
    return () => this.listeners.get(eventType)?.delete(callback)
  }

  broadcast(eventType: string, payload: unknown) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType)?.forEach((cb) => cb(payload))
    }
    if (this.channel) {
      try {
        const safePayload = payload !== undefined ? JSON.parse(JSON.stringify(payload)) : payload
        this.channel.postMessage({ type: eventType, payload: safePayload })
      } catch (err) {
        console.warn('Boss battle broadcast error:', err)
      }
    }
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(
          'agd_boss_battle_event',
          JSON.stringify({ type: eventType, payload, _ts: Date.now() })
        )
      } catch {
        // Storage quota / privacy mode fallback
      }
    }
  }
}

export const realtimeBossBattle = new RealtimeBossBattleEngine()

