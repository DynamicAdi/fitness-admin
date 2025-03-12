"use client"

import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const data = [
    { name: "Mon", value: 120 },
    { name: "Tue", value: 180 },
    { name: "Wed", value: 140 },
    { name: "Thu", value: 80 },
    { name: "Fri", value: 70 },
    { name: "Sat", value: 110 },
    { name: "Sun", value: 130 },
]

export function ActivityChart() {
    return (
        <div className="rounded-lg bg-[#7E22CE] p-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">User Activity</h3>
                <select className="rounded-md bg-[#6B21A8] px-3 py-1 text-sm text-white">
                    <option>Last 7 days</option>
                </select>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis dataKey="name" stroke="#fff" />
                        <YAxis stroke="#fff" />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#fff" strokeWidth={2} dot={{ fill: "#fff" }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}