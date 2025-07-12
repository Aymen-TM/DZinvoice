# DZ Invoice - Générateur de Factures

Une application web complète pour créer des factures professionnelles en utilisant Next.js, React, TypeScript, Tailwind CSS et pdf-lib.

## 🚀 Fonctionnalités

### 1. Informations de l'entreprise
- Nom de l'entreprise
- Activité
- Adresse
- Capital
- Téléphone
- Email
- Site web
- Banque
- RC, NIF, AI, NIS

### 2. Informations du client
- Nom du client
- Code client
- Activité
- Adresse
- Ville
- RC, NIF, AI, NIS

### 3. Métadonnées de la facture
- Numéro de facture
- Date
- Conditions de paiement (dropdown)
- Notes

### 4. Liste des articles
- Ajout/suppression dynamique d'articles
- Champs : référence, désignation, quantité, prix unitaire, montant, TVA
- Calcul automatique des totaux
- Montant en lettres (français)

### 5. Génération PDF
- Génération de PDF professionnel avec pdf-lib
- Mise en page A4 avec police Helvetica
- Téléchargement automatique
- Validation des champs obligatoires

## 🛠️ Technologies utilisées

- **Next.js 15.3.5** - Framework React avec App Router
- **React 19.0.0** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS 4** - Framework CSS utilitaire
- **pdf-lib 1.17.1** - Génération de PDF
- **uuid 9.0.1** - Génération d'identifiants uniques

## 📦 Installation

1. Clonez le repository :
```bash
git clone <repository-url>
cd dzinvoice
```

2. Installez les dépendances :
```bash
npm install
```

3. Lancez le serveur de développement :
```bash
npm run dev
```

4. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🏗️ Structure du projet

```
src/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Page principale
│   └── globals.css         # Styles globaux
├── components/
│   ├── CompanyInfo.tsx     # Informations entreprise
│   ├── ClientInfo.tsx      # Informations client
│   ├── InvoiceMeta.tsx     # Métadonnées facture
│   ├── ItemsList.tsx       # Liste des articles
│   └── GeneratePDFButton.tsx # Bouton génération PDF
├── types/
│   └── invoice.ts          # Types TypeScript
└── utils/
    ├── pdfGenerator.ts     # Génération PDF
    └── numberToWords.ts    # Conversion nombres en mots
```

## 🎯 Utilisation

1. **Remplissez les informations de l'entreprise** (nom obligatoire)
2. **Ajoutez les informations du client** (nom obligatoire)
3. **Saisissez les détails de la facture** (numéro et date obligatoires)
4. **Ajoutez des articles** en cliquant sur "Ajouter un article"
5. **Ajustez la remise** si nécessaire
6. **Générez le PDF** en cliquant sur "Générer le PDF"

## 📄 Format PDF généré

Le PDF généré inclut :
- En-tête avec titre "FACTURE"
- Section informations entreprise
- Section informations client
- Détails de la facture (numéro, date, conditions)
- Tableau des articles avec colonnes : Référence, Désignation, Quantité, Prix unitaire, Montant, TVA
- Récapitulatif des montants (HT, Remise, TVA, Timbre, TTC)
- Montant en lettres
- Notes (si renseignées)

## 🔧 Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm run start` - Lance le serveur de production
- `npm run lint` - Vérifie le code avec ESLint

## 📝 Validation

L'application valide les champs obligatoires avant la génération du PDF :
- Nom de l'entreprise
- Nom du client
- Numéro de facture
- Date de facture
- Au moins un article

## 🎨 Interface utilisateur

- Design responsive avec Tailwind CSS
- Formulaires organisés en sections
- Validation en temps réel
- Feedback visuel pour les actions
- Interface moderne et intuitive

## 🔒 Sécurité

- Validation côté client
- Gestion d'erreurs robuste
- Pas de stockage de données sensibles
- Génération PDF côté client

## 📱 Compatibilité

- Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- Responsive design (mobile, tablette, desktop)
- Support TypeScript complet

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

---

**Développé avec ❤️ en utilisant Next.js, React, TypeScript et Tailwind CSS**
