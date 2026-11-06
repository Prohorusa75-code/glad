"use client";

import { createContext, useContext, useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { COURIER_FREE_FROM, COURIER_PRICE, PRICES, rub } from "@/lib/data";

/* Общее состояние заказа: калькулятор в разделе «Цены» и форма заявки
   внизу видят один и тот же набор вещей. */

type Cart = Record<string, number>;
type Ctx = {
  cart: Cart;
  setQty: (id: string, qty: number) => void;
  sum: number;
  count: number;
  courier: number;
};

const OrderCtx = createContext<Ctx | null>(null);
const useOrder = () => {
  const ctx = useContext(OrderCtx);
  if (!ctx) throw new Error("OrderProvider is missing");
  return ctx;
};

export function OrderProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({ shirt: 3, suit: 1 });
  const value = useMemo<Ctx>(() => {
    const sum = PRICES.reduce((s, p) => s + p.price * (cart[p.id] || 0), 0);
    const count = Object.values(cart).reduce((s, n) => s + n, 0);
    const courier = count === 0 || sum >= COURIER_FREE_FROM ? 0 : COURIER_PRICE;
    return {
      cart,
      sum,
      count,
      courier,
      setQty: (id, qty) => setCart((c) => ({ ...c, [id]: Math.max(0, Math.min(20, qty)) })),
    };
  }, [cart]);
  return <OrderCtx.Provider value={value}>{children}</OrderCtx.Provider>;
}

function Stepper({ id, name }: { id: string; name: string }) {
  const { cart, setQty } = useOrder();
  const qty = cart[id] || 0;
  const btn =
    "grid size-10 place-items-center rounded-full border border-line text-lg leading-none transition-[transform,background-color] duration-300 ease-out-soft hover:bg-white/10 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent";
  return (
    <div className="flex items-center gap-2" role="group" aria-label={`Количество: ${name}`}>
      <button type="button" className={btn} onClick={() => setQty(id, qty - 1)} disabled={qty === 0} aria-label={`Убрать: ${name}`}>
        −
      </button>
      <output className="w-7 text-center text-lg font-semibold tabular-nums" aria-live="polite">
        {qty}
      </output>
      <button type="button" className={btn} onClick={() => setQty(id, qty + 1)} aria-label={`Добавить: ${name}`}>
        +
      </button>
    </div>
  );
}

export function Calculator() {
  const { sum, count, courier } = useOrder();
  const left = COURIER_FREE_FROM - sum;
  return (
    <div className="glass overflow-hidden rounded-[28px]">
      <ul className="divide-y divide-line">
        {PRICES.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <div className="min-w-0">
              <p className="text-lg font-medium tracking-tight">{p.name}</p>
              <p className="text-sm text-muted">
                {p.note} · от {rub(p.price)}
              </p>
            </div>
            <Stepper id={p.id} name={p.name} />
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-4 border-t border-line bg-white/[0.03] px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div aria-live="polite">
          <p className="text-sm text-muted">
            {count === 0
              ? "Добавьте вещи, чтобы посчитать заказ"
              : courier
                ? `Вывоз ${rub(courier)} · до бесплатного осталось ${rub(left)}`
                : "Вывоз и доставка бесплатно"}
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
            ≈ {rub(sum + courier)}
          </p>
        </div>
        <a
          href="#order"
          className="inline-flex h-13 items-center justify-center rounded-full bg-white px-7 font-semibold text-ink transition-transform duration-300 ease-out-soft hover:scale-105 active:scale-[0.97]"
        >
          Оформить вывоз ↓
        </a>
      </div>
    </div>
  );
}

const SLOTS = ["Сегодня, 18:00–20:00", "Сегодня, 20:00–22:00", "Завтра, 08:00–10:00", "Завтра, 18:00–20:00"];

export function OrderForm() {
  const { cart, sum, count, courier } = useOrder();
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const uid = useId();

  const lines = PRICES.filter((p) => cart[p.id]).map((p) => `${p.name} × ${cart[p.id]}`);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const digits = String(fd.get("phone") || "").replace(/\D/g, "");
    const next: typeof errors = {};
    if (name.length < 2) next.name = "Напишите, как к вам обращаться";
    if (digits.length < 10 || digits.length > 12) next.phone = "Проверьте номер: нужно 10–11 цифр";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = e.currentTarget.querySelector<HTMLInputElement>(next.name ? "[name=name]" : "[name=phone]");
      first?.focus();
      return;
    }
    setState("sending");
    window.setTimeout(() => setState("done"), 900);
  }

  if (state === "done") {
    return (
      <div role="status" className="flex flex-col justify-center gap-4">
        <p className="text-4xl font-semibold tracking-tight">Заявка принята.</p>
        <p className="max-w-md text-muted">
          Это концепт для портфолио: заявка никуда не отправлена, и курьер, увы, не приедет. Но выглядело бы именно так.
        </p>
        <button type="button" onClick={() => setState("idle")} className="self-start text-glow underline underline-offset-4">
          Заполнить ещё раз
        </button>
      </div>
    );
  }

  const field =
    "h-13 w-full rounded-2xl border border-line bg-white/[0.04] px-4 text-base text-paper placeholder:text-muted/70 transition-colors focus:border-glow/60 focus-visible:outline-offset-1";

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div>
        <label htmlFor={`${uid}-name`} className="mb-1.5 block text-sm text-muted">
          Имя
        </label>
        <input id={`${uid}-name`} name="name" autoComplete="given-name" placeholder="Анна" className={field}
          aria-invalid={!!errors.name} aria-describedby={errors.name ? `${uid}-name-err` : undefined} />
        {errors.name && <p id={`${uid}-name-err`} className="mt-1.5 text-sm text-[#ffb4a8]">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor={`${uid}-phone`} className="mb-1.5 block text-sm text-muted">
          Телефон
        </label>
        <input id={`${uid}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 900 000-00-00" className={field}
          aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${uid}-phone-err` : undefined} />
        {errors.phone && <p id={`${uid}-phone-err`} className="mt-1.5 text-sm text-[#ffb4a8]">{errors.phone}</p>}
      </div>
      <div>
        <label htmlFor={`${uid}-slot`} className="mb-1.5 block text-sm text-muted">
          Когда забрать
        </label>
        <select id={`${uid}-slot`} name="slot" className={`${field} appearance-none`} defaultValue={SLOTS[0]}>
          {SLOTS.map((s) => (
            <option key={s} className="bg-ink">
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-dashed border-line px-4 py-3 text-sm text-muted" aria-live="polite">
        {count === 0 ? (
          <>Вещи можно не выбирать — курьер посчитает на месте.</>
        ) : (
          <>
            <span className="text-paper">В заказе:</span> {lines.join(", ")}.{" "}
            <span className="text-paper">≈ {rub(sum + courier)}</span>
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-1 inline-flex h-14 items-center justify-center rounded-full bg-white px-8 font-semibold text-ink transition-transform duration-300 ease-out-soft hover:scale-[1.03] active:scale-[0.97] disabled:cursor-wait disabled:opacity-80"
      >
        {state === "sending" ? "Отправляем…" : "Вызвать курьера"}
      </button>
      <p className="text-xs text-muted">Демо-форма: данные никуда не отправляются и не сохраняются.</p>
    </form>
  );
}
