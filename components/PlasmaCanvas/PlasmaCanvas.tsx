// @ts-nocheck
import React, { useRef, useEffect } from 'react'

const distance = (x, y) => Math.sqrt(x * x + y * y)

const interpolate = (c1, c2, f) => {
  return {
    r: Math.floor(c1.r + (c2.r - c1.r) * f),
    g: Math.floor(c1.g + (c2.g - c1.g) * f),
    b: Math.floor(c1.b + (c2.b - c1.b) * f)
  }
}

const PlasmaCanvas = ({ componentName, className, isLight }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const baseColor = isLight
      ? { r: 255, g: 255, b: 255 }
      : { r: 0, g: 0, b: 0 }
    const palette = (baseColor) => {
      const tomato = { r: 255, g: 97, b: 76 }
      const teal = { r: 86, g: 191, b: 255 }
      const blue = { r: 32, g: 78, b: 216 }
      const purple = { r: 126, g: 47, b: 229 }
      const makeFiveColorGradient = (_c1, _c2, _c3, _c4, _c5) => {
        const g = []
        for (let i = 0; i < 64; i++) {
          const f = i / 64
          g[i] = interpolate(_c1, _c2, f)
        }
        for (let i = 64; i < 128; i++) {
          const f = (i - 64) / 64
          g[i] = interpolate(_c2, _c3, f)
        }
        for (let i = 128; i < 192; i++) {
          const f = (i - 128) / 64
          g[i] = interpolate(_c3, _c4, f)
        }
        for (let i = 192; i < 256; i++) {
          const f = (i - 192) / 64
          g[i] = interpolate(_c4, _c5, f)
        }
        return g
      }

      let palettes = {
        'plasma-header': (baseColor) =>
          makeFiveColorGradient(baseColor, baseColor, teal, purple, purple),
        'plasma-body': (baseColor) =>
          makeFiveColorGradient(baseColor, baseColor, baseColor, blue, tomato),
        'plasma-gdpr': (baseColor) =>
          makeFiveColorGradient(baseColor, baseColor, baseColor, blue, tomato),
        'plasma-jobs': (baseColor) =>
          makeFiveColorGradient(baseColor, baseColor, baseColor, blue, tomato),
        'plasma-footer': (baseColor) =>
          makeFiveColorGradient(baseColor, baseColor, teal, tomato, tomato)
      }
      return palettes[componentName](baseColor)
    }

    const plasma = {
      isInitialized: false,
      element: canvas,
      palette: palette(baseColor),
      mapSize: 1024,
      imgSize: 512,
      heightMap2: [],
      heightMap1: [],
      height: canvas.height,
      width: canvas.width,
      governer: 0.3,
      shiftOffset: 0.5,
      alpha: 0,
      dx1: 0,
      dx2: 0,
      dy1: 0,
      dy2: 0,
      phaseShift1: 0.9,
      phaseShift2: 0.1,
      phaseShift3: 1.2,
      phaseShift4: 0.8
    }

    const initialize = (plasma, ctx) => {
      plasma.isInitialized = true
      plasma.image = ctx.createImageData(plasma.imgSize, plasma.imgSize)

      for (let i = 0; i < plasma.image.data.length; i += 4) {
        plasma.image.data[i] = 0
        plasma.image.data[i + 1] = 0
        plasma.image.data[i + 2] = 0
        plasma.image.data[i + 3] = plasma.alpha
      }

      for (let u = 0; u < plasma.mapSize; u++) {
        for (let v = 0; v < plasma.mapSize; v++) {
          const i = u * plasma.mapSize + v

          const cx = u - plasma.mapSize / 2
          const cy = v - plasma.mapSize / 2

          const d = distance(cx, cy)

          const stretch = (2 * Math.PI) / (plasma.mapSize / 2)

          const ripple = Math.sin(d * stretch - 50)

          const normalized = (ripple + 1) / 2

          plasma.heightMap1[i] = Math.floor(normalized * 128)
        }
      }

      for (let u = 0; u < plasma.mapSize; u++) {
        for (let v = 0; v < plasma.mapSize; v++) {
          const i = u * plasma.mapSize + v
          const cx = u - plasma.mapSize / 2
          const cy = v - plasma.mapSize / 2

          const d1 = distance(0.8 * cx, 1.3 * cy) * 0.022
          const d2 = distance(1.35 * cx, 0.45 * cy) * 0.022

          const s = Math.sin(d1)
          const c = Math.cos(d2)
          const h = s + c

          const normalized = (h + 2) / 4
          plasma.heightMap2[i] = Math.floor(normalized * 127)
        }
      }
    }

    const update = (time, plasma, ctx) => {
      for (let u = 0; u < plasma.imgSize; u++) {
        for (let v = 0; v < plasma.imgSize; v++) {
          const i = (u + plasma.dy1) * plasma.mapSize + (v + plasma.dx1)
          const k = (u + plasma.dy2) * plasma.mapSize + (v + plasma.dx2)
          const j = u * plasma.imgSize * 4 + v * 4

          let h = plasma.heightMap1[i] + plasma.heightMap2[k]

          let c = plasma.palette[h]

          plasma.image.data[j] = c.r
          plasma.image.data[j + 1] = c.g
          plasma.image.data[j + 2] = c.b
          plasma.image.data[j + 3] = plasma.alpha
        }
      }
      if (plasma.alpha < 255) {
        plasma.alpha++
      }

      plasma.dx1 = Math.floor(
        (((Math.cos(
          time * 0.0002 * plasma.governer + plasma.phaseShift1 + Math.PI
        ) +
          1) /
          2) *
          plasma.mapSize) /
          2
      )
      plasma.dy1 = Math.floor(
        (((Math.cos(time * 0.0003 * plasma.governer - plasma.phaseShift2) + 1) /
          2) *
          plasma.mapSize) /
          2
      )
      plasma.dx2 = Math.floor(
        (((Math.cos(time * -0.0002 * plasma.governer + plasma.phaseShift3) +
          1) /
          2) *
          plasma.mapSize) /
          2
      )
      plasma.dy2 = Math.floor(
        (((Math.cos(
          time * -0.0003 * plasma.governer - plasma.phaseShift4 + Math.PI
        ) +
          1) /
          2) *
          plasma.mapSize) /
          2
      )

      ctx.putImageData(plasma.image, 0, 0)
    }

    const tick = (time) => {
      if (!plasma.isInitialized) {
        initialize(plasma, ctx)
      } else {
        update(time, plasma, ctx)
      }
      requestAnimationFrame(tick)
    }

    const handleResize = () => {
      canvas.width = plasma.width
      canvas.height = plasma.height
    }

    handleResize()
    requestAnimationFrame(tick)

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentName])

  return <canvas className={className} ref={canvasRef} />
}

export default PlasmaCanvas
