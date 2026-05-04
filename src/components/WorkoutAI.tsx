
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPersonalizedWorkoutSuggestions, PersonalizedWorkoutSuggestionsOutput } from "@/ai/flows/personalized-workout-suggestions"
import { Loader2, Sparkles, CheckCircle } from "lucide-react"

export function WorkoutAI() {
  const [goals, setGoals] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PersonalizedWorkoutSuggestionsOutput | null>(null)

  const handleGenerate = async () => {
    if (!goals) return
    setLoading(true)
    try {
      const suggestions = await getPersonalizedWorkoutSuggestions({ fitnessGoals: goals })
      setResult(suggestions)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3 h-3" />
            Impulso AI Assistant
          </div>
          <h2 className="text-4xl font-extrabold text-foreground mb-4">Planifica tu éxito</h2>
          <p className="text-muted-foreground text-lg">Cuéntanos tus objetivos y nuestra IA diseñará tu rutina ideal.</p>
        </div>

        <div className="flex flex-col gap-4 mb-12">
          <div className="flex gap-2">
            <Input 
              placeholder="Ej: Perder peso y ganar fuerza en piernas..." 
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="rounded-[6px] h-14 bg-white border-border focus:ring-primary text-lg"
            />
            <Button 
              onClick={handleGenerate} 
              disabled={loading || !goals}
              className="h-14 bg-primary text-white font-bold px-8 rounded-[8px]"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Generar Plan"}
            </Button>
          </div>
        </div>

        {result && (
          <Card className="rounded-[12px] border-border shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader className="bg-secondary/50 border-b border-border/50 rounded-t-[12px]">
                <CardTitle className="text-2xl font-extrabold text-foreground">{result.workoutPlanName}</CardTitle>
              <p className="text-muted-foreground mt-2">{result.description}</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                <div>
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Objetivos Alcanzables
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.goalsAchieved.map((goal, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-primary/5 text-primary text-sm font-semibold border border-primary/20">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {result.workoutSuggestions.map((workout, i) => (
                    <div key={i} className="border border-border/50 rounded-[8px] overflow-hidden">
                      <div className="bg-secondary p-4 font-bold text-foreground border-b border-border/50">
                        {workout.day}
                      </div>
                      <div className="divide-y divide-border/30">
                        {workout.exercises.map((ex, j) => (
                          <div key={j} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                             <div className="font-bold text-foreground">{ex.name}</div>
                              <div className="text-sm text-muted-foreground">{ex.notes}</div>
                            </div>
                             <div className="text-sm font-bold bg-secondary/80 px-3 py-1 rounded-md text-foreground self-start sm:self-center">
                              {ex.sets} sets x {ex.reps}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-primary/5 rounded-[8px] border border-primary/10">
                  <h4 className="font-bold text-primary mb-3">Consejos de experto:</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    {result.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
