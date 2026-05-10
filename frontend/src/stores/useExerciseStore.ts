import { create } from 'zustand'
import type { SentenceItem } from '@project/shared'
import { groupSentences, shuffleArray } from '@/lib/utils'
import type { ExercisePhase, BlankState, GroupState } from '@/types'

const GROUP_SIZE = 5

interface ExerciseStore {
  phase: ExercisePhase
  inputWords: string[]
  sentences: SentenceItem[]
  currentGroup: number
  groupStates: Record<number, GroupState>

  setInputWords: (words: string[]) => void
  startGenerate: () => void
  setSentences: (sentences: SentenceItem[]) => void
  checkAnswer: (groupIdx: number, blankIdx: number, word: string) => boolean
  nextGroup: () => void
  prevGroup: () => void
  resetAll: () => void
}

export const useExerciseStore = create<ExerciseStore>((set, get) => ({
  phase: 'input',
  inputWords: [],
  sentences: [],
  currentGroup: 0,
  groupStates: {},

  setInputWords: (words) => set({ inputWords: words }),

  startGenerate: () => set({ phase: 'loading' }),

  setSentences: (sentences) => {
    const shuffled = shuffleArray(sentences)
    const groups = groupSentences(shuffled, GROUP_SIZE)
    const initialStates: Record<number, GroupState> = {}

    groups.forEach((group, gIdx) => {
      const groupState: GroupState = {}
      group.forEach((_item, sIdx) => {
        const blankIdx = gIdx * GROUP_SIZE + sIdx
        groupState[blankIdx] = { placedWord: null, isCorrect: false, shakeStamp: 0 }
      })
      initialStates[gIdx] = groupState
    })

    set({
      sentences: shuffled,
      groupStates: initialStates,
      currentGroup: 0,
      phase: 'exercising',
    })
  },

  checkAnswer: (groupIdx, blankIdx, word) => {
    const state = get()
    const sentence = state.sentences[blankIdx]
    const isCorrect = sentence.word.toLowerCase() === word.toLowerCase()

    const newGroupStates = { ...state.groupStates }
    const newGroupState = { ...newGroupStates[groupIdx] }
    const prevBlank = newGroupState[blankIdx]
    newGroupState[blankIdx] = {
      placedWord: word,
      isCorrect,
      shakeStamp: isCorrect ? prevBlank.shakeStamp : prevBlank.shakeStamp + 1,
    }
    newGroupStates[groupIdx] = newGroupState

    set({ groupStates: newGroupStates })
    return isCorrect
  },

  nextGroup: () => {
    const { currentGroup, sentences } = get()
    const totalGroups = Math.ceil(sentences.length / GROUP_SIZE)
    if (currentGroup < totalGroups - 1) {
      set({ currentGroup: currentGroup + 1 })
    } else {
      set({ phase: 'completed' })
    }
  },

  prevGroup: () => {
    const { currentGroup } = get()
    if (currentGroup > 0) {
      set({ currentGroup: currentGroup - 1 })
    }
  },

  resetAll: () =>
    set({
      phase: 'input',
      inputWords: [],
      sentences: [],
      currentGroup: 0,
      groupStates: {},
    }),
}))

export function usePhase() {
  return useExerciseStore((s) => s.phase)
}

export function useInputWords() {
  return useExerciseStore((s) => s.inputWords)
}

export function useSentences() {
  return useExerciseStore((s) => s.sentences)
}

export function useCurrentGroup() {
  return useExerciseStore((s) => s.currentGroup)
}

export function useGroupStates() {
  return useExerciseStore((s) => s.groupStates)
}

export function useGroupTotal() {
  return useExerciseStore((s) => Math.ceil(s.sentences.length / GROUP_SIZE))
}

export function useIsGroupComplete(groupIdx: number): boolean {
  return useExerciseStore((s) => {
    const groupState = s.groupStates[groupIdx]
    if (!groupState) return false
    return Object.values(groupState).every((bs: BlankState) => bs.isCorrect)
  })
}
