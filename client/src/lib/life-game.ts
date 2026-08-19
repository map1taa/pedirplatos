// 人生ゲーム: 盤面データとゲームロジック（保存なし・1人プレイ専用）

export type CellKind =
  | "start"
  | "normal"
  | "money"
  | "payday"
  | "job"
  | "marriage"
  | "child"
  | "event"
  | "branch"
  | "goal";

export type Cell = {
  id: string;
  kind: CellKind;
  label: string;
  /** 説明文（マスに止まったときのメッセージ） */
  desc?: string;
  /** 所持金の増減（万円） */
  money?: number;
  /** 給料の増減（万円 / 給料日ごと） */
  salary?: number;
  /** 職業が決まるマス */
  job?: string;
  /** 次に進むマス。複数あれば分岐 */
  next: string[];
  /** 分岐マスの選択肢ラベル（next と同じ並び） */
  choices?: string[];
};

/** 直線区間をまとめて作るヘルパー */
function line(prefix: string, cells: Omit<Cell, "id" | "next">[], tail: string): Cell[] {
  return cells.map((c, i) => ({
    ...c,
    id: `${prefix}${i}`,
    next: [i + 1 < cells.length ? `${prefix}${i + 1}` : tail],
  }));
}

const childhood: Omit<Cell, "id" | "next">[] = [
  { kind: "start", label: "スタート", desc: "18歳。人生ゲームのはじまり！" },
  { kind: "money", label: "お年玉", desc: "親戚からお年玉をもらった。", money: 5 },
  { kind: "normal", label: "ひとやすみ", desc: "とくに何も起こらなかった。" },
  { kind: "event", label: "運命のマス", desc: "何かが起こる予感…" },
  { kind: "money", label: "バイト代", desc: "コンビニのバイト代が入った。", money: 8 },
  { kind: "money", label: "スマホを落とした", desc: "画面がバキバキ。修理代を払った。", money: -4 },
  { kind: "event", label: "運命のマス", desc: "何かが起こる予感…" },
  { kind: "normal", label: "進路相談", desc: "先生と将来の話をした。" },
];

const university: Omit<Cell, "id" | "next">[] = [
  { kind: "money", label: "入学金", desc: "大学に入学。まとまった出費。", money: -60 },
  { kind: "normal", label: "サークル活動", desc: "青春を謳歌した。" },
  { kind: "event", label: "運命のマス", desc: "何かが起こる予感…" },
  { kind: "money", label: "奨学金", desc: "奨学金が振り込まれた（あとで返す）。", money: 40 },
  { kind: "money", label: "留学", desc: "短期留学に行った。視野が広がった。", money: -30 },
  { kind: "normal", label: "卒業論文", desc: "徹夜で書き上げた。" },
  { kind: "job", label: "大手企業に就職", desc: "内定ゲット！給料が高い。", job: "会社員（大手）", salary: 28 },
  { kind: "money", label: "初任給", desc: "初めての給料でごちそうした。", money: 10 },
];

const work: Omit<Cell, "id" | "next">[] = [
  { kind: "job", label: "手に職コース", desc: "専門技術を身につけた。", job: "職人", salary: 20 },
  { kind: "money", label: "道具をそろえる", desc: "仕事道具に投資した。", money: -15 },
  { kind: "event", label: "運命のマス", desc: "何かが起こる予感…" },
  { kind: "money", label: "早くも昇給", desc: "腕を認められた。", money: 12, salary: 4 },
  { kind: "normal", label: "同期と飲み会", desc: "愚痴を言い合った。" },
  { kind: "payday", label: "給料日", desc: "給料が入った！" },
];

const middle: Omit<Cell, "id" | "next">[] = [
  { kind: "normal", label: "社会人生活", desc: "毎日があっという間に過ぎていく。" },
  { kind: "payday", label: "給料日", desc: "給料が入った！" },
  { kind: "event", label: "運命のマス", desc: "何かが起こる予感…" },
  { kind: "money", label: "資格を取得", desc: "勉強の成果。手当がついた。", money: -10, salary: 3 },
  { kind: "money", label: "旅行に行く", desc: "リフレッシュした。", money: -12 },
  { kind: "payday", label: "給料日", desc: "給料が入った！" },
  { kind: "event", label: "運命のマス", desc: "何かが起こる予感…" },
  { kind: "normal", label: "人生の岐路", desc: "この先どう生きる？" },
];

const family: Omit<Cell, "id" | "next">[] = [
  { kind: "marriage", label: "結婚式", desc: "結婚した！ご祝儀が集まった。", money: 30 },
  { kind: "money", label: "新婚旅行", desc: "ハワイへ。", money: -25 },
  { kind: "child", label: "子どもが生まれる", desc: "家族が増えた！" },
  { kind: "money", label: "マイホーム購入", desc: "頭金を払った。", money: -80 },
  { kind: "payday", label: "給料日", desc: "給料が入った！" },
  { kind: "child", label: "子どもが生まれる", desc: "にぎやかになってきた。" },
  { kind: "event", label: "運命のマス", desc: "何かが起こる予感…" },
  { kind: "money", label: "教育費", desc: "子どもの学費がかかる。", money: -20 },
];

const career: Omit<Cell, "id" | "next">[] = [
  { kind: "money", label: "独立を決意", desc: "会社を辞めて開業資金を用意した。", money: -40, salary: 10 },
  { kind: "job", label: "起業家になる", desc: "自分の会社を立ち上げた。", job: "起業家", salary: 45 },
  { kind: "money", label: "大型契約", desc: "大きな仕事が決まった。", money: 60 },
  { kind: "event", label: "運命のマス", desc: "何かが起こる予感…" },
  { kind: "money", label: "資金繰りに苦戦", desc: "支払いが重なった。", money: -45 },
  { kind: "payday", label: "給料日", desc: "自分に役員報酬を出した。" },
  { kind: "money", label: "事業が軌道に乗る", desc: "軌道に乗ってきた。", money: 35, salary: 8 },
  { kind: "event", label: "運命のマス", desc: "何かが起こる予感…" },
];

const later: Omit<Cell, "id" | "next">[] = [
  { kind: "payday", label: "給料日", desc: "給料が入った！" },
  { kind: "money", label: "健康診断", desc: "再検査になった。医療費を払った。", money: -8 },
  { kind: "event", label: "運命のマス", desc: "何かが起こる予感…" },
  { kind: "money", label: "投資が実る", desc: "コツコツ積み立てた成果。", money: 40 },
  { kind: "normal", label: "趣味に没頭", desc: "第二の人生を考えはじめた。" },
  { kind: "payday", label: "給料日", desc: "最後の給料日。" },
  { kind: "event", label: "運命のマス", desc: "何かが起こる予感…" },
  { kind: "money", label: "退職金", desc: "長年おつかれさまでした。", money: 100 },
  { kind: "normal", label: "ゴール目前", desc: "人生を振り返る。" },
];

const branch1: Cell = {
  id: "br1",
  kind: "branch",
  label: "分かれ道：進学 or 就職",
  desc: "これからの進路を選ぼう。",
  next: ["u0", "w0"],
  choices: ["大学に進学する", "働きに出る"],
};

const branch2: Cell = {
  id: "br2",
  kind: "branch",
  label: "分かれ道：家庭 or キャリア",
  desc: "人生の方向を選ぼう。",
  next: ["f0", "c0"],
  choices: ["家庭を持つ", "キャリアに賭ける"],
};

const goal: Cell = {
  id: "goal",
  kind: "goal",
  label: "ゴール！",
  desc: "ここまでの人生、おつかれさまでした。",
  next: [],
};

export const BOARD: Record<string, Cell> = Object.fromEntries(
  [
    ...line("a", childhood, "br1"),
    branch1,
    ...line("u", university, "m0"),
    ...line("w", work, "m0"),
    ...line("m", middle, "br2"),
    branch2,
    ...line("f", family, "e0"),
    ...line("c", career, "e0"),
    ...line("e", later, "goal"),
    goal,
  ].map((c) => [c.id, c]),
);

export const START_ID = "a0";

/** 「運命のマス」で引くイベントカード */
export type EventCard = {
  text: string;
  money?: number;
  salary?: number;
  child?: boolean;
};

export const EVENT_CARDS: EventCard[] = [
  { text: "宝くじが当たった！", money: 50 },
  { text: "財布を落とした…", money: -20 },
  { text: "友人の結婚式に呼ばれた。ご祝儀を包む。", money: -15 },
  { text: "副業の収入が入った。", money: 18 },
  { text: "スキルアップに成功。給料が上がった。", salary: 5 },
  { text: "体調を崩して休職。給料が下がった。", salary: -4 },
  { text: "SNSの投稿がバズって広告収入が入った。", money: 25 },
  { text: "家電がまとめて壊れた。買い替え。", money: -22 },
  { text: "遠い親戚から遺産が届いた。", money: 60 },
  { text: "空き巣に入られた…", money: -35 },
  { text: "ふるさとの土地が値上がりした。", money: 30 },
  { text: "健康的な生活で医療費が浮いた。", money: 10 },
  { text: "会社の業績が良く、特別ボーナス！", money: 40 },
  { text: "車をぶつけて修理代がかかった。", money: -18 },
];

export type GameState = {
  cellId: string;
  age: number;
  money: number;
  salary: number;
  job: string;
  married: boolean;
  children: number;
  /** 進んだマスの履歴（盤面の軌跡表示に使う） */
  visited: string[];
  log: string[];
  finished: boolean;
};

export function initialState(): GameState {
  return {
    cellId: START_ID,
    age: 18,
    money: 20,
    salary: 0,
    job: "学生",
    married: false,
    children: 0,
    visited: [START_ID],
    log: ["18歳。人生ゲームがはじまった！"],
    finished: false,
  };
}

/** マスの効果を適用した新しい状態と、表示用メッセージを返す */
export function applyCell(
  state: GameState,
  cell: Cell,
  card?: EventCard,
): { state: GameState; messages: string[] } {
  const next = { ...state };
  const messages: string[] = [];

  if (cell.desc) messages.push(cell.desc);

  if (cell.job) {
    next.job = cell.job;
    messages.push(`職業が「${cell.job}」になった。`);
  }
  if (cell.salary) {
    next.salary = Math.max(0, next.salary + cell.salary);
    messages.push(`給料が${cell.salary > 0 ? "+" : ""}${cell.salary}万円になった（現在 ${next.salary}万円）。`);
  }
  if (cell.money) {
    next.money += cell.money;
    messages.push(`${cell.money > 0 ? "+" : ""}${cell.money}万円`);
  }
  if (cell.kind === "payday") {
    const pay = next.salary > 0 ? next.salary : 10;
    next.money += pay;
    messages.push(`給料 +${pay}万円`);
  }
  if (cell.kind === "marriage") {
    next.married = true;
    messages.push("結婚した！");
  }
  if (cell.kind === "child") {
    next.children += 1;
    messages.push(`子どもが生まれた（${next.children}人目）。`);
  }
  if (cell.kind === "event" && card) {
    messages.push(`【運命のカード】${card.text}`);
    if (card.money) {
      next.money += card.money;
      messages.push(`${card.money > 0 ? "+" : ""}${card.money}万円`);
    }
    if (card.salary) {
      next.salary = Math.max(0, next.salary + card.salary);
      messages.push(`給料 ${card.salary > 0 ? "+" : ""}${card.salary}万円（現在 ${next.salary}万円）。`);
    }
    if (card.child) {
      next.children += 1;
      messages.push(`子どもが生まれた（${next.children}人目）。`);
    }
  }
  if (cell.kind === "goal") {
    next.finished = true;
  }

  return { state: next, messages };
}

export type Ending = { title: string; comment: string };

/** 最終スコアと称号 */
export function score(state: GameState): number {
  return state.money + state.children * 50 + (state.married ? 40 : 0) + state.salary * 2;
}

export function ending(state: GameState): Ending {
  const s = score(state);
  if (s >= 500) return { title: "大成功の人生", comment: "お金にも家族にも恵まれた、まぶしい人生だった。" };
  if (s >= 350) return { title: "しあわせな人生", comment: "大きな波もあったけれど、笑って振り返れる人生。" };
  if (s >= 200) return { title: "ふつうの人生", comment: "波乱もそこそこ、堅実に歩んだ人生だった。" };
  if (s >= 80) return { title: "苦労した人生", comment: "山あり谷あり。それでもゴールにたどり着いた。" };
  return { title: "波乱万丈の人生", comment: "ジェットコースターのような人生。これはこれで悪くない。" };
}
