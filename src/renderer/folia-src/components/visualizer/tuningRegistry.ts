import type {
    CappellaTuning,
    CadenzaTuning,
    ClassicTuning,
    CladdaghTuning,
    DioramaTuning,
    FumeTuning,
    LumiereTuning,
    MonetTuning,
    PartitaTuning,
    PendoloTuning,
    SonnetTuning,
    TemperaTuning,
    TiltTuning,
    VisualizerMode,
} from '../../types';
import type { VisualizerSharedProps } from './definition';
import type { BackgroundSettingsSlice, BackgroundTuningDefinition, StoredTuning, StoredTuningAdapter, VisualizerTuningAdapter } from './tuningDefinition';

// src/components/visualizer/tuningRegistry.ts
// Pure-data registry for transporting heterogeneous visualizer tuning without importing renderers.

// The types of the 13 styles that existed before a tuning.ts stated its own. A new style adds no
// line here: its tuning.ts carries the type, and its entry takes the tuning with read().
export interface VisualizerTuningMap {
    classic: ClassicTuning;
    cadenza: CadenzaTuning;
    partita: PartitaTuning;
    fume: FumeTuning;
    claddagh: CladdaghTuning;
    cappella: CappellaTuning;
    tilt: TiltTuning;
    diorama: DioramaTuning;
    monet: MonetTuning;
    pendolo: PendoloTuning;
    sonnet: SonnetTuning;
    tempera: TemperaTuning;
    lumiere: LumiereTuning;
}

export type VisualizerTuningBundle = Partial<VisualizerTuningMap>;

interface VisualizerTuningModule {
    default: VisualizerTuningAdapter;
}

import cadenzaTuning from './cadenza/tuning'
import cappellaTuning from './cappella/tuning'
import claddaghTuning from './claddagh/tuning'
import classicTuning from './classic/tuning'
import dioramaTuning from './diorama/tuning'
import fumeTuning from './fume/tuning'
import lumiereTuning from './lumiere/tuning'
import monetTuning from './monet/tuning'
import partitaTuning from './partita/tuning'
import pendoloTuning from './pendolo/tuning'
import sonnetTuning from './sonnet/tuning'
import temperaTuning from './tempera/tuning'
import tiltTuning from './tilt/tuning'

const tuningModules: Record<string, VisualizerTuningModule> = {
  './cadenza/tuning.ts': { default: cadenzaTuning },
  './cappella/tuning.ts': { default: cappellaTuning },
  './claddagh/tuning.ts': { default: claddaghTuning },
  './classic/tuning.ts': { default: classicTuning },
  './diorama/tuning.ts': { default: dioramaTuning },
  './fume/tuning.ts': { default: fumeTuning },
  './lumiere/tuning.ts': { default: lumiereTuning },
  './monet/tuning.ts': { default: monetTuning },
  './partita/tuning.ts': { default: partitaTuning },
  './pendolo/tuning.ts': { default: pendoloTuning },
  './sonnet/tuning.ts': { default: sonnetTuning },
  './tempera/tuning.ts': { default: temperaTuning },
  './tilt/tuning.ts': { default: tiltTuning },
};
const adapters = Object.values(tuningModules).map(module => module.default);
const adaptersByMode = new Map<string, VisualizerTuningAdapter>();

adapters.forEach(adapter => {
    if (adaptersByMode.has(adapter.mode)) {
        throw new Error(`[VisualizerTuningRegistry] Duplicate adapter for "${adapter.mode}"`);
    }
    adaptersByMode.set(adapter.mode, adapter);
});

export const applyVisualizerTuning = (
    mode: VisualizerMode,
    props: VisualizerSharedProps,
    bundle?: VisualizerTuningBundle,
): VisualizerSharedProps => {
    const adapter = adaptersByMode.get(mode);
    const tuning = (bundle as Record<string, unknown> | undefined)?.[mode];
    // A style without `apply` reads its tuning from props.visualizerTunings, so the bundle goes onto the
    // props for every caller, also for one that hands it over only as the third argument (the mod export window).
    const withBundle = bundle && props.visualizerTunings !== bundle ? { ...props, visualizerTunings: bundle } : props;
    return adapter?.apply && tuning ? adapter.apply(withBundle, tuning) : withBundle;
};

export const getVisualizerTuningModes = (): string[] => [...adaptersByMode.keys()];

/** The tuning a lyric style declared; none for a style without settings of its own (a mod's style keeps its own elsewhere). */
export const getVisualizerTuning = (mode: string): VisualizerTuningAdapter | undefined => adaptersByMode.get(mode);

// The backgrounds' tunings are stored the same way, but ride no bundle: a background reads its own from the background config.
import latentBgTuning from './backgrounds/latent/tuning'
import monetBgTuning from './backgrounds/monet/tuning'
import nomandBgTuning from './backgrounds/nomand/tuning'
import soraBgTuning from './backgrounds/sora/tuning'

const backgroundTuningModules: Record<string, { default: BackgroundTuningDefinition }> = {
  './backgrounds/latent/tuning.ts': { default: latentBgTuning },
  './backgrounds/monet/tuning.ts': { default: monetBgTuning },
  './backgrounds/nomand/tuning.ts': { default: nomandBgTuning },
  './backgrounds/sora/tuning.ts': { default: soraBgTuning },
};
const backgroundTunings = Object.values(backgroundTuningModules).map(module => module.default);

/** The tunings the backgrounds declared, each under its background's id. */
export const getBackgroundTunings = (): readonly BackgroundTuningDefinition[] => backgroundTunings;

/**
 * The backgrounds' tunings as a background config carries them: under each background's id, as
 * `{ tuning }`. `settings` holds them under the store's field names (the settings store, or a
 * copy of its fields such as the OBS page receives).
 */
export const backgroundTuningConfig = (settings: Record<string, unknown>): Record<string, { tuning: unknown }> => Object.fromEntries(
    backgroundTunings.map(tuning => [tuning.mode, { tuning: settings[tuning.settingsKey] }]),
);

/** The actions that change and reset the backgrounds' tunings, as the background actions carry them: under each background's id. */
export const backgroundTuningActions = (settings: Record<string, unknown>): Record<string, { onTuningChange: unknown; onResetTuning: unknown }> => Object.fromEntries(
    backgroundTunings.map(tuning => [tuning.mode, {
        onTuningChange: settings[tuning.settingsSetterKey],
        onResetTuning: settings[tuning.settingsResetterKey],
    }]),
);

import urlBgSettings from './backgrounds/url/settings'

const backgroundSettingsModules: Record<string, { default: BackgroundSettingsSlice }> = {
  './backgrounds/url/settings.ts': { default: urlBgSettings },
};

/** The backgrounds' stored settings that are no tuning object: each builds its own store fields. */
export const getBackgroundSettingsSlices = (): BackgroundSettingsSlice[] => (
    Object.values(backgroundSettingsModules).map(module => module.default)
);

/** The tunings that declare where they are stored, the styles' and the backgrounds': the settings store builds its fields and actions from these. */
export const getStoredVisualizerTunings = (): StoredTuning[] => [
    ...adapters.filter((adapter): adapter is StoredTuningAdapter => Boolean(adapter.storage && adapter.settingsResetterKey)),
    ...backgroundTunings,
];

export const collectVisualizerTunings = (settings: Record<string, unknown>): VisualizerTuningBundle => {
    const bundle: VisualizerTuningBundle = {};
    adapters.forEach(adapter => {
        const value = settings[adapter.settingsKey];
        if (value !== undefined) {
            (bundle as Record<string, unknown>)[adapter.mode] = value;
        }
    });
    return bundle;
};

export const applyVisualizerTuningsToSettings = (
    settings: Record<string, unknown>,
    bundle: VisualizerTuningBundle,
) => {
    adapters.forEach(adapter => {
        const value = (bundle as Record<string, unknown>)[adapter.mode];
        const setter = settings[adapter.settingsSetterKey];
        if (value !== undefined && typeof setter === 'function') {
            setter(value);
        }
    });
};
