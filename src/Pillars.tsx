import type { Chart, ElementName, Pillar } from './types';

/**
 * The four pillars the way a BaZi chart is read: four columns, right to left
 * in the classical order, stem above branch, hidden stems below the branch.
 *
 * The day pillar is marked because its stem is the day master, the character
 * the whole chart is measured against. Reading the grid without knowing which
 * column that is tells you nothing.
 */

const ELEMENT_ORDER: ElementName[] = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];

/* Classical five-phase colours. Earth is the one people expect to be brown and
   which is yellow in every Chinese source, so it is yellow here. */
const ELEMENT_CLASS: Record<ElementName, string> = {
  Wood: 'el-wood',
  Fire: 'el-fire',
  Earth: 'el-earth',
  Metal: 'el-metal',
  Water: 'el-water',
};

const COLUMN_LABEL: Record<Pillar['name'], string> = {
  hour: 'Hour',
  day: 'Day',
  month: 'Month',
  year: 'Year',
};

/* The container is `direction: rtl`, so the first entry here lands on the
   right. Year first therefore means year on the right, which is where every
   classical text puts it: 年 月 日 時 read right to left. A chart printed the
   other way is not wrong, but a reader who knows the form looks right first. */
const ORDER: Pillar['name'][] = ['year', 'month', 'day', 'hour'];

function PillarColumn({ pillar }: { pillar: Pillar }) {
  const isDayMaster = pillar.name === 'day';
  return (
    <div className={`pillar${isDayMaster ? ' pillar-day' : ''}`}>
      <div className="pillar-label">
        {COLUMN_LABEL[pillar.name]}
        {isDayMaster ? <span className="tag">day master</span> : null}
      </div>

      <div className={`glyph stem ${ELEMENT_CLASS[pillar.stemElement]}`}>
        <span className="glyph-main">{pillar.stem}</span>
        <span className="glyph-sub">{pillar.stemElementName}</span>
      </div>

      <div className="glyph branch">
        <span className="glyph-main">{pillar.branch}</span>
        <span className="glyph-sub">{pillar.animalName}</span>
      </div>

      <ul className="hidden-stems">
        {pillar.hiddenStems.map((h) => (
          <li key={h.stem} className={ELEMENT_CLASS[h.element]} title={`${h.role}, weight ${h.weight}`}>
            <span>{h.stem}</span>
            <small>{h.role}</small>
          </li>
        ))}
      </ul>

      <div className="na-yin" title={pillar.naYin.pinyin}>
        {pillar.naYin.chinese} <small>{pillar.naYin.english}</small>
      </div>

      <div className="stage" title="The day master's twelve-stage phase in this branch">
        {pillar.dayMasterStage.chinese} <small>{pillar.dayMasterStage.name}</small>
      </div>
    </div>
  );
}

function Balance({ chart }: { chart: Chart }) {
  const weighted = chart.elementBalance.weighted;
  const max = Math.max(...ELEMENT_ORDER.map((e) => weighted[e] ?? 0), 1);
  const favourable = new Set(chart.strength.favourableElements);
  const unfavourable = new Set(chart.strength.unfavourableElements);
  return (
    <div className="balance">
      {ELEMENT_ORDER.map((el) => {
        const value = weighted[el] ?? 0;
        const mark = favourable.has(el) ? 'favourable' : unfavourable.has(el) ? 'unfavourable' : '';
        return (
          <div className="bar-row" key={el}>
            <span className="bar-label">{el}</span>
            <span className="bar-track">
              <span className={`bar-fill ${ELEMENT_CLASS[el]}`} style={{ width: `${(value / max) * 100}%` }} />
            </span>
            <span className="bar-value">
              {value.toFixed(1)}
              {mark ? <em className={mark}>{mark === 'favourable' ? 'useful' : 'unhelpful'}</em> : null}
            </span>
          </div>
        );
      })}
      <p className="muted small">{chart.elementBalance.weighting}</p>
    </div>
  );
}

export function Pillars({ chart }: { chart: Chart }) {
  const byName = new Map(chart.pillars.map((p) => [p.name, p]));
  return (
    <div className="chart-grid">
      <div className="pillars">
        {ORDER.map((name) => {
          const p = byName.get(name);
          return p ? <PillarColumn key={name} pillar={p} /> : null;
        })}
      </div>
      <div className="panel">
        <h3>Element balance</h3>
        <Balance chart={chart} />
      </div>
    </div>
  );
}
