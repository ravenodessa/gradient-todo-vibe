import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Repeat, WifiOff, Archive as ArchiveIcon, Star, Bell, Smartphone } from 'lucide-react';
import { SEO } from '@/components/SEO';

const features = [
  {
    icon: Repeat,
    title: 'Повторяющиеся задачи',
    text: 'Настройте ежедневное, еженедельное или ежемесячное повторение — после выполнения задача автоматически создаётся заново на следующую дату. Идеально для привычек, отчётов и регулярных дел.',
  },
  {
    icon: Star,
    title: 'Избранные шаблоны',
    text: 'Часто повторяющиеся дела храните в «Избранном» и добавляйте их в список задач одним кликом. Нужные шаблоны можно закрепить наверху списка.',
  },
  {
    icon: WifiOff,
    title: 'Офлайн-режим',
    text: 'Список задач работает без интернета: изменения сохраняются локально и синхронизируются, когда связь возвращается.',
  },
  {
    icon: ArchiveIcon,
    title: 'Архив задач',
    text: 'Выполненные дела уходят в архив, а не исчезают. В любой момент можно восстановить задачу или очистить архив полностью.',
  },
  {
    icon: Bell,
    title: 'Умные разделы и быстрые переносы',
    text: 'Задачи автоматически группируются: Просрочено, Сегодня, Завтра, Позже. Кнопка «На завтра» переносит дело на следующий день одним нажатием.',
  },
  {
    icon: Smartphone,
    title: 'Установка как приложение (PWA)',
    text: 'Установите менеджер задач на телефон или компьютер — он открывается как обычное приложение, с быстрым запуском и офлайн-доступом.',
  },
];

export default function Features() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
      <SEO
        title="Возможности — онлайн менеджер задач с повторениями"
        description="Онлайн todo list с повторяющимися задачами, избранными шаблонами, архивом, офлайн-режимом и установкой как приложение. Узнайте, как работают все возможности."
        path="/features"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Todo List',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              description:
                'Онлайн менеджер задач с повторяющимися задачами, избранными шаблонами, архивом и офлайн-режимом.',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'Нужно ли платить за использование?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Нет, список задач доступен бесплатно после регистрации по email или через Google.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Работает ли приложение без интернета?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Да. Задачи сохраняются локально и синхронизируются с сервером при восстановлении соединения.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'На каких языках доступен интерфейс?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Русский и английский — язык переключается одной кнопкой в шапке.',
                  },
                },
              ],
            },
            {
              '@context': 'https://schema.org',
              '@type': 'HowTo',
              name: 'Как настроить повторяющуюся задачу',
              description:
                'Пошаговая настройка повторения задачи в онлайн менеджере задач Todo List.',
              step: [
                { '@type': 'HowToStep', name: 'Создайте задачу', text: 'Создайте задачу и укажите дату выполнения.' },
                {
                  '@type': 'HowToStep',
                  name: 'Выберите правило повторения',
                  text: 'Выберите правило повторения: ежедневно, еженедельно или ежемесячно — оно сохраняется вместе с задачей.',
                },
                {
                  '@type': 'HowToStep',
                  name: 'Отметьте выполнение',
                  text: 'Отметьте задачу выполненной: она уйдёт в архив, а её копия автоматически появится на следующую дату по правилу повторения.',
                },
                {
                  '@type': 'HowToStep',
                  name: 'При необходимости перенесите',
                  text: 'Кнопка «На завтра» переносит задачу на следующий день без редактирования.',
                },
              ],
            },
          ]),
        }}
      />

      <div className="max-w-3xl mx-auto">
        <header className="glass-effect rounded-2xl p-6 sm:p-10 shadow-2xl border border-white/20 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Онлайн менеджер задач с повторениями
          </h1>
          <p className="mt-4 text-muted-foreground">
            Todo List — простой список задач в браузере: разделы по срокам, повторяющиеся дела,
            избранные шаблоны, архив и работа без интернета. Бесплатно, без установки.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-primary to-secondary">Начать бесплатно</Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Открыть мои задачи</Button>
            </Link>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="glass-effect rounded-2xl p-6 shadow-xl border border-white/20"
            >
              <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 glass-effect rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20">
          <h2 className="text-xl font-semibold">Как работают повторяющиеся задачи</h2>
          <ol className="mt-4 space-y-3 text-sm text-muted-foreground list-decimal pl-5">
            <li>Создайте задачу и укажите дату выполнения.</li>
            <li>
              Выберите правило повторения: ежедневно, еженедельно или ежемесячно — оно сохраняется
              вместе с задачей.
            </li>
            <li>
              Отметьте задачу выполненной: она уйдёт в архив, а её копия автоматически появится на
              следующую дату по правилу повторения.
            </li>
            <li>
              Нужно сдвинуть дело? Кнопка «На завтра» переносит задачу на следующий день без
              редактирования.
            </li>
          </ol>
        </section>

        <section className="mt-6 glass-effect rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20">
          <h2 className="text-xl font-semibold">Частые вопросы</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-medium">Нужно ли платить за использование?</dt>
              <dd className="text-muted-foreground mt-1">
                Нет, список задач доступен бесплатно после регистрации по email или через Google.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Работает ли приложение без интернета?</dt>
              <dd className="text-muted-foreground mt-1">
                Да. Задачи сохраняются локально и синхронизируются с сервером при восстановлении
                соединения.
              </dd>
            </div>
            <div>
              <dt className="font-medium">На каких языках доступен интерфейс?</dt>
              <dd className="text-muted-foreground mt-1">
                Русский и английский — язык переключается одной кнопкой в шапке.
              </dd>
            </div>
          </dl>
        </section>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Готовы начать? <Link to="/auth" className="text-primary underline">Создайте аккаунт</Link> и
          добавьте первую задачу за пару секунд.
        </p>
      </div>
    </main>
  );
}
