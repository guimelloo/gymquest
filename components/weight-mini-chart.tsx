"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WeightMiniChartProps {
  data: Array<{ weight: number; date: string }>;
}

export function WeightMiniChart({ data }: WeightMiniChartProps) {
  const chartData = data.map((d) => ({
    date: format(new Date(d.date), "dd/MM", { locale: ptBR }),
    peso: d.weight,
  }));

  const min = Math.min(...data.map((d) => d.weight)) - 1;
  const max = Math.max(...data.map((d) => d.weight)) + 1;

  const trend = data.length >= 2
    ? data[data.length - 1].weight - data[0].weight
    : 0;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>⚖️ Evolução do Peso</span>
          {trend !== 0 && (
            <span className={`text-sm font-normal ${trend < 0 ? "text-green-400" : "text-red-400"}`}>
              {trend > 0 ? "+" : ""}{trend.toFixed(1)} kg
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[min, max]}
              tick={{ fontSize: 10, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              formatter={(v) => [`${Number(v ?? 0).toFixed(1)} kg`, "Peso"]}
            />
            <Line
              type="monotone"
              dataKey="peso"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
