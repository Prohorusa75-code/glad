import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { Calculator, OrderForm, OrderProvider } from "@/components/Order";
import { RevealObserver } from "@/components/Reveal";
import { SilkBackground } from "@/components/SilkBackground";
import { COURIER_FREE_FROM, FAQ, SERVICES, STEPS, rub } from "@/lib/data";

const WRAP = "mx-auto w-full max-w-[1440px] px-4 sm:px-[clamp(16px,5vw,80px)]";
const BTN =
  "inline-flex h-13 items-center justify-center gap-2 rounded-full px-7 text-base font-semibold transition-transform duration-[350ms] ease-out-soft hover:scale-105 active:scale-[0.97]";

/* Ритм разделов: крупный заголовок слева — короткая мысль справа */
function Head({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className="reveal mb-12 grid gap-5 lg:mb-16 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-[9%]">
      <h2 className="text-[clamp(38px,5vw,72px)] leading-[1.04] font-medium tracking-[-0.055em] text-balance">{title}</h2>
      {children && <p className="max-w-md text-[17px] leading-relaxed text-muted">{children}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <OrderProvider>
      <RevealObserver />

      {/* шапка */}
      <header className="fixed inset-x-0 top-0 z-40 bg-gradient-to-b from-ink/95 via-ink/70 to-transparent pt-3 pb-6 sm:pt-4">
        <div className={`${WRAP} flex items-center justify-between gap-4`}>
          <a href="#top" className="text-xl font-bold tracking-[-0.03em]">
            гладь<span className="text-glow">*</span>
          </a>
          <nav aria-label="Разделы" className="glass hidden gap-1 rounded-full p-1.5 md:flex">
            {[
              ["#services", "Услуги"],
              ["#prices", "Цены"],
              ["#steps", "Как работаем"],
              ["#faq", "Вопросы"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="rounded-full px-4 py-2 text-[15px] text-muted transition-colors hover:bg-white/10 hover:text-paper">
                {label}
              </a>
            ))}
          </nav>
          <a href="#order" className={`${BTN} glass h-11 px-5 text-[15px]`}>
            Вызвать курьера
          </a>
        </div>
      </header>

      <main id="top">
        {/* первый экран */}
        <section className={`${WRAP} pt-[76px] sm:pt-[88px]`}>
          <div className="relative flex min-h-[min(86svh,820px)] items-end overflow-hidden rounded-[28px] border border-line bg-frame">
            <SilkBackground className="absolute inset-0" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/90" aria-hidden="true" />

            {/* стеклянные факты поверх ткани */}
            <div className="absolute top-8 right-8 hidden flex-col gap-3 lg:flex" aria-hidden="true">
              <div className="glass rounded-[20px] px-5 py-4">
                <p className="text-3xl font-semibold tracking-tight">48 ч</p>
                <p className="text-sm text-muted">обычный срок чистки</p>
              </div>
              <div className="glass ml-10 rounded-[20px] px-5 py-4">
                <p className="text-3xl font-semibold tracking-tight">0 ₽</p>
                <p className="text-sm text-muted">вывоз от {rub(COURIER_FREE_FROM)}</p>
              </div>
            </div>

            <div className="relative z-10 w-full p-[clamp(20px,4vw,56px)]">
              <p className="glass inline-flex items-center gap-2.5 rounded-full px-3.5 py-2 text-sm text-[#d6dbe6]">
                <span className="size-2 rounded-full bg-[#5df2b0] shadow-[0_0_12px_#5df2b0]" aria-hidden="true" />
                Курьер заберёт уже сегодня
              </p>
              <h1 className="mt-5 mb-5 bg-gradient-to-b from-white via-white/85 to-[#bcd8ff]/50 bg-clip-text text-[clamp(84px,17vw,250px)] leading-[0.88] font-bold tracking-[-0.065em] text-transparent drop-shadow-[0_10px_40px_#4aa3ff33]">
                Гладь.
              </h1>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <p className="max-w-xl text-[clamp(19px,2vw,24px)] leading-snug tracking-[-0.02em] text-[#d9dde6]">
                  Химчистка с курьером. Заберём вещи от двери и вернём чистыми, отглаженными и в чехлах.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a href="#order" className={`${BTN} bg-white text-ink`}>
                    Оформить вывоз ↗
                  </a>
                  <a href="#prices" className={`${BTN} glass`}>
                    Посчитать стоимость ↓
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* подход */}
        <section className={`${WRAP} pt-[clamp(76px,10vw,124px)] pb-4`}>
          <Head title={<>Вещи как новые.<br />Без хлопот.</>}>
            Вы не тратите выходные на химчистку: <span className="glow-word">курьер приедет сам</span>, а через
            два дня вещи вернутся <span className="glow-word">готовыми к носке</span>.
          </Head>
        </section>

        {/* услуги */}
        <section id="services" className={`${WRAP} scroll-mt-20 pb-[clamp(76px,10vw,124px)]`}>
          <Head title={<>Что мы<br />чистим.</>}>От рубашки на понедельник до штор в гостиной.</Head>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <article key={s.title} className="reveal glass rounded-[24px] p-7" style={{ "--d": `${(i % 3) * 0.08}s` } as CSSProperties}>
                <div className="glass mb-6 grid size-[58px] place-items-center rounded-[18px]">
                  <Icon name={s.icon} />
                </div>
                <h3 className="mb-2 text-[22px] font-semibold tracking-[-0.03em]">{s.title}</h3>
                <p className="leading-relaxed text-muted">{s.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* цены */}
        <section id="prices" className={`${WRAP} scroll-mt-20 pb-[clamp(76px,10vw,124px)]`}>
          <Head title={<>Цены<br />без сюрпризов.</>}>
            Отметьте вещи — сумма посчитается сразу. Вывоз и доставка бесплатно от {rub(COURIER_FREE_FROM)}. Цены
            примерные: это концепт.
          </Head>
          <div className="reveal">
            <Calculator />
          </div>
        </section>

        {/* этапы */}
        <section id="steps" className={`${WRAP} scroll-mt-20 pb-[clamp(76px,10vw,124px)]`}>
          <Head title={<>Четыре шага<br />до чистых вещей.</>} />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="reveal border-t border-line pt-6" style={{ "--d": `${i * 0.08}s` } as CSSProperties}>
                <span className="glass grid size-11 place-items-center rounded-full text-sm font-semibold tabular-nums">0{i + 1}</span>
                <h3 className="mt-5 mb-2 text-[22px] font-semibold tracking-[-0.03em]">{s.title}</h3>
                <p className="leading-relaxed text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* вопросы */}
        <section id="faq" className={`${WRAP} scroll-mt-20 pb-[clamp(76px,10vw,124px)]`}>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-[9%]">
            <h2 className="reveal text-[clamp(38px,5vw,72px)] leading-[1.04] font-medium tracking-[-0.055em]">
              До первого
              <br />
              заказа.
            </h2>
            <div className="reveal divide-y divide-line border-y border-line">
              {FAQ.map((f) => (
                <details key={f.q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium tracking-tight">
                    {f.q}
                    <span className="faq-icon glass grid size-9 shrink-0 place-items-center rounded-full text-xl leading-none transition-transform duration-500 ease-out-soft" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p className="max-w-xl pb-6 leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* заявка */}
        <section id="order" className={`${WRAP} scroll-mt-20 pb-[clamp(60px,8vw,100px)]`}>
          <div className="reveal glass grid gap-10 rounded-[28px] p-[clamp(24px,5vw,64px)] lg:grid-cols-[1.1fr_1fr] lg:gap-[9%]">
            <div className="flex flex-col justify-between gap-8">
              <div>
                <h2 className="mb-4 text-[clamp(38px,4.6vw,66px)] leading-[1.04] font-medium tracking-[-0.055em]">
                  Оформим
                  <br />
                  вывоз.
                </h2>
                <p className="max-w-md text-[17px] leading-relaxed text-muted">
                  Оставьте телефон — перезвоним за 10 минут, уточним вещи и время. Состав заказа из калькулятора
                  подставится сам.
                </p>
              </div>
              <p className="text-sm text-muted">Ежедневно с 8:00 до 22:00</p>
            </div>
            <OrderForm />
          </div>
        </section>
      </main>

      <footer className={`${WRAP} flex flex-col gap-3 border-t border-line py-9 text-sm text-muted sm:flex-row sm:items-center sm:justify-between`}>
        <p>
          <span className="font-semibold text-paper">гладь*</span> — химчистка с курьером
        </p>
        <p>Концепт для портфолио: бренд и цены вымышленные.</p>
        <a href="#top" className="hover:text-paper">
          Наверх ↑
        </a>
      </footer>
    </OrderProvider>
  );
}
