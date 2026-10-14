// Campo lateral de rangos (FR-016): "1, 3, 5-8". Presentacional — el
// parseo y la sincronización con la selección visual viven en la vista
// (T030) usando `range-parser.ts`.

interface RangeInputProps {
  expression: string
  pageCount: number
  errors: string[]
  onChange: (expression: string) => void
}

export default function RangeInput({ expression, pageCount, errors, onChange }: RangeInputProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-card">
      <label htmlFor="range-input" className="text-sm font-semibold text-gray-800">
        Páginas a eliminar
      </label>
      <input
        id="range-input"
        type="text"
        value={expression}
        onChange={(event) => onChange(event.target.value)}
        placeholder="1, 3, 5-8"
        inputMode="text"
        autoComplete="off"
        aria-invalid={errors.length > 0}
        aria-describedby="range-hint range-errors"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none"
      />
      <p id="range-hint" className="text-xs text-gray-500">
        Números y rangos separados por comas (documento de {pageCount}{' '}
        {pageCount === 1 ? 'página' : 'páginas'}). Se sincroniza con la selección visual.
      </p>
      {errors.length > 0 && (
        <ul id="range-errors" role="alert" className="flex flex-col gap-1 text-xs text-red-600">
          {errors.map((error) => (
            <li key={error}>• {error}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
