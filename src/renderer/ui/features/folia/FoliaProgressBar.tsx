// Folia 进度条（原码 ProgressBar）的 React island 包装。
// 高频时间更新走 MotionValue，避免重渲染；业务 seek 回调由 Vue 侧提供。
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { motionValue, type MotionValue } from 'framer-motion'

import { ProgressBar } from '@renderer/folia-src/components/ProgressBar'

export interface FoliaProgressBarProps {
  duration: number
  currentTime: number
  fillColor: string
  trackColor: string
  textColor: string
  disabled?: boolean
  onSeek: (time: number) => void
}

export interface FoliaProgressBarHandle {
  setTime: (time: number) => void
}

const FoliaProgressBar = forwardRef<FoliaProgressBarHandle, FoliaProgressBarProps>((props, ref) => {
  const timeRef = useRef<MotionValue<number>>(motionValue(props.currentTime))

  useEffect(() => {
    timeRef.current.set(props.currentTime)
  }, [props.currentTime])

  useImperativeHandle(ref, () => ({
    setTime: (time: number) => {
      timeRef.current.set(time)
    },
  }), [])

  return (
    <ProgressBar
      currentTime={timeRef.current}
      duration={props.duration}
      onSeek={props.onSeek}
      primaryColor={props.fillColor}
      trackColor={props.trackColor}
      secondaryColor={props.textColor}
      disabled={props.disabled}
    />
  )
})

export default FoliaProgressBar
