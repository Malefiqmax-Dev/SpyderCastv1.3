import { Footer } from "@/components/layout/footer"
import { ShieldAlert } from "lucide-react"
import { DmcaForm } from "@/components/dmca/dmca-form"
import styles from "./page.module.css"

export const metadata = {
  title: "DMCA - SpyderCast",
  description: "Politique de protection des droits d'auteur de SpyderCast.",
}

export default function DMCAPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.iconWrap}>
            <ShieldAlert className={styles.icon} />
          </div>
          <h1 className={styles.title}>DMCA</h1>
        </div>

        <div className={styles.content}>
          <section>
            <h2 className={styles.sectionTitle}>Protection des droits d{"'"}auteur</h2>
            <p className={styles.paragraph}>
              SpyderCast respecte les droits de propriete intellectuelle de tous les titulaires de
              droits. Si vous pensez que votre oeuvre protegee par le droit d{"'"}auteur a ete
              copiee d{"'"}une maniere qui constitue une violation du droit d{"'"}auteur, veuillez
              nous en informer conformement a la procedure ci-dessous.
            </p>
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Notre politique</h2>
            <p className={styles.paragraph}>
              SpyderCast est un agregateur de contenu et ne stocke aucun fichier media sur ses
              serveurs. Tous les flux video sont fournis par des sources tierces. Si vous etes
              titulaire de droits et souhaitez signaler une violation, nous traiterons votre demande
              dans les meilleurs delais.
            </p>
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Signaler une violation</h2>
            <p className={styles.paragraphWithMargin}>
              Pour signaler une violation presume du droit d{"'"}auteur, veuillez nous envoyer un
              avis contenant les informations suivantes :
            </p>
            <ul className={styles.list}>
              <li>Votre nom, adresse et coordonnees</li>
              <li>Description de l{"'"}oeuvre protegee par le droit d{"'"}auteur</li>
              <li>URL ou localisation du contenu litigieux</li>
              <li>Declaration de bonne foi que l{"'"}utilisation n{"'"}est pas autorisee</li>
              <li>Declaration sous peine de parjure que les informations sont exactes</li>
              <li>Votre signature electronique ou physique</li>
            </ul>
          </section>

          <DmcaForm />

          <section className={styles.warningBox}>
            <p className={styles.warningText}>
              <strong className={styles.warningStrong}>Avertissement :</strong> Toute fausse declaration
              dans une notification DMCA peut engager votre responsabilite civile et penale. Assurez-
              vous que les informations fournies sont exactes et que vous etes bien le titulaire des
              droits concernes ou agissez pour le compte du titulaire.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
