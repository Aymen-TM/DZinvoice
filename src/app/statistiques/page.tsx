"use client";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { FiUsers, FiShoppingCart, FiFileText } from "react-icons/fi";
import { useEffect } from "react";

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

const stats = [
  { label: "Total ventes", value: "12 500 DA", icon: <FiShoppingCart />, color: "bg-blue-100 text-blue-700" },
  { label: "Total achats", value: "7 800 DA", icon: <FiShoppingCart />, color: "bg-green-100 text-green-700" },
  { label: "Nombre de factures", value: 34, icon: <FiFileText />, color: "bg-yellow-100 text-yellow-700" },
  { label: "Top client", value: "Client A", icon: <FiUsers />, color: "bg-purple-100 text-purple-700" },
  { label: "Top article", value: "Stylo", icon: <FiFileText />, color: "bg-pink-100 text-pink-700" },
];

const barData = {
  labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"],
  datasets: [{
    label: "Ventes par mois",
    data: [1200, 1500, 1100, 1800, 2000, 2900],
    backgroundColor: "#2563eb",
    borderRadius: 6,
  }],
};
const pieData = {
  labels: ["Stylo", "Cahier", "Classeur", "Autres"],
  datasets: [{
    data: [40, 25, 20, 15],
    backgroundColor: ["#2563eb", "#60a5fa", "#a5b4fc", "#dbeafe"],
  }],
};
const lineData = {
  labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"],
  datasets: [{
    label: "Évolution mensuelle",
    data: [1000, 1200, 1100, 1600, 2100, 2500],
    borderColor: "#2563eb",
    backgroundColor: "#2563eb22",
    tension: 0.4,
    fill: true,
    pointRadius: 4,
  }],
};

export default function StatistiquesPage() {
  useEffect(() => {}, []);
  return (
    <main className="min-h-screen bg-blue-50 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-6">Statistiques</h1>
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className={`flex flex-col items-center justify-center rounded-lg shadow ${s.color} p-4 min-h-[90px]`}>
              <span className="text-2xl mb-1">{s.icon}</span>
              <span className="font-bold text-lg">{s.value}</span>
              <span className="text-xs text-gray-500 mt-1 text-center">{s.label}</span>
            </div>
          ))}
        </div>
        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-blue-700 font-semibold mb-2 text-sm">Ventes par mois</h2>
            <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} height={220} />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-blue-700 font-semibold mb-2 text-sm">Top articles</h2>
            <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} height={220} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 mt-8">
          <h2 className="text-blue-700 font-semibold mb-2 text-sm">Évolution mensuelle</h2>
          <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} height={220} />
        </div>
      </div>
    </main>
  );
} 