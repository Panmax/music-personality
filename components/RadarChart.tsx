"use client";

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import type { DnaDimension } from "@/lib/schema";

interface RadarChartProps {
  dimensions: DnaDimension[];
}

export default function RadarChart({ dimensions }: RadarChartProps) {
  const data = dimensions.map((d) => ({
    subject: d.name,
    score: d.score,
    fullMark: 100,
  }));

  return (
    <section className="animate-fade-in-up delay-200">
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
          音乐 DNA
        </span>
      </div>

      {/* Chart */}
      <div className="card-glass rounded-2xl p-6 mb-6 flex justify-center">
        <RechartsRadarChart data={data} width={340} height={300} cx="50%" cy="50%" outerRadius="72%">
          <PolarGrid
            stroke="var(--border-subtle)"
            strokeWidth={0.5}
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fill: "var(--text-secondary)",
              fontSize: 13,
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="DNA"
            dataKey="score"
            stroke="var(--accent-gold)"
            fill="var(--accent-gold)"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RechartsRadarChart>
      </div>

      {/* Dimension descriptions */}
      <div className="grid gap-3">
        {dimensions.map((dim, i) => (
          <div
            key={dim.name}
            className="flex items-start gap-4 px-4 py-3 rounded-lg transition-colors duration-200 animate-fade-in-up"
            style={{
              background: "rgba(18, 19, 31, 0.5)",
              animationDelay: `${0.3 + i * 0.08}s`,
            }}
          >
            {/* Score badge */}
            <div
              className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{
                background: "linear-gradient(135deg, rgba(212, 165, 116, 0.12) 0%, rgba(212, 165, 116, 0.04) 100%)",
                color: "var(--accent-gold)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {dim.score}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold mb-0.5"
                style={{ color: "var(--text-primary)" }}
              >
                {dim.name}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                {dim.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
