// Folia 各歌词视觉模式的常用调优字段（取自 folia-src/types.ts 的 *Tuning 接口）。
// 设置页据此渲染控件，值存入 appSetting['playDetail.visualizerTunings']，
// 经 FoliaStage 传给 VisualizerRenderer 的 visualizerTunings，由 Folia 原码应用。

export interface TuningField {
  key: string
  label: string
  type: 'switch' | 'slider' | 'select'
  min?: number
  max?: number
  step?: number
  options?: Array<{ id: string, label: string }>
}

export const FOLIA_TUNING_FIELDS: Record<string, TuningField[]> = {
  classic: [
    { key: 'enableWordRotation', label: '逐词旋转', type: 'switch' },
    { key: 'breathingFloatMultiplier', label: '浮动幅度', type: 'slider', min: 0, max: 2, step: 0.1 },
    { key: 'wordSpacing', label: '词间距', type: 'slider', min: 0, max: 2, step: 0.1 },
  ],
  cadenza: [
    { key: 'fontScale', label: '字号缩放', type: 'slider', min: 0.6, max: 2, step: 0.05 },
    { key: 'widthRatio', label: '宽度占比', type: 'slider', min: 0.3, max: 1, step: 0.05 },
    { key: 'motionAmount', label: '运动强度', type: 'slider', min: 0, max: 2, step: 0.1 },
    { key: 'glowIntensity', label: '辉光强度', type: 'slider', min: 0, max: 2, step: 0.1 },
  ],
  diorama: [
    { key: 'cameraSpeed', label: '相机速度', type: 'slider', min: 0.2, max: 3, step: 0.1 },
    { key: 'motionAmount', label: '运动强度', type: 'slider', min: 0, max: 2, step: 0.1 },
    { key: 'audioReactivity', label: '音频响应', type: 'slider', min: 0, max: 2, step: 0.1 },
    { key: 'showParticles', label: '显示粒子', type: 'switch' },
    { key: 'particleDensity', label: '粒子密度', type: 'slider', min: 0, max: 1, step: 0.05 },
    { key: 'glowEnabled', label: '跟唱辉光', type: 'switch' },
    { key: 'glowIntensity', label: '辉光强度', type: 'slider', min: 0, max: 2, step: 0.1 },
  ],
  fume: [
    { key: 'cameraSpeed', label: '相机速度', type: 'slider', min: 0.2, max: 3, step: 0.1 },
    { key: 'glowIntensity', label: '辉光强度', type: 'slider', min: 0, max: 2, step: 0.1 },
    { key: 'heroScale', label: '主字缩放', type: 'slider', min: 0.5, max: 2, step: 0.1 },
    { key: 'backgroundObjectOpacity', label: '背景物体透明度', type: 'slider', min: 0, max: 1, step: 0.05 },
    { key: 'cameraTrackingMode', label: '相机跟随', type: 'select', options: [
      { id: 'stepped', label: '阶梯' },
      { id: 'smooth', label: '平滑' },
    ] },
  ],
  partita: [
    { key: 'showGuideLines', label: '显示参考线', type: 'switch' },
    { key: 'useSemanticLayout', label: '语义布局', type: 'switch' },
    { key: 'staggerMin', label: '错落最小值', type: 'slider', min: 0, max: 180, step: 5 },
    { key: 'staggerMax', label: '错落最大值', type: 'slider', min: 0, max: 180, step: 5 },
  ],
  claddagh: [
    { key: 'focusScaleRatio', label: '聚焦缩放', type: 'slider', min: 0, max: 1.5, step: 0.05 },
    { key: 'radiusScale', label: '半径缩放', type: 'slider', min: 0.5, max: 1.5, step: 0.05 },
    { key: 'ellipseTiltDeg', label: '椭圆倾角', type: 'slider', min: 0, max: 60, step: 5 },
    { key: 'showAxisLine', label: '显示轴线', type: 'switch' },
  ],
  cappella: [
    { key: 'showEmoMessages', label: '显示表情消息', type: 'switch' },
  ],
  tilt: [
    { key: 'splitProbability', label: '拆分概率', type: 'slider', min: 0, max: 1, step: 0.05 },
    { key: 'tiltStyleProbability', label: '倾斜概率', type: 'slider', min: 0, max: 1, step: 0.05 },
  ],
  lumiere: [
    { key: 'lightIntensity', label: '光照强度', type: 'slider', min: 0, max: 2, step: 0.1 },
    { key: 'audioResponse', label: '音频响应', type: 'slider', min: 0, max: 2, step: 0.1 },
    { key: 'fogDensity', label: '雾浓度', type: 'slider', min: 0, max: 2, step: 0.1 },
    { key: 'moteAmount', label: '尘埃量', type: 'slider', min: 0, max: 2, step: 0.1 },
  ],
  monet: [
    { key: 'keywordColoringEnabled', label: '关键词着色', type: 'switch' },
    { key: 'showDescription', label: '显示描述', type: 'switch' },
    { key: 'fontScale', label: '字号缩放', type: 'slider', min: 0.6, max: 2, step: 0.05 },
  ],
  pendolo: [
    { key: 'arcRadius', label: '弧半径', type: 'slider', min: 0.2, max: 0.8, step: 0.02 },
    { key: 'arcAngleDeg', label: '弧角度', type: 'slider', min: 60, max: 300, step: 10 },
    { key: 'tickSnappiness', label: '刻度弹性', type: 'slider', min: 0, max: 2, step: 0.1 },
    { key: 'activeScale', label: '激活缩放', type: 'slider', min: 0.5, max: 2, step: 0.1 },
  ],
  sonnet: [
    { key: 'cameraIntensity', label: '相机强度', type: 'slider', min: 0, max: 2, step: 0.1 },
    { key: 'typographyMotion', label: '排版运动', type: 'slider', min: 0, max: 2, step: 0.1 },
    { key: 'showOnlyText', label: '仅显示文字', type: 'switch' },
    { key: 'showGuide', label: '显示参考', type: 'switch' },
  ],
  tempera: [
    { key: 'cameraIntensity', label: '相机强度', type: 'slider', min: 0, max: 2, step: 0.1 },
    { key: 'glyphMotion', label: '字形运动', type: 'slider', min: 0, max: 2, step: 0.1 },
    { key: 'wholeLineLyrics', label: '整行歌词', type: 'switch' },
  ],
}
