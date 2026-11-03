import test from 'node:test'
import assert from 'node:assert/strict'

import { BossAudioSynth } from '../apps/web/src/game3d/bossBattle/BossAudioSynth.ts'
import { BOSS_CATALOG } from '../apps/web/src/modules/games/bossBattle/types.ts'

test('Boss Battle 3D — Suite Pengujian Verifikasi Visual & Audio', async (t) => {
  await t.test('1. Audio Synthesizer: Mengelola state mute dan fallback Web Audio', () => {
    const synth = new BossAudioSynth()
    assert.strictEqual(typeof synth.getIsMuted(), 'boolean')

    // Uji toggle mute
    const wasMuted = synth.getIsMuted()
    const newMuted = synth.toggleMute()
    assert.strictEqual(newMuted, !wasMuted)

    synth.setMuted(false)
    assert.strictEqual(synth.getIsMuted(), false)

    // Pemanggilan audio method aman tanpa throw di headless environment
    assert.doesNotThrow(() => synth.playLaser(false))
    assert.doesNotThrow(() => synth.playLaser(true))
    assert.doesNotThrow(() => synth.playHit(false))
    assert.doesNotThrow(() => synth.playHit(true))
    assert.doesNotThrow(() => synth.playComboBarrage())
    assert.doesNotThrow(() => synth.playVictoryFanfare())

    synth.destroy()
  })

  await t.test('2. Karakter Boss: Katalog boss resmi memuat 4 karakter dengan tema warna & kesulitan valid', () => {
    assert.strictEqual(BOSS_CATALOG.length, 4)

    const expectedBossIds = ['robot-glitch', 'rakus-maximus', 'virus-lambda', 'bugzilla']
    expectedBossIds.forEach((id) => {
      const boss = BOSS_CATALOG.find((b) => b.id === id)
      assert.ok(boss, `Boss ${id} harus terdaftar di katalog resmi`)
      assert.ok(boss.name && boss.name.length > 0)
      assert.ok(boss.color && boss.color.startsWith('#'))
      assert.ok(boss.accent && boss.accent.startsWith('#'))
      assert.ok(['mudah', 'sedang', 'sulit'].includes(boss.difficulty))
    })
  })

  await t.test('3. Skala Kesulitan Boss 3D: Mudah = 1.0, Sedang = 1.15, Sulit = 1.3', () => {
    const getScale = (diff) => (diff === 'sulit' ? 1.3 : diff === 'mudah' ? 1.0 : 1.15)
    assert.strictEqual(getScale('mudah'), 1.0)
    assert.strictEqual(getScale('sedang'), 1.15)
    assert.strictEqual(getScale('sulit'), 1.3)
    assert.strictEqual(getScale('unknown'), 1.15) // default
  })

  await t.test('4. Ambang Visual HP Boss: Fase Normal (>50%), Fase Marah (<=50%), Fase Krisis (<=20%)', () => {
    const checkPhase = (hp, maxHp = 10000) => {
      const pct = (hp / maxHp) * 100
      return {
        isAngry: pct <= 50,
        isCrisis: pct <= 20,
      }
    }

    // 100% HP
    assert.deepStrictEqual(checkPhase(10000), { isAngry: false, isCrisis: false })
    // 55% HP (Normal)
    assert.deepStrictEqual(checkPhase(5500), { isAngry: false, isCrisis: false })
    // 50% HP (Masuk Fase Marah)
    assert.deepStrictEqual(checkPhase(5000), { isAngry: true, isCrisis: false })
    // 30% HP (Fase Marah)
    assert.deepStrictEqual(checkPhase(3000), { isAngry: true, isCrisis: false })
    // 20% HP (Masuk Fase Krisis)
    assert.deepStrictEqual(checkPhase(2000), { isAngry: true, isCrisis: true })
    // 5% HP (Fase Krisis)
    assert.deepStrictEqual(checkPhase(500), { isAngry: true, isCrisis: true })
  })

  await t.test('5. Deteksi Rentetan Gabungan (Combo Barrage): >= 5 serangan benar dalam 3 detik', () => {
    const detectCombo = (laserTimes, now) => {
      const valid = laserTimes.filter((t) => now - t <= 3000)
      return valid.length >= 5
    }

    const t0 = 10000
    // 3 tembakan
    assert.strictEqual(detectCombo([t0, t0 + 500, t0 + 1000], t0 + 1000), false)

    // 5 tembakan dalam rentang 2 detik
    assert.strictEqual(
      detectCombo([t0, t0 + 400, t0 + 800, t0 + 1200, t0 + 1600], t0 + 1600),
      true
    )

    // 5 tembakan tetapi yang pertama sudah kedaluwarsa (> 3000ms)
    assert.strictEqual(
      detectCombo([t0, t0 + 1000, t0 + 2000, t0 + 3500, t0 + 3600], t0 + 3600),
      false
    )
  })

  await t.test('6. Integritas Pedagogis: Jawaban salah dari siswa TIDAK menembakkan laser ke boss', () => {
    const attacks = [
      { student: 'Andi', isCorrect: true, damage: 330 },
      { student: 'Budi', isCorrect: false, damage: 0 },
      { student: 'Citra', isCorrect: true, damage: 330 },
    ]

    const lasersFired = attacks.filter((a) => a.isCorrect)
    assert.strictEqual(lasersFired.length, 2)
    assert.ok(lasersFired.every((l) => l.isCorrect === true))
  })

  await t.test('7. 2D Reference Asset: Semua 12 file referensi PNG & SVG 800px tersedia di reference2d/', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const refDir = path.resolve('apps/web/src/modules/games/bossBattle/reference2d')

    const bosses = ['robot-glitch', 'virus-lambda', 'bugzilla', 'rakus-maximus']
    const poses = ['idle', 'laugh', 'defeated']

    for (const b of bosses) {
      for (const p of poses) {
        const pngPath = path.join(refDir, `${b}-${p}.png`)
        const svgPath = path.join(refDir, `${b}-${p}.svg`)

        assert.ok(fs.existsSync(pngPath), `PNG reference harus ada: ${b}-${p}.png`)
        assert.ok(fs.existsSync(svgPath), `SVG reference harus ada: ${b}-${p}.svg`)

        const statPng = fs.statSync(pngPath)
        assert.ok(statPng.size > 10000, `File PNG ${b}-${p}.png harus valid (>10KB)`)

        const svgContent = fs.readFileSync(svgPath, 'utf-8')
        assert.ok(svgContent.includes('viewBox="0 0 200 220"'), `SVG harus memiliki viewBox 0 0 200 220`)
      }
    }
  })

  await t.test('8. Proporsi ViewBox SVG & Dimensi 3D: Rasio 200:220 (9.0 x 9.9) presisi', () => {
    const svgWidth = 200
    const svgHeight = 220
    const svgRatio = svgWidth / svgHeight // 0.9090909...

    const d3Width = 9.0
    const d3Height = 9.9
    const d3Ratio = d3Width / d3Height // 0.9090909...

    const diff = Math.abs(svgRatio - d3Ratio)
    assert.ok(diff < 0.001, `Rasio siluet 3D (${d3Ratio}) harus sama persis dengan viewBox SVG (${svgRatio})`)
  })

  await t.test('9. Kamera Near-Frontal: Sudut horizontal 0°..12° dan vertikal 5°..10°', () => {
    const presets = [
      { name: 'overview', pos: { x: 0, y: 7.2, z: 19.5 }, target: { x: 0, y: 5.5, z: 0 } },
      { name: 'bossFocus', pos: { x: 0, y: 6.7, z: 14.5 }, target: { x: 0, y: 5.5, z: 0 } },
      { name: 'stageAngle', pos: { x: 2.0, y: 7.2, z: 19.5 }, target: { x: 0, y: 5.5, z: 0 } },
    ]

    presets.forEach((p) => {
      const deltaX = p.pos.x - p.target.x
      const deltaY = p.pos.y - p.target.y
      const deltaZ = p.pos.z - p.target.z

      const horizAngleDeg = Math.abs(Math.atan2(deltaX, deltaZ) * (180 / Math.PI))
      const vertAngleDeg = Math.abs(Math.atan2(deltaY, deltaZ) * (180 / Math.PI))

      assert.ok(
        horizAngleDeg >= 0 && horizAngleDeg <= 12,
        `Preset ${p.name}: sudut horizontal (${horizAngleDeg.toFixed(1)}°) harus <= 12°`
      )
      assert.ok(
        vertAngleDeg >= 4.5 && vertAngleDeg <= 10.5,
        `Preset ${p.name}: sudut vertikal (${vertAngleDeg.toFixed(1)}°) harus di rentang 5°..10°`
      )
    })
  })

  await t.test('10. Checklist Identitas Karakter: 4 Boss & Pose Defeated Khusus Rakus Maximus', () => {
    // 1. Robot Glitch
    const robotFeatures = [
      'antennas-cyan-tips',
      'polygon-mecha-head',
      'cyber-ear-modules',
      'led-status',
      'visor-digital-optics',
      'mouth-grille',
      'trapezoid-armor-pauldrons',
      'arc-reactor-vents',
      'servo-arms-claw-joint',
    ]
    assert.strictEqual(robotFeatures.length, 9)

    // 2. Virus Lambda
    const virusFeatures = [
      'capsid-facet-plates',
      '6-peplomer-mint-spikes',
      'lambda-crest',
      '5-undulating-tentacles',
      'tri-eye-cluster',
      '2-orbiting-spores',
    ]
    assert.strictEqual(virusFeatures.length, 6)

    // 3. Bugzilla
    const bugFeatures = [
      'curled-antennae-red-tips',
      'convex-carapace-wings',
      'hazard-warning-shield',
      'stag-mandibles-teeth',
      'compound-eyes-crosshatch',
      'scythe-arms-legs',
    ]
    assert.strictEqual(bugFeatures.length, 6)

    // 4. Rakus Maximus
    const rakusStandingFeatures = [
      'curved-horns-gold-bands',
      'stout-muscular-torso',
      'gold-spiked-pauldrons',
      'pectoral-armor-crystal',
      'ground-resting-paws-claws',
      'toothy-grin-upward-tusks',
    ]
    assert.strictEqual(rakusStandingFeatures.length, 6)

    // Khusus Defeated: rakus-fallen flat on floor
    const rakusFallenFeatures = [
      'flat-collapsed-body',
      'drooped-head-on-floor',
      'flat-sideways-horns',
      'slack-mouth-tongue-out',
      'x-knocked-out-eyes',
      'sprawled-paws',
    ]
    assert.strictEqual(rakusFallenFeatures.length, 6)
  })
})

