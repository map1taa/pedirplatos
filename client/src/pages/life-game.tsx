import { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  BOARD,
  EVENT_CARDS,
  applyCell,
  ending,
  initialState,
  score,
  type Cell,
  type GameState,
} from "@/lib/life-game";
import "@/styles/life-game.css";

type Phase = "idle" | "spinning" | "moving" | "branch" | "finished";

/** 盤面の見せ方（章ごと・分岐は2レーン） */
const CHAPTERS: { title: string; lanes: { name?: string; ids: string[] }[] }[] = [
  { title: "第1章 青春編", lanes: [{ ids: ["a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "br1"] }] },
  {
    title: "第2章 分かれ道",
    lanes: [
      { name: "大学ルート", ids: ["u0", "u1", "u2", "u3", "u4", "u5", "u6", "u7"] },
      { name: "就職ルート", ids: ["w0", "w1", "w2", "w3", "w4", "w5"] },
    ],
  },
  { title: "第3章 社会人編", lanes: [{ ids: ["m0", "m1", "m2", "m3", "m4", "m5", "m6", "m7", "br2"] }] },
  {
    title: "第4章 人生の選択",
    lanes: [
      { name: "家庭ルート", ids: ["f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7"] },
      { name: "キャリアルート", ids: ["c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7"] },
    ],
  },
  {
    title: "第5章 円熟編",
    lanes: [{ ids: ["e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "goal"] }],
  },
];

const KIND_ICON: Record<string, string> = {
  start: "🚩",
  normal: "・",
  money: "💰",
  payday: "🏦",
  job: "💼",
  marriage: "💍",
  child: "👶",
  event: "❓",
  branch: "🔀",
  goal: "🏁",
};

const yen = (n: number) => `${n.toLocaleString("ja-JP")}万円`;

export default function LifeGame() {
  const [state, setState] = useState<GameState>(initialState);
  const [phase, setPhase] = useState<Phase>("idle");
  const [roll, setRoll] = useState<number | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const timers = useRef<number[]>([]);

  const cell = BOARD[state.cellId];
  const result = useMemo(() => (state.finished ? ending(state) : null), [state]);

  function clearTimers() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }

  /** 効果を適用して次のフェーズを決める */
  function settle(base: GameState, target: Cell) {
    const card =
      target.kind === "event"
        ? EVENT_CARDS[Math.floor(Math.random() * EVENT_CARDS.length)]
        : undefined;
    const { state: applied, messages: msgs } = applyCell(base, target, card);
    applied.log = [...applied.log, `【${target.label}】${msgs.join(" / ")}`].slice(-30);
    setState(applied);
    setMessages(msgs);
    setPhase(applied.finished ? "finished" : "idle");
  }

  function spin() {
    if (phase !== "idle" || state.finished) return;
    setPhase("spinning");
    setMessages([]);

    let ticks = 0;
    const tick = () => {
      setRoll(1 + Math.floor(Math.random() * 6));
      ticks += 1;
      if (ticks < 12) {
        timers.current.push(window.setTimeout(tick, 60 + ticks * 8));
      } else {
        const steps = 1 + Math.floor(Math.random() * 6);
        setRoll(steps);
        move(steps);
      }
    };
    tick();
  }

  /** 1マスずつ進める。分岐マスに来たら止まって選択を待つ */
  function move(steps: number) {
    setPhase("moving");
    let current = state.cellId;
    const path: string[] = [];

    for (let i = 0; i < steps; i += 1) {
      const c = BOARD[current];
      if (c.next.length !== 1) break; // 分岐・ゴールで停止
      current = c.next[0];
      path.push(current);
      if (BOARD[current].kind === "goal" || BOARD[current].kind === "branch") break;
    }

    if (path.length === 0) {
      setPhase(BOARD[current].kind === "branch" ? "branch" : "idle");
      return;
    }

    const landed = BOARD[current];
    const base: GameState = {
      ...state,
      cellId: current,
      age: state.age + path.length,
      visited: [...state.visited, ...path],
    };

    // コマを1マスずつ動かす演出（状態の確定は最後にまとめて行う）
    path.forEach((id, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setState((s) => ({ ...s, cellId: id, age: s.age + 1, visited: [...s.visited, id] }));
        }, 260 * i),
      );
    });

    timers.current.push(
      window.setTimeout(() => {
        if (landed.kind === "branch") {
          setState(base);
          setMessages([landed.desc ?? "道を選ぼう。"]);
          setPhase("branch");
        } else {
          settle(base, landed);
        }
      }, 260 * path.length + 200),
    );
  }

  function choose(nextId: string) {
    const target = BOARD[nextId];
    const base: GameState = {
      ...state,
      cellId: nextId,
      age: state.age + 1,
      visited: [...state.visited, nextId],
    };
    setPhase("moving");
    setState((s) => ({ ...s, cellId: nextId }));
    timers.current.push(window.setTimeout(() => settle(base, target), 300));
  }

  function restart() {
    clearTimers();
    setState(initialState());
    setPhase("idle");
    setRoll(null);
    setMessages([]);
  }

  return (
    <div className="lg-root">
      <div className="lg-frame">
        <header className="lg-header">
          <h1 className="lg-title">人生ゲーム</h1>
          <p className="lg-sub">THE GAME OF LIFE ─ ひとりで遊ぶすごろく</p>
          <Link href="/" className="lg-back">
            ← トップへ
          </Link>
        </header>

        <div className="lg-main">
          <section className="lg-board">
            {CHAPTERS.map((ch) => (
              <div className="lg-chapter" key={ch.title}>
                <div className="lg-chapter-title">{ch.title}</div>
                <div className={ch.lanes.length > 1 ? "lg-lanes lg-lanes-split" : "lg-lanes"}>
                  {ch.lanes.map((lane, li) => (
                    <div className="lg-lane" key={li}>
                      {lane.name && <div className="lg-lane-name">{lane.name}</div>}
                      <div className="lg-cells">
                        {lane.ids.map((id) => {
                          const c = BOARD[id];
                          const here = state.cellId === id;
                          const passed = state.visited.includes(id);
                          return (
                            <div
                              key={id}
                              className={[
                                "lg-cell",
                                `lg-kind-${c.kind}`,
                                passed ? "is-passed" : "",
                                here ? "is-here" : "",
                              ].join(" ")}
                              title={c.desc ?? c.label}
                            >
                              <span className="lg-cell-icon">{KIND_ICON[c.kind]}</span>
                              <span className="lg-cell-label">{c.label}</span>
                              {here && <span className="lg-pawn">🚗</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <aside className="lg-panel">
            <div className="lg-status">
              <div className="lg-status-row">
                <span>年齢</span>
                <b>{state.age}歳</b>
              </div>
              <div className="lg-status-row">
                <span>所持金</span>
                <b className={state.money < 0 ? "lg-minus" : ""}>{yen(state.money)}</b>
              </div>
              <div className="lg-status-row">
                <span>職業</span>
                <b>{state.job}</b>
              </div>
              <div className="lg-status-row">
                <span>給料</span>
                <b>{state.salary > 0 ? yen(state.salary) : "─"}</b>
              </div>
              <div className="lg-status-row">
                <span>結婚</span>
                <b>{state.married ? "済" : "まだ"}</b>
              </div>
              <div className="lg-status-row">
                <span>子ども</span>
                <b>{state.children}人 {"👶".repeat(Math.min(state.children, 4))}</b>
              </div>
            </div>

            <div className="lg-roulette-box">
              <div className={`lg-roulette ${phase === "spinning" ? "is-spinning" : ""}`}>
                {roll ?? "?"}
              </div>
              {phase === "branch" ? (
                <div className="lg-choices">
                  <p className="lg-choice-q">{cell.label}</p>
                  {cell.next.map((nid, i) => (
                    <button key={nid} className="lg-btn lg-btn-choice" onClick={() => choose(nid)}>
                      {cell.choices?.[i] ?? BOARD[nid].label}
                    </button>
                  ))}
                </div>
              ) : state.finished ? (
                <button className="lg-btn" onClick={restart}>
                  もう一度あそぶ
                </button>
              ) : (
                <button className="lg-btn" onClick={spin} disabled={phase !== "idle"}>
                  {phase === "idle" ? "ルーレットを回す" : "…"}
                </button>
              )}
            </div>

            <div className="lg-message">
              <div className="lg-message-title">
                {phase === "branch" ? "分かれ道" : `現在地：${cell.label}`}
              </div>
              {messages.length === 0 ? (
                <p className="lg-message-body">ルーレットを回して人生を進めよう。</p>
              ) : (
                messages.map((m, i) => (
                  <p className="lg-message-body" key={i}>
                    {m}
                  </p>
                ))
              )}
            </div>

            <div className="lg-log">
              <div className="lg-log-title">できごと</div>
              <ul>
                {[...state.log].reverse().map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {result && (
        <div className="lg-modal-bg">
          <div className="lg-modal">
            <div className="lg-modal-flag">🏁</div>
            <h2 className="lg-modal-title">{result.title}</h2>
            <p className="lg-modal-comment">{result.comment}</p>
            <ul className="lg-modal-stats">
              <li>最終年齢：{state.age}歳</li>
              <li>所持金：{yen(state.money)}</li>
              <li>職業：{state.job}</li>
              <li>結婚：{state.married ? "した" : "しなかった"}</li>
              <li>子ども：{state.children}人</li>
              <li className="lg-modal-score">スコア：{score(state)}</li>
            </ul>
            <button className="lg-btn" onClick={restart}>
              もう一度あそぶ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
