"use client";

interface Client {
  id: string;
  raisonSocial: string;
  activite: string;
  address: string;
  phone: string;
  email: string;
  city: string;
  rc: string;
  nif: string;
  ai: string;
  nis: string;
}

export default function ClientsPage() {
  return <div className="p-8 text-gray-400 text-center">Page clients (à implémenter)</div>;
} 