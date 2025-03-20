interface PromptSuggestionsProps {
  label: string
  append: (message: { role: "user"; content: string }) => void
  suggestions: string[]
}

export function PromptSuggestions({
  label,
  append,
  suggestions,
}: PromptSuggestionsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-center text-xl font-semibold">{label}</h2>
      <div className="grid grid-cols-1 gap-3">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => append({ role: "user", content: suggestion })}
            className="w-full text-left rounded-xl border bg-background p-4 hover:bg-muted hover:border-blue-300 transition-colors"
          >
            <p className="text-sm">{suggestion}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
