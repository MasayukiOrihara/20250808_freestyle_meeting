import { ChecklistItem } from "../checklist";

type StatesNode = {
  count: number;
  checklist: ChecklistItem[][];
};

/**
 *
 * @param states
 * @param checklist
 * @returns
 */
export async function initializeStatesNode({ count, checklist }: StatesNode) {
  //　前回の状態を確認
  console.log("チェックリスト: ", checklist);
  let hasQuestion = true;

  // 初めの初期化
  if (!count) count = 0;

  // 相談ターン数
  const step = Math.floor(count / 2);
  console.log(`相談を始めて ${count} ターン目`);
  console.log(`現在 STEP ${step}`);
  if (step === 3) {
    hasQuestion = false;
  }

  return { count, step, hasQuestion };
}
