import { useState, type FormEvent } from 'react';
import type { BirthInput, Chart, Luck, Reading } from './types';
import { Pillars } from './Pillars';

/* A worked example, so the first thing a visitor sees is a chart and not an
   empty form. Shanghai takes the zone name rather than an offset: China has
   run one zone since 1949 but kept summer time from 1986 to 1991, and 1990
   falls inside that. */
const SAMPLE: BirthInput = {
  date: '1990-05-15',
  time: '14:30:00',
  timezone: 'Asia/Shanghai',
  latitude: '31.23',
  longitude: '121.47',
  gender: 'female',
};

function Field(props: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="field">
      <span className="field-label">{props.label}</span>
      <input
        type={props.type ?? 'text'}
        value={props.value}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
      />
      {props.hint ? <span className="field-hint">{props.hint}</span> : null}
    </label>
  );
}

function DayMaster({ chart }: { chart: Chart }) {
  const s = chart.strength;
  return (
    <dl className="summary">
      <div>
        <dt>Day master</dt>
        <dd>{chart.dayMaster.stem}, {chart.dayMaster.polarity} {chart.dayMaster.elementName}</dd>
      </div>
      <div>
        <dt>Strength</dt>
        <dd>{s.verdict} <small>({s.supportScore} support vs {s.drainScore} drain)</small></dd>
      </div>
      <div>
        <dt>Rooted</dt>
        <dd>{[s.hasSeason && 'in season', s.hasRoot && 'rooted', s.hasAllies && 'with allies']
          .filter(Boolean).join(', ') || 'none of season, root or allies'}</dd>
      </div>
      <div>
        <dt>Useful elements</dt>
        <dd>{s.favourableElements.join(', ') || 'none named'}</dd>
      </div>
      <div>
        <dt>Dominant</dt>
        <dd>{chart.elementBalance.dominantElementName}</dd>
      </div>
      <div>
        <dt>Missing</dt>
        <dd>{chart.elementBalance.missingElementNames.join(', ') || 'none'}</dd>
      </div>
    </dl>
  );
}

function LuckPillars({ luck }: { luck: Luck }) {
  const ref = luck.startReference;
  return (
    <section>
      <h2>Luck pillars</h2>
      <p className="muted">
        Da Yun runs {luck.direction} from {ref.term} ({ref.pinyin}), {ref.days.toFixed(2)} days
        from birth, which is why the first one starts at age {luck.startAge.years}
        {luck.startAge.months ? ` and ${luck.startAge.months} months` : ''}. Ten years each.
      </p>
      <ol className="luck">
        {luck.luckPillars.map((p) => (
          <li key={p.pillar}>
            <span className="luck-age">{p.ageStart}</span>
            <span className="luck-pillar">{p.pillar}</span>
            <span className="luck-el">{p.elementName}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Stars({ chart }: { chart: Chart }) {
  const all = [...chart.symbolicStars.byYearPillar, ...chart.symbolicStars.byDayPillar];
  if (!all.length) return <p className="muted">No symbolic star is drawn from either reference pillar.</p>;
  return (
    <ul className="stars">
      {all.map((s) => (
        <li key={`${s.key}-${s.pillars.join()}`}>
          <strong>{s.chinese} {s.english}</strong>
          <span className="where">{s.pillars.join(', ')} pillar</span>
          <span>{s.meaning}</span>
          {s.schoolNote ? <em className="school">{s.schoolNote}</em> : null}
        </li>
      ))}
    </ul>
  );
}

function Interactions({ chart }: { chart: Chart }) {
  if (!chart.interactions.length) {
    return <p className="muted">No combination, clash or punishment between these four branches.</p>;
  }
  return (
    <ul className="interactions">
      {chart.interactions.map((i) => (
        <li key={`${i.type}-${i.members.join()}`}>
          <strong>{i.chinese} {i.english}</strong>
          <span>{i.members.join(' + ')} in the {i.pillars.join(' and ')} pillar</span>
          {i.producesElement ? <span className="produces">produces {i.producesElement}</span> : null}
          {i.schoolNote ? <em className="school">{i.schoolNote}</em> : null}
        </li>
      ))}
    </ul>
  );
}

export function App() {
  const [input, setInput] = useState<BirthInput>(SAMPLE);
  const [reading, setReading] = useState<Reading | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof BirthInput) => (v: string) => setInput((s) => ({ ...s, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWarning(null);
    try {
      /* Our own server, never api.astroway.info. The key lives there and the
         browser could not reach the API directly even if it had one.
         BASE_URL is '/' unless the app was built for a subpath, which is how
         the demo runs under /demo/bazi/ without a fork. */
      const res = await fetch(`${import.meta.env.BASE_URL}api/reading`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Server answered ${res.status}.`);
      setReading(json.data as Reading);
      setWarning(json.warning ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setReading(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <header>
        <h1>BaZi reader</h1>
        <p className="lede">
          Two calls return the four pillars with their hidden stems and na yin, the day master
          and its strength, the element balance, the symbolic stars, the branch interactions and
          the ten-year luck cycle. This page draws them.
        </p>
        <ul className="endpoints">
          <li><code>POST /v1/bazi/chart</code></li>
          <li><code>POST /v1/bazi/luck-pillars</code></li>
        </ul>
      </header>

      <form onSubmit={submit}>
        <div className="grid">
          <Field label="Date of birth" value={input.date} onChange={set('date')} type="date" />
          <Field label="Time of birth" hint="Exact. Two hours out moves the hour pillar." value={input.time} onChange={set('time')} placeholder="14:30:00" />
          <Field label="Time zone" hint="IANA name. Do not compute an offset yourself." value={input.timezone} onChange={set('timezone')} placeholder="Asia/Shanghai" />
          <Field label="Latitude" value={input.latitude} onChange={set('latitude')} placeholder="31.23" />
          <Field label="Longitude" value={input.longitude} onChange={set('longitude')} placeholder="121.47" />
          <label className="field">
            <span className="field-label">Gender</span>
            <select value={input.gender} onChange={(e) => set('gender')(e.target.value)}>
              <option value="female">female</option>
              <option value="male">male</option>
            </select>
            <span className="field-hint">Da Yun runs forward or backward depending on it.</span>
          </label>
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Reading…' : 'Read the chart'}</button>
      </form>

      {error ? <p className="error">{error}</p> : null}
      {warning ? <p className="warning">{warning}</p> : null}

      {reading ? (
        <section className="result">
          <Pillars chart={reading.chart} />

          <h2>Day master</h2>
          <DayMaster chart={reading.chart} />
          <p className="muted small">{reading.chart.strength.caveat}</p>

          {reading.luck ? <LuckPillars luck={reading.luck} /> : null}

          <h2>Symbolic stars</h2>
          <Stars chart={reading.chart} />

          <h2>Branch interactions</h2>
          <Interactions chart={reading.chart} />

          <p className="muted small">{reading.chart.methodology}</p>
        </section>
      ) : null}

      <footer>
        <p>
          Built on the <a href="https://api.astroway.info">AstroWay API</a>.
          Source: <a href="https://github.com/astroway/starter-bazi">astroway/starter-bazi</a>.
        </p>
      </footer>
    </main>
  );
}
