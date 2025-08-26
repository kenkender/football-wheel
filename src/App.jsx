// src/App.jsx
import React, { useMemo, useRef, useState } from "react";

/**
 * วงล้อจับคู่ทีมฟุตบอล (React + Tailwind, JavaScript ล้วน)
 * - วงล้อกลมแท้ (rounded-full + overflow-hidden)
 * - สี 4 ชิ้น: แดง / เหลือง / น้ำเงิน / เขียว
 * - หมุนด้วยปุ่ม หรือคลิกลูกศรด้านบน
 * - จับคู่ทีละ 2 ทีม พร้อม Popup แสดงผล
 */

export default function TeamWheelMatcher() {
  // === State หลัก ===
  const [teamNames, setTeamNames] = useState(["ทีม A", "ทีม B", "ทีม C", "ทีม D"]);
  const [pool, setPool] = useState([...teamNames]);
  const [firstPick, setFirstPick] = useState(null);
  const [matches, setMatches] = useState([]); // [{a,b}]
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);

  // Popup
  const [resultOpen, setResultOpen] = useState(false);
  const [resultPair, setResultPair] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  // ขนาดวงล้อ
  const WHEEL_SIZE = 360;
  const slice = 360 / teamNames.length;
  const wheelRef = useRef(null);

  // === สีหลัก 4 สี (แดง/เหลือง/น้ำเงิน/เขียว) วนซ้ำหากทีม > 4 ===
  const baseColors = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];
  const colors = useMemo(
    () => teamNames.map((_, i) => baseColors[i % baseColors.length]),
    [teamNames]
  );

  // ทำพื้นหลังวงล้อเป็นชิ้น ๆ ด้วย conic-gradient
  const wheelBackground = useMemo(() => {
    const steps = teamNames.map((_, i) => {
      const start = i * slice;
      const end = (i + 1) * slice;
      const c = colors[i % colors.length];
      return `${c} ${start}deg ${end}deg`;
    });
    return `conic-gradient(${steps.join(", ")})`;
  }, [teamNames, slice, colors]);

  // === กลไกการหมุน ===
  function spinToIndex(targetIndex) {
    if (spinning) return;
    setSpinning(true);

    const targetCenter = targetIndex * slice + slice / 2; // กลางของชิ้น
    const rounds = 5 + Math.floor(Math.random() * 4);
    const jitter = (Math.random() - 0.5) * slice * 0.44;

    const current = angle;
    const currentPointing = ((360 - (current % 360)) + 360) % 360;
    const deltaToTarget = ((targetCenter + jitter - currentPointing) + 360) % 360;
    const finalAngle = current + rounds * 360 + deltaToTarget;

    const el = wheelRef.current;
    if (el) {
      el.style.transition = "transform 3.2s cubic-bezier(0.12, 0.7, 0, 1)";
      requestAnimationFrame(() => setAngle(finalAngle));

      const onEnd = () => {
        el.removeEventListener("transitionend", onEnd);
        el.style.transition = "";
        setSpinning(false);
        handleLanded(targetIndex);
      };
      el.addEventListener("transitionend", onEnd);
    } else {
      setAngle(finalAngle);
      setTimeout(() => {
        setSpinning(false);
        handleLanded(targetIndex);
      }, 3300);
    }
  }

  function handleLanded(targetIndex) {
    const landedTeam = teamNames[targetIndex];
    if (!pool.includes(landedTeam)) {
      const fallbackTeam = pool[Math.floor(Math.random() * pool.length)];
      resolvePick(fallbackTeam);
      return;
    }
    resolvePick(landedTeam);
  }

  function resolvePick(team) {
    if (firstPick === null) {
      setFirstPick(team);
      setPool((prev) => prev.filter((t) => t !== team));
    } else {
      const pair = { a: firstPick, b: team };
      setMatches((prev) => [...prev, pair]);
      setResultPair(pair);
      setResultOpen(true);
      setFirstPick(null);
      setPool((prev) => prev.filter((t) => t !== team));
    }
  }

  function spin() {
    if (spinning) return;
    const candidates = pool;
    if (candidates.length === 0) return;
    const targetTeam = candidates[Math.floor(Math.random() * candidates.length)];
    const targetIndex = teamNames.findIndex((t) => t === targetTeam);
    if (targetIndex === -1) return;
    spinToIndex(targetIndex);
  }

  function onPointerClick() {
    spin();
  }

  function resetAll() {
    setMatches([]);
    setFirstPick(null);
    setPool([...teamNames]);
    const el = wheelRef.current;
    if (el) el.style.transition = "";
    setAngle(0);
  }

  function openEdit() {
    setEditOpen(true);
  }

  function applyEdit(newNames) {
    const cleaned = newNames.map((s) => s.trim()).filter(Boolean);
    if (cleaned.length < 2 || cleaned.length % 2 !== 0) {
      alert("กรุณาใส่ชื่อทีมอย่างน้อย 2 ทีม และเป็นจำนวนคู่ (2, 4, 6, ...)");
      return;
    }
    setTeamNames(cleaned);
    setPool([...cleaned]);
    setMatches([]);
    setFirstPick(null);
    setAngle(0);
    setEditOpen(false);
  }

  function closeResult() {
    setResultOpen(false);
  }

  const finished = pool.length === 0 && firstPick === null;
  const labels = useMemo(
    () => teamNames.map((name, i) => ({ name, rotate: i * slice + slice / 2 })),
    [teamNames, slice]
  );

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-10 items-start">
        {/* ========== ซ้าย: วงล้อ ========== */}
        <div className="w-full flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold tracking-tight">วงล้อจับคู่ทีมฟุตบอล</h1>

          <div className="relative">
            {/* เงาเรืองด้านหลัง */}
            <div
              className="absolute inset-0 blur-3xl rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(40% 40% at 50% 50%, rgba(59,130,246,0.25), rgba(239,68,68,0.15), rgba(34,197,94,0.15), transparent)",
                transform: "translate(-10px,-10px)",
              }}
            />

            {/* ชั้นครอบวงล้อ (เพื่อให้กลมสนิท) */}
            <div
              className="rounded-full overflow-hidden ring-2 ring-black/5 shadow-2xl bg-white"
              style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
            >
              <div
                ref={wheelRef}
                className="relative w-full h-full"
                style={{
                  background: wheelBackground,
                  transform: `rotate(${angle}deg)`,
                }}
              >
                {/* เส้นแบ่งชิ้น */}
                {teamNames.map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 origin-left"
                    style={{
                      width: WHEEL_SIZE / 2,
                      height: 2,
                      transform: `rotate(${i * slice}deg) translateX(-${WHEEL_SIZE / 2}px)`,
                      background: "rgba(255,255,255,0.7)",
                    }}
                  />
                ))}

                {/* ป้ายชื่อทีม */}
                {labels.map((l, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 origin-left text-sm md:text-base font-semibold drop-shadow"
                    style={{
                      transform: `rotate(${l.rotate}deg) translateX(${WHEEL_SIZE / 3.3}px) rotate(90deg)`,
                    }}
                  >
                    <span className="px-2 py-0.5 rounded-full bg-black/30 text-white backdrop-blur-sm">
                      {l.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ลูกศร pointer ด้านบน */}
            <button
              onClick={onPointerClick}
              disabled={spinning}
              className={`absolute -top-5 left-1/2 -translate-x-1/2 select-none active:scale-95 transition ${
                spinning ? "opacity-60" : "hover:drop-shadow"
              }`}
              aria-label="กดเพื่อหมุน"
              title="กดเพื่อหมุน"
            >
              <PointerIcon />
            </button>
          </div>

          {/* ปุ่มควบคุม */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={spin}
              disabled={spinning || finished}
              className={`px-5 py-2 rounded-2xl text-base font-semibold shadow-lg transition active:scale-95 ${
                spinning || finished
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-400 to-green-400 text-white hover:brightness-110"
              }`}
            >
              หมุนวงล้อ
            </button>
            <button
              onClick={resetAll}
              className="px-5 py-2 rounded-2xl text-base font-semibold bg-black/5 hover:bg-black/10 transition shadow-lg"
            >
              รีเซ็ต
            </button>
            <button
              onClick={openEdit}
              className="px-5 py-2 rounded-2xl text-base font-semibold bg-amber-400 hover:bg-amber-300 text-black transition shadow-lg"
            >
              แก้ไขชื่อทีม
            </button>
          </div>

          {/* สถานะสั้น ๆ */}
          <div className="text-slate-600 text-sm">
            {finished ? (
              <span>จับคู่ครบแล้ว — กด “รีเซ็ต” เพื่อเริ่มใหม่</span>
            ) : firstPick ? (
              <span>
                เลือกทีมแรกแล้ว: <b>{firstPick}</b> — หมุนอีกครั้งเพื่อหาอีกทีม
              </span>
            ) : (
              <span>กดปุ่มหรือคลิกลูกศรเพื่อหมุนวงล้อ</span>
            )}
          </div>
        </div>

        {/* ========== ขวา: รายชื่อทีม & ผลลัพธ์ ========== */}
        <div className="w-full space-y-6">
          <div className="p-4 rounded-2xl bg-white ring-1 ring-black/5 shadow-xl">
            <h2 className="text-lg font-bold mb-3">ทีมที่ร่วมจับคู่</h2>
            <div className="flex flex-wrap gap-2">
              {teamNames.map((t) => {
                const used =
                  !pool.includes(t) && t !== firstPick && !matches.some((m) => m.a === t || m.b === t);
                const inPool = pool.includes(t);
                const isFirst = firstPick === t;
                return (
                  <span
                    key={t}
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      isFirst
                        ? "bg-yellow-300 text-slate-900 border-yellow-400"
                        : inPool
                        ? "bg-emerald-400/20 text-emerald-700 border-emerald-300"
                        : used
                        ? "bg-slate-200 text-slate-500 border-slate-300"
                        : "bg-slate-200 text-slate-500 border-slate-300"
                    }`}
                  >
                    {t}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white ring-1 ring-black/5 shadow-xl">
            <h2 className="text-lg font-bold mb-3">ผลการจับคู่</h2>
            {matches.length === 0 ? (
              <div className="text-slate-500">ยังไม่มีผลลัพธ์</div>
            ) : (
              <ul className="space-y-2">
                {matches.map((m, i) => (
                  <li key={i} className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                    <span className="font-semibold">คู่ที่ {i + 1}</span>
                    <span className="font-bold text-blue-600">{m.a}</span>
                    <span className="opacity-60">vs</span>
                    <span className="font-bold text-green-600">{m.b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Popup: แก้ชื่อทีม */}
      {editOpen && (
        <EditTeamsModal initial={teamNames} onClose={() => setEditOpen(false)} onApply={applyEdit} />
      )}

      {/* Popup: ผลลัพธ์ */}
      {resultOpen && resultPair && <ResultModal pair={resultPair} onClose={closeResult} />}
    </div>
  );
}

/* ===== ส่วนประกอบย่อย ===== */
function PointerIcon() {
  return (
    <div className="relative" style={{ width: 0, height: 0 }}>
      {/* สามเหลี่ยมชี้ลง */}
      <div
        className="pointer-events-none"
        style={{
          width: 0,
          height: 0,
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderBottom: "22px solid #111827", // slate-900
          filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.25))",
        }}
      />
      {/* ฐาน */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-900" />
    </div>
  );
}

function EditTeamsModal({ initial, onApply, onClose }) {
  const [text, setText] = useState(initial.join("\n"));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white text-slate-900 ring-1 ring-black/10 shadow-2xl">
        <div className="p-5 border-b border-black/10 flex items-center justify-between">
          <h3 className="text-lg font-bold">แก้ไขชื่อทีม</h3>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-black/5 hover:bg-black/10">
            ปิด
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-600">
            พิมพ์ชื่อทีละบรรทัด (ควรเป็นจำนวนคู่ เช่น 4, 6, 8 ... เพื่อประกบได้พอดี)
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="w-full rounded-xl bg-slate-50 border border-black/10 p-3 outline-none focus:border-blue-400"
          />
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-black/5 hover:bg-black/10">
              ยกเลิก
            </button>
            <button
              onClick={() => onApply(text.split(/\r?\n/))}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-400 to-green-400 text-white font-semibold hover:brightness-110"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultModal({ pair, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white text-slate-900 ring-1 ring-black/10 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-black/10">
          <h3 className="text-lg font-bold">ผลการจับคู่</h3>
        </div>
        <div className="p-6 text-center space-y-4">
          <div className="text-sm text-slate-600">ทีมที่ต้องเจอกันคือ</div>
          <div className="text-2xl font-black tracking-wide">
            <span className="text-blue-600">{pair.a}</span>
            <span className="mx-3 opacity-70">vs</span>
            <span className="text-green-600">{pair.b}</span>
          </div>
          <div className="mt-2 animate-pulse text-slate-500">ขอให้เป็นเกมที่สนุก! ⚽</div>
        </div>
        <div className="p-5 border-t border-black/10 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-black/5 hover:bg-black/10">
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
