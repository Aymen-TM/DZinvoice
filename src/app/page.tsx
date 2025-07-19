"use client";
import Link from "next/link";
import {
  DocumentTextIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  WifiIcon,
  MegaphoneIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  ArrowRightIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const features = [
  {
    icon: <DocumentTextIcon className="w-8 h-8 text-blue-600" />,
    title: "Factures PDF instantanées",
    desc: "Générez et téléchargez vos factures professionnelles en un clic, sans inscription."
  },
  {
    icon: <ShieldCheckIcon className="w-8 h-8 text-green-600" />,
    title: "Données 100% privées",
    desc: "Vos données restent sur votre appareil. Aucune collecte, aucune inscription."
  },
  {
    icon: <DevicePhoneMobileIcon className="w-8 h-8 text-purple-600" />,
    title: "Mobile & Desktop",
    desc: "Utilisable sur smartphone, tablette et ordinateur, partout, tout le temps."
  },
  {
    icon: <MegaphoneIcon className="w-8 h-8 text-pink-500" />,
    title: "Gratuit grâce à la publicité",
    desc: "Un bandeau discret finance l’outil, sans frais pour vous."
  },
  {
    icon: <WifiIcon className="w-8 h-8 text-yellow-500" />,
    title: "Données stockées localement",
    desc: "Vos factures restent accessibles sur cet appareil, même après fermeture du navigateur."
  },
];

const steps = [
  {
    icon: <DocumentTextIcon className="w-7 h-7 text-blue-600" />,
    title: "1. Remplissez vos infos",
    desc: "Ajoutez vos coordonnées et celles de votre client."
  },
  {
    icon: <CheckCircleIcon className="w-7 h-7 text-green-600" />,
    title: "2. Générez la facture",
    desc: "Ajoutez les articles, vérifiez le total, et validez."
  },
  {
    icon: <ArrowRightIcon className="w-7 h-7 text-indigo-600" />,
    title: "3. Téléchargez le PDF",
    desc: "Recevez instantanément votre facture prête à envoyer."
  },
];

const faqs = [
  {
    q: "Mes données sont-elles partagées ?",
    a: "Non, toutes vos données restent sur votre appareil. Nous ne collectons aucune information personnelle."
  },
  {
    q: "Pourquoi y a-t-il une publicité ?",
    a: "La publicité permet de financer l’outil et de le garder 100% gratuit pour tous."
  },
  {
    q: "Est-ce vraiment sans inscription ?",
    a: "Oui, aucune création de compte n’est nécessaire. Utilisez l’outil librement !"
  },
];

const testimonials = [
  {
    name: "Nadia B.",
    text: "Super pratique pour mon activité indépendante. FactureLibre m’a fait gagner un temps fou !",
    icon: <UserCircleIcon className="w-8 h-8 text-blue-400" />,
  },
  {
    name: "Yassine K.",
    text: "Simple, rapide, et gratuit. J’adore le fait que mes données restent privées.",
    icon: <UserCircleIcon className="w-8 h-8 text-green-400" />,
  },
];

const storySections = [
  {
    title: "Notre Mission",
    text: "FactureLibre est né d’un constat : la facturation doit être simple, rapide et accessible à tous, sans barrière technique ni coût caché. Nous croyons que chaque entrepreneur, freelance ou petite entreprise du Maghreb et d’Afrique francophone mérite un outil de facturation moderne, sécurisé et… vraiment gratuit.",
    color: "from-blue-100 to-blue-50"
  },
  {
    title: "Pourquoi Gratuit ?",
    text: "Notre modèle est transparent : une publicité discrète finance le service, pour que vous puissiez facturer sans limite ni abonnement. Pas de piège, pas de frais cachés.",
    color: "from-pink-100 to-pink-50"
  },
  {
    title: "Sécurité & Confiance",
    text: "Vos données ne quittent jamais votre appareil. FactureLibre stocke vos factures localement pour une confidentialité totale. L’accès à l’application nécessite une connexion Internet.",
    color: "from-green-100 to-green-50"
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      {/* Hero Section */}
      <motion.header
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full px-4 pt-12 pb-16 flex flex-col items-center text-center bg-gradient-to-b from-blue-100 to-transparent relative overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="absolute inset-0 pointer-events-none select-none"
        >
          <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              fill="#6366f1"
              fillOpacity="0.2"
              d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
            />
          </svg>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl sm:text-5xl font-extrabold text-blue-900 mb-4 drop-shadow-lg"
        >
          Facturez gratuitement, simplement.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-lg sm:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto"
        >
          Votre outil de facturation en ligne sans inscription, pensé pour les entrepreneurs du Maghreb et d’Afrique francophone.
        </motion.p>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Link href="/erp" className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition text-lg">Accéder à l’application</Link>
        </motion.div>
        {/* App Screenshot Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-10 w-full max-w-2xl mx-auto flex justify-center"
        >
          <div className="rounded-2xl shadow-2xl border-4 border-blue-200 bg-white overflow-hidden w-full h-64 flex items-center justify-center animate-pulse">
            <span className="text-gray-400 text-xl">[Aperçu de l’application ici]</span>
          </div>
        </motion.div>
      </motion.header>

      {/* Storytelling Section */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {storySections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: i * 0.2 }}
              className={`rounded-2xl shadow-lg p-6 bg-gradient-to-br ${section.color}`}
            >
              <h3 className="text-xl font-bold text-blue-900 mb-2">{section.title}</h3>
              <p className="text-gray-700 text-base">{section.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="text-2xl sm:text-3xl font-bold text-center text-blue-800 mb-10"
        >
          Fonctionnalités clés
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl transition"
            >
              {f.icon}
              <h3 className="font-semibold text-lg mt-3 mb-1 text-blue-900">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="text-2xl sm:text-3xl font-bold text-center text-blue-800 mb-10"
        >
          Comment ça marche ?
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="bg-blue-50 rounded-full p-4 mb-3">{s.icon}</div>
              <h4 className="font-semibold text-base text-blue-900 mb-1">{s.title}</h4>
              <p className="text-gray-600 text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="text-2xl sm:text-3xl font-bold text-center text-blue-800 mb-6"
        >
          Pourquoi choisir FactureLibre ?
        </motion.h2>
        <ul className="space-y-3 text-gray-700 text-base mx-auto max-w-lg">
          <motion.li initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="flex items-center"><CheckCircleIcon className="w-6 h-6 mr-2 text-green-600" /> 100% gratuit, aucune carte requise</motion.li>
          <motion.li initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="flex items-center"><CheckCircleIcon className="w-6 h-6 mr-2 text-green-600" /> Zéro inscription, zéro spam</motion.li>
          <motion.li initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="flex items-center"><CheckCircleIcon className="w-6 h-6 mr-2 text-green-600" /> Adapté aux besoins locaux (TND, DZD, XOF...)</motion.li>
          <motion.li initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="flex items-center"><CheckCircleIcon className="w-6 h-6 mr-2 text-green-600" /> Interface moderne et intuitive</motion.li>
        </ul>
      </section>

      {/* Testimonials */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="text-2xl sm:text-3xl font-bold text-center text-blue-800 mb-8"
        >
          Ils utilisent FactureLibre
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center"
            >
              {t.icon}
              <p className="text-gray-700 italic mt-3 mb-2">“{t.text}”</p>
              <span className="font-semibold text-blue-700">{t.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="text-2xl sm:text-3xl font-bold text-center text-blue-800 mb-8"
        >
          FAQ
        </motion.h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.details
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-lg shadow p-4 group"
              open={i === 0}
            >
              <summary className="flex items-center cursor-pointer text-blue-700 font-semibold text-base group-open:text-blue-900">
                <QuestionMarkCircleIcon className="w-5 h-5 mr-2 text-blue-500" />
                {faq.q}
              </summary>
              <p className="text-gray-600 mt-2 ml-7">{faq.a}</p>
            </motion.details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full flex flex-col items-center py-12 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="text-2xl sm:text-3xl font-bold text-white mb-4"
        >
          Prêt à facturer gratuitement ?
        </motion.h2>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link href="/erp" className="inline-block px-8 py-3 bg-white text-blue-700 font-semibold rounded-xl shadow-lg hover:bg-blue-50 transition text-lg animate-bounce">Commencer maintenant</Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
          <div className="flex space-x-4 mb-2 sm:mb-0">
            <Link href="/politique-confidentialite" className="hover:underline">Politique de confidentialité</Link>
            <Link href="/a-propos" className="hover:underline">À propos</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
          <div className="flex items-center space-x-1">
            <span>© 2025 FactureLibre. Propulsé avec</span>
            <StarIcon className="w-4 h-4 text-yellow-400 mx-1" />
          </div>
        </div>
      </footer>
    </div>
  );
} 