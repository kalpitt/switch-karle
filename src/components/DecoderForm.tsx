import type { OfferInput, StateCode } from '../engine/types'
import { STATE_NAMES } from '../engine/professionalTax'
import { Card, Details, Label, NumberField, Toggle } from './ui'

const L = 100_000

export function DecoderForm({
  value,
  onChange,
}: {
  value: OfferInput
  onChange: (v: OfferInput) => void
}) {
  const set = (patch: Partial<OfferInput>) => onChange({ ...value, ...patch })
  const old = value.old ?? { rentPaidMonthly: 0, metro: false, deduction80CExtra: 0, deduction80D: 0 }

  return (
    <Card className="space-y-4">
      <h2 className="text-base font-bold">Your offer</h2>

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Total CTC"
          suffix="LPA"
          step={0.5}
          value={value.ctcAnnual / L}
          onChange={(v) => set({ ctcAnnual: v * L })}
        />
        <NumberField
          label="Variable in CTC"
          suffix="LPA"
          step={0.5}
          value={value.variableAnnual / L}
          onChange={(v) => set({ variableAnnual: v * L })}
        />
        <NumberField
          label="Basic"
          hint="% of fixed pay"
          suffix="%"
          max={100}
          value={value.basicPercent}
          onChange={(v) => set({ basicPercent: Math.min(100, v) })}
        />
        <NumberField
          label="Notice period"
          suffix="days"
          value={value.noticePeriodDays}
          onChange={(v) => set({ noticePeriodDays: v })}
        />
      </div>

      <label className="block">
        <Label>Work state</Label>
        <select
          className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-[15px] font-medium outline-none focus:border-saffron"
          value={value.state}
          onChange={(e) => set({ state: e.target.value as StateCode })}
        >
          {(Object.keys(STATE_NAMES) as StateCode[]).map((s) => (
            <option key={s} value={s}>
              {STATE_NAMES[s]}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-2">
        <Toggle
          label="Employer PF inside CTC"
          hint="Almost always yes — check the annexure"
          checked={value.employerPfInCtc}
          onChange={(v) => set({ employerPfInCtc: v })}
        />
        <Toggle
          label="Gratuity inside CTC"
          hint="Money you only get after 5 years"
          checked={value.gratuityInCtc}
          onChange={(v) => set({ gratuityInCtc: v })}
        />
        <Toggle
          label="PF on full basic"
          hint="Off = capped at ₹1,800/month"
          checked={value.pfOnFullBasic}
          onChange={(v) => set({ pfOnFullBasic: v })}
        />
      </div>

      <Details summary="ESOPs, joining bonus, bond">
        <NumberField
          label="ESOPs per year in CTC"
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
              label="ESOP cliff"
              suffix="months"
              value={value.esop.cliffMonths}
              onChange={(v) => set({ esop: { ...value.esop!, cliffMonths: v } })}
            />
            <Toggle
              label="Listed company / liquid shares"
              checked={value.esop.liquid}
              onChange={(v) => set({ esop: { ...value.esop!, liquid: v } })}
            />
          </>
        )}
        <NumberField
          label="Joining bonus"
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
            label="Bonus clawback window"
            suffix="months"
            value={value.joiningBonus.clawbackMonths}
            onChange={(v) => set({ joiningBonus: { ...value.joiningBonus!, clawbackMonths: v } })}
          />
        )}
        <NumberField
          label="Service bond amount"
          suffix="₹ L"
          step={0.5}
          value={(value.bond?.amount ?? 0) / L}
          onChange={(v) => set({ bond: v > 0 ? { amount: v * L, months: value.bond?.months ?? 12 } : undefined })}
        />
        {value.bond && (
          <NumberField
            label="Bond duration"
            suffix="months"
            value={value.bond.months}
            onChange={(v) => set({ bond: { ...value.bond!, months: v } })}
          />
        )}
      </Details>

      <Details summary="Old-regime extras (rent, 80C, 80D)">
        <NumberField
          label="Rent paid"
          suffix="₹/month"
          step={1000}
          value={old.rentPaidMonthly}
          onChange={(v) => set({ old: { ...old, rentPaidMonthly: v } })}
        />
        <Toggle
          label="Metro city"
          hint="Delhi, Mumbai, Kolkata or Chennai"
          checked={old.metro}
          onChange={(v) => set({ old: { ...old, metro: v } })}
        />
        <NumberField
          label="80C beyond PF"
          hint="ELSS, PPF, LIC etc."
          suffix="₹/yr"
          step={5000}
          value={old.deduction80CExtra}
          onChange={(v) => set({ old: { ...old, deduction80CExtra: v } })}
        />
        <NumberField
          label="80D health premium"
          suffix="₹/yr"
          step={1000}
          value={old.deduction80D}
          onChange={(v) => set({ old: { ...old, deduction80D: v } })}
        />
      </Details>

      <label className="block">
        <Label>HRA (% of basic)</Label>
        <input
          type="range"
          min={0}
          max={60}
          value={value.hraPercentOfBasic}
          onChange={(e) => set({ hraPercentOfBasic: Number(e.target.value) })}
          className="mt-2 w-full accent-saffron"
        />
        <span className="tnum text-xs font-medium text-ink-faint">{value.hraPercentOfBasic}% of basic</span>
      </label>
    </Card>
  )
}
