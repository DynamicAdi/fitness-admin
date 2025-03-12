"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

const data = [
    { name: "Strength", value: 35 },
    { name: "Cardio", value: 25 },
    { name: "Yoga", value: 20 },
    { name: "HIIT", value: 15 },
    { name: "Other", value: 5 },
]

const COLORS = ["#60A5FA", "#4ADE80", "#FBBF24", "#F87171", "#A78BFA"]

export function DistributionChart() {
    return (
        <div className="rounded-lg bg-[#7E22CE] p-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Session Distribution</h3>
                <select className="rounded-md bg-[#6B21A8] px-3 py-1 text-sm text-white">
                    <option>By Category</option>
                </select>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}