export default function Home() {
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-custom border border-[#e5e5e3] bg-card-bg p-6 shadow-sm">
          <div className="relative z-10">
            <p className="mb-1 text-sm font-medium text-dark/60">
              Nombre de sessions
            </p>
            <h3 className="text-3xl font-bold text-dark">12,482</h3>
            <div className="mt-4 flex items-center text-xs font-medium text-green-600">
              <span className="material-symbols-outlined mr-1 text-sm">
                trending_up
              </span>
              +14.5% <span className="ml-1 text-dark/40">vs mois dernier</span>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-custom border border-[#e5e5e3] bg-card-bg p-6 shadow-sm">
          <div className="relative z-10">
            <p className="mb-1 text-sm font-medium text-dark/60">
              Nombre de visiteurs
            </p>
            <h3 className="text-3xl font-bold text-dark">8,390</h3>
            <div className="mt-4 flex items-center text-xs font-medium text-green-600">
              <span className="material-symbols-outlined mr-1 text-sm">
                trending_up
              </span>
              +8.2% <span className="ml-1 text-dark/40">vs mois dernier</span>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-custom border border-[#e5e5e3] bg-card-bg p-6 shadow-sm">
          <div className="relative z-10">
            <p className="mb-1 text-sm font-medium text-dark/60">
              Nombre de clients
            </p>
            <h3 className="text-3xl font-bold text-dark">1,240</h3>
            <div className="mt-4 flex items-center text-xs font-medium text-green-600">
              <span className="material-symbols-outlined mr-1 text-sm">
                trending_up
              </span>
              +4.1% <span className="ml-1 text-dark/40">vs mois dernier</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-custom border border-[#e5e5e3] bg-card-bg shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#e5e5e3] px-6 py-4">
            <h4 className="font-semibold text-dark">Activités récentes</h4>
            <a className="text-xs font-medium text-primary hover:underline" href="#">
              Voir tout
            </a>
          </div>

          <div className="divide-y divide-[#e5e5e3]">
            <div className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-light/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <span className="material-symbols-outlined text-xl">
                  person_add
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-dark">
                  Nouveau client enregistré
                </p>
                <p className="text-xs text-dark/50">
                  L&apos;entreprise &apos;TechVision&apos; vient de rejoindre la
                  plateforme.
                </p>
              </div>
              <span className="text-[10px] uppercase text-dark/40">Il y a 2h</span>
            </div>

            <div className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-light/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                <span className="material-symbols-outlined text-xl">
                  analytics
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-dark">
                  Rapport d&apos;analyse généré
                </p>
                <p className="text-xs text-dark/50">
                  Le rapport mensuel des ventes est prêt à être exporté.
                </p>
              </div>
              <span className="text-[10px] uppercase text-dark/40">Il y a 5h</span>
            </div>

            <div className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-light/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <span className="material-symbols-outlined text-xl">warning</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-dark">
                  Alerte de sécurité
                </p>
                <p className="text-xs text-dark/50">
                  Tentative de connexion inhabituelle détectée à Paris.
                </p>
              </div>
              <span className="text-[10px] uppercase text-dark/40">Hier</span>
            </div>

            <div className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-light/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                <span className="material-symbols-outlined text-xl">groups</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-dark">Nouvel équipier</p>
                <p className="text-xs text-dark/50">
                  Sarah Martin a été ajoutée à l&apos;équipe Marketing.
                </p>
              </div>
              <span className="text-[10px] uppercase text-dark/40">2 jours</span>
            </div>
          </div>
        </div>

        <div className="rounded-custom border border-[#e5e5e3] bg-card-bg p-6 shadow-sm">
          <h4 className="mb-6 font-semibold text-dark">Raccourcis</h4>

          <div className="space-y-3">
            <button
              type="button"
              className="group flex w-full items-center gap-3 rounded-custom border border-transparent bg-light p-3 text-dark transition-all hover:border-primary/20 hover:bg-primary/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-custom bg-white text-primary shadow-sm transition-colors group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined text-lg">
                  person_add
                </span>
              </div>
              <span className="text-sm font-medium">Ajouter un client</span>
            </button>

            <button
              type="button"
              className="group flex w-full items-center gap-3 rounded-custom border border-transparent bg-light p-3 text-dark transition-all hover:border-primary/20 hover:bg-primary/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-custom bg-white text-primary shadow-sm transition-colors group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined text-lg">
                  description
                </span>
              </div>
              <span className="text-sm font-medium">Éditer une facture</span>
            </button>

            <button
              type="button"
              className="group flex w-full items-center gap-3 rounded-custom border border-transparent bg-light p-3 text-dark transition-all hover:border-primary/20 hover:bg-primary/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-custom bg-white text-primary shadow-sm transition-colors group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined text-lg">
                  monitoring
                </span>
              </div>
              <span className="text-sm font-medium">Lancer une analyse</span>
            </button>

            <button
              type="button"
              className="group flex w-full items-center gap-3 rounded-custom border border-transparent bg-light p-3 text-dark transition-all hover:border-primary/20 hover:bg-primary/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-custom bg-white text-primary shadow-sm transition-colors group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined text-lg">
                  settings
                </span>
              </div>
              <span className="text-sm font-medium">Paramètres système</span>
            </button>
          </div>

          <div className="mt-8 border-t border-[#e5e5e3] pt-6">
            <div className="rounded-custom border border-primary/10 bg-primary/5 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                Besoin d&apos;aide ?
              </p>
              <p className="mb-4 text-xs leading-relaxed text-dark/60">
                Consultez notre base de connaissances pour maîtriser Lylo.
              </p>
              <button
                type="button"
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                Accéder au support{" "}
                <span className="material-symbols-outlined text-xs">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
