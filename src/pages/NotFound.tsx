import { SEO } from '@/components/SEO';

const NotFound = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <SEO
        title="Страница не найдена (404) — Todo List"
        description="Запрошенная страница не найдена. Вернитесь на главную, чтобы открыть свой список задач, или посмотрите возможности менеджера задач."
        path="/404"
        noindex
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Страница не найдена</p>
        <div className="flex items-center justify-center gap-4">
          <a href="/" className="text-primary underline hover:text-primary/80">
            На главную
          </a>
          <a href="/features" className="text-primary underline hover:text-primary/80">
            Возможности
          </a>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
