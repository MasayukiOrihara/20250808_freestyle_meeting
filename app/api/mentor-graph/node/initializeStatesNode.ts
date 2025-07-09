import { ChecklistItem } from "../checklist";
import { MentorStates } from "../route";

type StatesNode = {
  states: MentorStates;
  checklist: ChecklistItem[][];
};

/**
 *
 * @param states
 * @param checklist
 * @returns
 */
export async function initializeStatesNode({ states, checklist }: StatesNode) {
  //　前回の状態を確認
  console.log("前回の状態: ", states);
  console.log("チェックリスト: ", checklist);

  // 相談ターン数
  const step = Math.floor(states.count / 2);
  console.log(`相談を始めて ${states.count} ターン目`);
  console.log(`現在 STEP ${step}`);
  if (step === 3) {
    states.hasQuestion = false;
  }

  return { states, step };
}
