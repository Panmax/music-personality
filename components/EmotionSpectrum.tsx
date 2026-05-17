"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import type { Emotion } from "@/lib/schema";

interface EmotionSpectrumProps {
  emotions: Emotion[];
}

export default function EmotionSpectrum({ emotions }: EmotionSpectrumProps) {
  const data = emotions.map((e) => ({
    name: e.name,
    value: e.percentage,
    color: e.color,
  }));

  return (
    <section className="animate-fade-in-up delay-300">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-8 h-[1px]"
          style={{ background: "var(--accent-gold-dim)" }}
        />
        <span
          className="text-xs tracking-[0.2em] uppercase"
          style={{ color: "var(--accent-gold-dim)" }}
        >
          情感光谱
        </span>
      </div>

      <div className="card-glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Donut chart */}
          <div className="w-48 h-48 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 grid gap-2.5 w-full">
            {emotions.map((emotion, i) => (
              <div
                key={emotion.name}
                className="flex items-center gap-3 animate-fade-in"
                style={{ animationDelay: `${0.4 + i * 0.06}s` }}
              >
                {/* Color dot */}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    background: emotion.color,
                    boxShadow: `0 0 8px ${emotion.color}40`,
                  }}
                />
                {/* Name */}
                <span
                  className="text-sm flex-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {emotion.name}
                </span>
                {/* Percentage bar + number */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${Math.max(emotion.percentage * 0.8, 8)}px`,
                      background: emotion.color,
                      opacity: 0.6,
                    }}
                  />
                  <span
                    className="text-xs font-mono tabular-nums w-8 text-right"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {emotion.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
