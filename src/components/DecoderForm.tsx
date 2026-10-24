import type { OfferInput, StateCode } from '../engine/types'
import { STATE_NAMES } from '../engine/professionalTax'
import { cityChoicesFor, cityFromLegacyMetro, isHraMetro, normaliseCity, ptVariesByTown, type CityChoice } from '../engine/city'
import { useT } from '../i18n'
import { Card, Details, Label, NumberField, Select, Toggle } from './ui'

const L = 100_000

export function DecoderForm({
  value,
  onChange,
}: {
  value: OfferInput
  onChange: (v: OfferInput) => void
}) {
  const t = useT()
  const set = (patch: Partial<OfferInput>) => onChange({ ...value, ...patch })
  const old = value.old ?? { rentPaidMonthly: 0, metro: false, deduction80CExtra: 0, deduction80D: 0 }
  // Offers saved before the city field only carry the metro on/off answer.
  const city = value.city !== undefined ? normaliseCity(value.state, value.city) : cityFromLegacyMetro(value.state, old.metro)
  const setCity = (state: StateCode, next: CityChoice) =>
    set({ state, city: next, old: { ...old, metro: isHraMetro(state, next) } })

  return (
    <Card className="space-y-4">
      <h2 className="text-base font-bold">{t('decoder.title')}</h2>

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label={t('decoder.field.ctc.label')}
          suffix="LPA"
          step={0.5}
          value={value.ctcAnnual / L}
          onChange={(v) => set({ ctcAnnual: v * L })}
        />
        <NumberField
          label={t('decoder.field.variable.label')}
          suffix="LPA"
          step={0.5}
          value={value.variableAnnual / L}
          onChange={(v) => set({ variableAnnual: v * L })}
        />
        <NumberField
          label={t('decoder.field.basic.label')}
          hint={t('decoder.field.basic.hint')}
          suffix="%"
          max={100}
          value={value.basicPercent}
          onChange={(v) => set({ basicPercent: Math.min(100, v) })}
        />
        <NumberField
          label={t('decoder.field.notice.label')}
          suffix={t('unit.days')}
          value={value.noticePeriodDays}
          onChange={(v) => set({ noticePeriodDays: v })}
        />
      </div>

      <label className="block">
        <Label>{t('decoder.field.state.label')}</Label>
        <select
          className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-[15px] font-medium outline-none focus:border-saffron"
          value={value.state}
          onChange={(e) => {
            const state = e.target.value as StateCode
            setCity(state, normaliseCity(state, city))
          }}
        >
          {(Object.keys(STATE_NAMES) as StateCode[]).map((s) => (
            <option key={s} value={s}>
              {t(`state.${s}`)}
            </option>
          ))}
        </select>
      </label>

      <Select
        label={t('city.label')}
        hint={t('city.hint')}
        value={city}
        onChange={(v) => setCity(value.state, v)}
        options={cityChoicesFor(value.state).map((c) => ({
          value: c,
          label: c === 'other' ? t('city.other', { state: t(`state.${value.state}`) }) : t(`city.${c}`),
        }))}
      />
      {ptVariesByTown(value.state, city) && (
        <p className="text-[13px] text-ink-soft">{t('city.ptTown', { state: t(`state.${value.state}`) })}</p>
      )}

      <div className="space-y-2">
        <Toggle
          label={t('decoder.toggle.employerPf.label')}
          hint={t('decoder.toggle.employerPf.hint')}
          checked={value.employerPfInCtc}
          onChange={(v) => set({ employerPfInCtc: v })}
        />
        <Toggle
          label={t('decoder.toggle.gratuity.label')}
          hint={t('decoder.toggle.gratuity.hint')}
          checked={value.gratuityInCtc}
          onChange={(v) => set({ gratuityInCtc: v })}
        />
        <Toggle
          label={t('decoder.toggle.pfFull.label')}
          hint={t('decoder.toggle.pfFull.hint')}
          checked={value.pfOnFullBasic}
          onChange={(v) => set({ pfOnFullBasic: v })}
        />
      </div>

      <Details summary={t('decoder.details.extras')}>
        <NumberField
          label={t('decoder.field.esopValue.label')}
          suffix="LPA"
          step={0.5}
          value={(value.esop?.annualValue ?? 0) / L}
          onChange={(v) =>
            set({
              esop:
                v > 0
                  ? { annualValue: v * L, cliffMonths: value.esop?.cliffMonths ?? 12, liquid: value.esop?.liquid ?? false }
                  : undefined,
            })
          }
        />
        {value.esop && (
          <>
            <NumberField
              label={t('decoder.field.esopCliff.label')}
              suffix={t('unit.months')}
              value={value.esop.cliffMonths}
              onChange={(v) => set({ esop: { ...value.esop!, cliffMonths: v } })}
            />
            <Toggle
              label={t('decoder.toggle.esopLiquid.label')}
              checked={value.esop.liquid}
              onChange={(v) => set({ esop: { ...value.esop!, liquid: v } })}
            />
          </>
        )}
        <NumberField
          label={t('decoder.field.joiningBonus.label')}
          suffix="₹ L"
          step={0.5}
          value={(value.joiningBonus?.amount ?? 0) / L}
          onChange={(v) =>
            set({
              joiningBonus:
                v > 0 ? { amount: v * L, clawbackMonths: value.joiningBonus?.clawbackMonths ?? 12 } : undefined,
            })
          }
        />
        {value.joiningBonus && (
          <NumberField
            label={t('decoder.field.clawback.label')}
            suffix={t('unit.months')}
            value={value.joiningBonus.clawbackMonths}
            onChange={(v) => set({ joiningBonus: { ...value.joiningBonus!, clawbackMonths: v } })}
          />
        )}
        <NumberField
          label={t('decoder.field.bondAmount.label')}
          suffix="₹ L"
          step={0.5}
          value={(value.bond?.amount ?? 0) / L}
          onChange={(v) => set({ bond: v > 0 ? { amount: v * L, months: value.bond?.months ?? 12 } : undefined })}
        />
        {value.bond && (
          <NumberField
            label={t('decoder.field.bondMonths.label')}
            suffix={t('unit.months')}
            value={value.bond.months}
            onChange={(v) => set({ bond: { ...value.bond!, months: v } })}
          />
        )}
      </Details>

      <Details summary={t('decoder.details.oldRegime')}>
        <NumberField
          label={t('decoder.field.rent.label')}
          suffix="₹/month"
          step={1000}
          value={old.rentPaidMonthly}
          onChange={(v) => set({ old: { ...old, rentPaidMonthly: v } })}
        />
        <NumberField
          label={t('decoder.field.deduction80c.label')}
          hint={t('decoder.field.deduction80c.hint')}
          suffix="₹/yr"
          step={5000}
          value={old.deduction80CExtra}
          onChange={(v) => set({ old: { ...old, deduction80CExtra: v } })}
        />
        <NumberField
          label={t('decoder.field.deduction80d.label')}
          suffix="₹/yr"
          step={1000}
          value={old.deduction80D}
          onChange={(v) => set({ old: { ...old, deduction80D: v } })}
        />
      </Details>

      <label className="block">
        <Label>{t('decoder.field.hra.label')}</Label>
        <input
          type="range"
          min={0}
          max={60}
          value={value.hraPercentOfBasic}
          onChange={(e) => set({ hraPercentOfBasic: Number(e.target.value) })}
          className="mt-2 w-full accent-saffron"
        />
        <span className="tnum text-xs font-medium text-ink-faint">
          {t('decoder.field.hra.value', { percent: value.hraPercentOfBasic })}
        </span>
      </label>
    </Card>
  )
}
