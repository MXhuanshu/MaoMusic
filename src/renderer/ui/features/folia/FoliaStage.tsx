// React island 宿主：把 Folia 的 VisualizerRenderer 挂进 Vue 页面。
// 只做状态桥接（主题 / 歌词 / 播放时间 / 频谱），视觉逻辑全部来自 folia-src 原码。
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { motionValue, type MotionValue } from 'framer-motion'

import '@renderer/folia-src/i18n/config'
import { VisualizerRenderer } from '@renderer/folia-src/components/visualizer/VisualizerRenderer'
import type { Line, Theme, AudioBands, VisualizerMode } from '@renderer/folia-src/types'

export interface FoliaStageProps {
  mode: VisualizerMode
  theme: Theme
  lines: Line[]
  currentLineIndex: number
  currentTime: number
  duration: number
  audioPower: number
  paused: boolean
  coverUrl: string | null
  songTitle: string | null
  songArtist: string | null
  songAlbum: string | null
  isDaylight: boolean
  backgroundMode: string
  visualizerTunings?: Record<string, unknown>
  onBack?: () => void
}

export interface FoliaStageHandle {
  setTime: (time: number) => void
  setPower: (power: number) => void
}

const FoliaStage = forwardRef<FoliaStageHandle, FoliaStageProps>((props, ref) => {
  const timeRef = useRef<MotionValue<number>>(motionValue(0))
  const powerRef = useRef<MotionValue<number>>(motionValue(0))
  const bandsRef = useRef<AudioBands>({
    bass: motionValue(0),
    lowMid: motionValue(0),
    mid: motionValue(0),
    vocal: motionValue(0),
    treble: motionValue(0),
  })

  useEffect(() => {
    timeRef.current.set(props.currentTime)
  }, [props.currentTime])

  useEffect(() => {
    powerRef.current.set(props.audioPower)
    const bands = bandsRef.current
    bands.bass.set(props.audioPower)
    bands.lowMid.set(props.audioPower)
    bands.mid.set(props.audioPower)
    bands.vocal.set(props.audioPower)
    bands.treble.set(props.audioPower)
  }, [props.audioPower])

  // 高频更新（播放时间 / 频谱）走 MotionValue 直接 set，不触发 React 重渲染
  useImperativeHandle(ref, () => ({
    setTime: (time: number) => {
      timeRef.current.set(time)
    },
    setPower: (power: number) => {
      powerRef.current.set(power)
      const bands = bandsRef.current
      bands.bass.set(power)
      bands.lowMid.set(power)
      bands.mid.set(power)
      bands.vocal.set(power)
      bands.treble.set(power)
    },
  }), [])

  const sharedProps = useMemo(() => ({
    currentTime: timeRef.current,
    duration: props.duration,
    currentLineIndex: props.currentLineIndex,
    lines: props.lines,
    theme: props.theme,
    isDaylight: props.isDaylight,
    audioPower: powerRef.current,
    audioBands: bandsRef.current,
    songTitle: props.songTitle,
    songArtist: props.songArtist,
    songAlbum: props.songAlbum,
    coverUrl: props.coverUrl,
    seed: props.songTitle ?? 'maomusic',
    paused: props.paused,
    onBack: props.onBack,
    background: { mode: props.backgroundMode as any },
    visualizerTunings: props.visualizerTunings,
  }), [
    props.currentLineIndex,
    props.lines,
    props.theme,
    props.isDaylight,
    props.duration,
    props.songTitle,
    props.songArtist,
    props.songAlbum,
    props.coverUrl,
    props.paused,
    props.backgroundMode,
    props.visualizerTunings,
    props.onBack,
  ])

  return (
    <div className="absolute inset-0">
      <VisualizerRenderer
        mode={props.mode}
        animateStyleSwitch
        {...sharedProps}
      />
    </div>
  )
})

export default FoliaStage
