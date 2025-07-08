import { ChecklistItem, checklist } from "../checklist";
import { MentorStates } from "../route";

type StatesNode = {
  states: MentorStates;
  checklist: ChecklistItem[][];
  count: number;
};

/**
 *
 * @param states
 * @param checklist
 * @param count
 * @returns
 */
export async function initializeStatesNode({
  states,
  checklist,
  count,
}: StatesNode) {
  //　前回の状態を確認
  console.log("前回の状態: ", states);
  console.log("チェックリスト: ", checklist);

  // 相談ターン数
  const step = Math.floor(count / 1);
  console.log(`相談を始めて ${count} ターン目`);
  console.log(`現在 STEP ${step}`);
  if (step === 3) {
    states.hasQuestion = false;
  }

  return { states, step };
}
