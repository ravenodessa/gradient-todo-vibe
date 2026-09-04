import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Repeat, WifiOff, Archive as ArchiveIcon, Star, Bell, Smartphone } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useLanguage } from '@/hooks/useLanguage';

export default function Features() {
  const { t } = useLanguage();

  const features = useMemo(
    () => [
      {
        icon: Repeat,
        titleKey: 'features_recurring_title',
        textKey: 'features_recurring_text',
      },
      {
        icon: Star,
        titleKey: 'features_favorites_title',
        textKey: 'features_favorites_text',
      },
      {
        icon: WifiOff,
        titleKey: 'features_offline_title',
        textKey: 'features_offline_text',
      },
      {
        icon: ArchiveIcon,
        titleKey: 'features_archive_title',
        textKey: 'features_archive_text',
      },
      {
        icon: Bell,
        titleKey: 'features_sections_title',
        textKey: 'features_sections_text',
      },
      {
        icon: Smartphone,
        titleKey: 'features_pwa_title',
        textKey: 'features_pwa_text',
      },
    ],
    []
  );

  const howToSteps = useMemo(
    () => [
      t('features_how_step1'),
      t('features_how_step2'),
      t('features_how_step3'),
      t('features_how_step4'),
    ],
    [t]
  );

  const structuredData = useMemo(
    () =>
      JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Todo List',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          description: t('features_app_description'),
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: t('features_faq_q1'),
              acceptedAnswer: {
                '@type': 'Answer',
                text: t('features_faq_a1'),
              },
            },
            {
              '@type': 'Question',
              name: t('features_faq_q2'),
              acceptedAnswer: {
                '@type': 'Answer',
                text: t('features_faq_a2'),
              },
            },
            {
              '@type': 'Question',
              name: t('features_faq_q3'),
              acceptedAnswer: {
                '@type': 'Answer',
                text: t('features_faq_a3'),
              },
            },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: t('features_how_title'),
          description: t('features_main_description'),
          step: howToSteps.map((text) => ({
            '@type': 'HowToStep',
            name: text,
            text,
          })),
        },
      ]),
    [t, howToSteps]
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
      <SEO
        title={t('features_meta_title')}
        description={t('features_meta_description')}
        path="/features"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />

      <div className="max-w-3xl mx-auto">
        <header className="glass-effect rounded-2xl p-6 sm:p-10 shadow-2xl border border-white/20 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('features_main_title')}
          </h1>
          <p className="mt-4 text-muted-foreground">{t('features_main_description')}</p>
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-primary to-secondary">
                {t('features_start_free')}
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline">{t('features_open_tasks')}</Button>
            </Link>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, titleKey, textKey }) => (
            <article
              key={titleKey}
              className="glass-effect rounded-2xl p-6 shadow-xl border border-white/20"
            >
              <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-semibold">{t(titleKey)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t(textKey)}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 glass-effect rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20">
          <h2 className="text-xl font-semibold">{t('features_how_title')}</h2>
          <ol className="mt-4 space-y-3 text-sm text-muted-foreground list-decimal pl-5">
            {howToSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="mt-6 glass-effect rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20">
          <h2 className="text-xl font-semibold">{t('features_faq_title')}</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-medium">{t('features_faq_q1')}</dt>
              <dd className="text-muted-foreground mt-1">{t('features_faq_a1')}</dd>
            </div>
            <div>
              <dt className="font-medium">{t('features_faq_q2')}</dt>
              <dd className="text-muted-foreground mt-1">{t('features_faq_a2')}</dd>
            </div>
            <div>
              <dt className="font-medium">{t('features_faq_q3')}</dt>
              <dd className="text-muted-foreground mt-1">{t('features_faq_a3')}</dd>
            </div>
          </dl>
        </section>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t('features_cta_text')}{' '}
          <Link to="/auth" className="text-primary underline">
            {t('features_cta_link')}
          </Link>{' '}
          {t('features_cta_suffix')}
        </p>
      </div>
    </main>
  );
}
