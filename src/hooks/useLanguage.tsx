import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  ru: {
    // Common
    'loading': 'Загрузка...',
    'save': 'Сохранить',
    'saving': 'Сохранение...',
    'cancel': 'Отмена',
    'delete': 'Удалить',
    'edit': 'Редактировать',
    'clear': 'Очистить',
    'welcome_tagline': 'онлайн-менеджер задач',
    'edit_task': 'Редактировать задачу',
    'delete_task': 'Удалить задачу',
    'mark_complete': 'Отметить задачу выполненной',
    'mark_incomplete': 'Отметить задачу невыполненной',
    'open_archive': 'Открыть архив',
    'open_settings': 'Открыть настройки профиля',
    'switch_language': 'Переключить язык',
    'go_home': 'На главную',
    'back': 'Назад',
    'email': 'Email',
    'password': 'Пароль',

    // Features page
    'features_meta_title': 'Возможности — онлайн менеджер задач с повторениями',
    'features_meta_description': 'Онлайн todo list с повторяющимися задачами, избранными шаблонами, архивом, офлайн-режимом и установкой как приложение. Узнайте, как работают все возможности.',
    'features_app_description': 'Онлайн менеджер задач с повторяющимися задачами, избранными шаблонами, архивом и офлайн-режимом.',
    'features_main_title': 'Онлайн менеджер задач с повторениями',
    'features_main_description': 'Todo List — простой список задач в браузере: разделы по срокам, повторяющиеся дела, избранные шаблоны, архив и работа без интернета. Бесплатно, без установки.',
    'features_start_free': 'Начать бесплатно',
    'features_open_tasks': 'Открыть мои задачи',
    'features_recurring_title': 'Повторяющиеся задачи',
    'features_recurring_text': 'Настройте ежедневное, еженедельное или ежемесячное повторение — после выполнения задача автоматически создаётся заново на следующую дату. Идеально для привычек, отчётов и регулярных дел.',
    'features_favorites_title': 'Избранные шаблоны',
    'features_favorites_text': 'Часто повторяющиеся дела храните в «Избранном» и добавляйте их в список задач одним кликом. Нужные шаблоны можно закрепить наверху списка.',
    'features_offline_title': 'Офлайн-режим',
    'features_offline_text': 'Список задач работает без интернета: изменения сохраняются локально и синхронизируются, когда связь возвращается.',
    'features_archive_title': 'Архив задач',
    'features_archive_text': 'Выполненные дела уходят в архив, а не исчезают. В любой момент можно восстановить задачу или очистить архив полностью.',
    'features_sections_title': 'Умные разделы и быстрые переносы',
    'features_sections_text': 'Задачи автоматически группируются: Просрочено, Сегодня, Завтра, Позже. Кнопка «На завтра» переносит дело на следующий день одним нажатием.',
    'features_pwa_title': 'Установка как приложение (PWA)',
    'features_pwa_text': 'Установите менеджер задач на телефон или компьютер — он открывается как обычное приложение, с быстрым запуском и офлайн-доступом.',
    'features_how_title': 'Как работают повторяющиеся задачи',
    'features_how_step1': 'Создайте задачу и укажите дату выполнения.',
    'features_how_step2': 'Выберите правило повторения: ежедневно, еженедельно или ежемесячно — оно сохраняется вместе с задачей.',
    'features_how_step3': 'Отметьте задачу выполненной: она уйдёт в архив, а её копия автоматически появится на следующую дату по правилу повторения.',
    'features_how_step4': 'Нужно сдвинуть дело? Кнопка «На завтра» переносит задачу на следующий день без редактирования.',
    'features_faq_title': 'Частые вопросы',
    'features_faq_q1': 'Нужно ли платить за использование?',
    'features_faq_a1': 'Нет, список задач доступен бесплатно после регистрации по email или через Google.',
    'features_faq_q2': 'Работает ли приложение без интернета?',
    'features_faq_a2': 'Да. Задачи сохраняются локально и синхронизируются с сервером при восстановлении соединения.',
    'features_faq_q3': 'На каких языках доступен интерфейс?',
    'features_faq_a3': 'Русский и английский — язык переключается одной кнопкой в шапке.',
    'features_cta_text': 'Готовы начать?',
    'features_cta_link': 'Создайте аккаунт',
    'features_cta_suffix': 'и добавьте первую задачу за пару секунд.',

    // Index page
    'your_tasks': 'Задачи',
    'user': 'Пользователь',
    'logout': 'Выйти',
    'welcome': 'Добро пожаловать в TodoApp',
    'login_prompt': 'Войдите, чтобы управлять своими задачами',
    'login_register': 'Войти / Регистрация',

    // Auth page
    'login': 'Вход',
    'register': 'Регистрация',
    'login_description': 'Войдите в свой аккаунт для доступа к задачам',
    'register_description': 'Создайте аккаунт для сохранения задач',
    'email_placeholder': 'ваш@email.com',
    'password_placeholder': '••••••••',
    'logging_in': 'Вхожу...',
    'registering': 'Регистрирую...',
    'sign_in': 'Войти',
    'sign_up': 'Зарегистрироваться',
    'no_account': 'Нет аккаунта? Зарегистрируйтесь',
    'have_account': 'Уже есть аккаунт? Войдите',
    'or': 'или',
    'continue_with_google': 'Продолжить с Google',

    // Profile page
    'profile': 'Профиль',
    'profile_settings': 'Настройки профиля',
    'display_name': 'Отображаемое имя',
    'display_name_placeholder': 'Введите ваше имя',

    // Archive page
    'task_archive': 'Архив задач',
    'archive_empty': 'Архив пуст',
    'archive_description': 'Архивированные задачи будут отображаться здесь',
    'total_in_archive': 'Всего в архиве',
    'task': 'задача',
    'tasks': 'задач',
    'delete_all': 'Удалить все',
    'delete_all_archived': 'Удалить все архивные задачи?',
    'delete_all_warning': 'Это действие нельзя отменить. Все архивные задачи будут удалены навсегда.',
    'archived_on': 'Архивировано',
    'restore': 'Восстановить',
    'delete_forever': 'Удалить навсегда',

    // TodoApp
    'loading_tasks': 'Загрузка задач...',
    'add_new_task': 'Добавить новую задачу...',
    'select_date': 'Выбрать дату выполнения',
    'remove_date': 'Убрать дату',
    'tomorrow': 'Завтра',
    'next_week': 'Следующая неделя',
    'archive_completed': 'Архивировать выполненные',
    'today': 'Сегодня',
    'overdue': 'Просрочено',
    'later': 'Позже',
    'no_tasks': 'Задач нет',
    'no_tasks_description': 'Добавьте свою первую задачу выше',
    'active_tasks': 'активных задач',
    'total_tasks': 'всего задач',
    'date': 'Дата',
    'recurrence': 'Повторение',
    'recurrence_none': 'Без повторения',
    'recurrence_daily': 'Ежедневно',
    'recurrence_weekdays': 'По будням',
    'recurrence_weekends': 'По выходным',
    'recurrence_weekly': 'Раз в неделю',
    'recurrence_monthly': 'Раз в месяц',
    'recurrence_yearly': 'Раз в год',
    'repeats': 'Повторяется',

    // Toast messages
    'error': 'Ошибка',
    'success': 'Успешно!',
    'info': 'Информация',
    'welcome_message': 'Добро пожаловать!',
    'login_success': 'Вы успешно вошли в систему',
    'register_success': 'Проверьте электронную почту для подтверждения аккаунта',
    'fill_all_fields': 'Пожалуйста, заполните все поля',
    'unexpected_error': 'Произошла неожиданная ошибка',
    'task_added': 'Задача добавлена',
    'task_updated': 'Задача обновлена',
    'task_deleted': 'Задача удалена',
    'task_moved_tomorrow': 'Задача перенесена на завтра',
    'move_to_tomorrow': 'На завтра',
    'task_restored': 'Задача восстановлена',
    'tasks_archived': 'Архивировано {count} выполненных задач',
    'no_completed_tasks': 'Нет выполненных задач для архивирования',
    'all_archived_deleted': 'Все архивные задачи удалены',
    'failed_load_tasks': 'Не удалось загрузить задачи',
    'failed_add_task': 'Не удалось добавить задачу',
    'failed_update_task': 'Не удалось обновить задачу',
    'failed_delete_task': 'Не удалось удалить задачу',
    'failed_archive_tasks': 'Не удалось архивировать задачи',
    'failed_load_archived': 'Не удалось загрузить архивированные задачи',
    'failed_restore_task': 'Не удалось восстановить задачу',
    'failed_delete_all': 'Не удалось удалить все архивные задачи',

    // Offline indicator
    'offline': 'Офлайн режим',
    'online': 'Подключение восстановлено',
    'synced': 'Синхронизировано',
    'changes': 'изменений',
    'offline_mode': 'Изменения сохранятся локально',

    // PWA Install
    'install_app': 'Установить приложение',

    // Notifications
    'notifications': 'Уведомления',
    'reminder_time': 'Время напоминания',
    'set_reminder': 'Установить напоминание',
    'remove_reminder': 'Удалить напоминание',
    'notifications_not_supported': 'Уведомления не поддерживаются в вашем браузере',
    'notifications_enabled': 'Уведомления включены',
    'notifications_denied': 'Уведомления отклонены',
    'enable_notifications': 'Включить уведомления',
    'reminder_set': 'Напоминание установлено',
    'reminder_removed': 'Напоминание удалено',

    // Keyboard shortcuts
    'keyboard_shortcuts': 'Горячие клавиши',
    'shortcuts_description': 'Используйте эти клавиши для быстрого управления задачами',
    'shortcut_new_task': 'Фокус на поле новой задачи',
    'shortcut_edit_task': 'Редактировать первую незавершенную задачу',
    'shortcut_save': 'Сохранить изменения (при редактировании)',
    'shortcut_cancel': 'Отменить редактирование',
    'close': 'Закрыть',

    // Favorites
    'favorites': 'Избранное',
    'add_favorite_placeholder': 'Добавить в избранное...',
    'no_favorites': 'Избранных задач нет',
    'no_favorites_description': 'Добавьте часто используемые задачи для быстрого доступа',
    'favorite_added': 'Добавлено в избранное',
    'favorite_updated': 'Избранная задача обновлена',
    'favorite_deleted': 'Удалено из избранного',
    'favorite_added_to_tasks': 'Задача добавлена из избранного',
    'favorite_pinned': 'Закреплено вверху',
    'favorite_unpinned': 'Откреплено',
    'pin_to_top': 'Закрепить вверху',
    'unpin': 'Открепить',
    'add_to_tasks': 'Добавить в задачи',
    'total_favorites': 'Всего в избранном',
    'failed_load_favorites': 'Не удалось загрузить избранное',
    'failed_add_favorite': 'Не удалось добавить в избранное',
    'failed_update_favorite': 'Не удалось обновить избранное',
    'failed_delete_favorite': 'Не удалось удалить из избранного',
  },
  en: {
    // Common
    'loading': 'Loading...',
    'save': 'Save',
    'saving': 'Saving...',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'clear': 'Clear',
    'welcome_tagline': 'online task manager',
    'edit_task': 'Edit task',
    'delete_task': 'Delete task',
    'mark_complete': 'Mark task as complete',
    'mark_incomplete': 'Mark task as incomplete',
    'open_archive': 'Open archive',
    'open_settings': 'Open profile settings',
    'switch_language': 'Switch language',
    'go_home': 'Go to home',
    'back': 'Back',
    'email': 'Email',
    'password': 'Password',

    // Features page
    'features_meta_title': 'Features — online task manager with recurring tasks',
    'features_meta_description': 'Online todo list with recurring tasks, favorite templates, archive, offline mode, and PWA install. Learn how all features work.',
    'features_app_description': 'Online task manager with recurring tasks, favorite templates, archive, and offline mode.',
    'features_main_title': 'Online task manager with recurring tasks',
    'features_main_description': 'Todo List is a simple browser-based task list: due-date sections, recurring tasks, favorite templates, archive, and offline mode. Free, no installation required.',
    'features_start_free': 'Start for free',
    'features_open_tasks': 'Open my tasks',
    'features_recurring_title': 'Recurring tasks',
    'features_recurring_text': 'Set daily, weekly, or monthly recurrence — after completion the task is automatically recreated for the next date. Perfect for habits, reports, and regular to-dos.',
    'features_favorites_title': 'Favorite templates',
    'features_favorites_text': 'Keep frequently used to-dos in Favorites and add them to your task list in one click. Important templates can be pinned to the top.',
    'features_offline_title': 'Offline mode',
    'features_offline_text': 'Your task list works without internet: changes are saved locally and synced when the connection returns.',
    'features_archive_title': 'Task archive',
    'features_archive_text': 'Completed tasks go to an archive instead of disappearing. You can restore a task or clear the archive at any time.',
    'features_sections_title': 'Smart sections & quick reschedules',
    'features_sections_text': 'Tasks are automatically grouped: Overdue, Today, Tomorrow, Later. The "Tomorrow" button moves a task to the next day in one tap.',
    'features_pwa_title': 'Install as app (PWA)',
    'features_pwa_text': 'Install the task manager on your phone or computer — it opens like a regular app, with fast launch and offline access.',
    'features_how_title': 'How recurring tasks work',
    'features_how_step1': 'Create a task and set a due date.',
    'features_how_step2': 'Choose a recurrence rule: daily, weekly, or monthly — it is saved with the task.',
    'features_how_step3': 'Mark the task as done: it goes to the archive, and a copy is automatically created for the next date according to the rule.',
    'features_how_step4': 'Need to postpone? The "Tomorrow" button moves the task to the next day without editing.',
    'features_faq_title': 'Frequently asked questions',
    'features_faq_q1': 'Is it free to use?',
    'features_faq_a1': 'Yes, the task list is free after signing up with email or Google.',
    'features_faq_q2': 'Does the app work offline?',
    'features_faq_a2': 'Yes. Tasks are saved locally and synced with the server when the connection is restored.',
    'features_faq_q3': 'What languages is the interface available in?',
    'features_faq_a3': 'Russian and English — the language is switched with one button in the header.',
    'features_cta_text': 'Ready to start?',
    'features_cta_link': 'Create an account',
    'features_cta_suffix': 'and add your first task in seconds.',

    // Index page
    'your_tasks': 'Tasks',
    'user': 'User',
    'logout': 'Logout',
    'welcome': 'Welcome to TodoApp',
    'login_prompt': 'Sign in to manage your tasks',
    'login_register': 'Sign In / Register',

    // Auth page
    'login': 'Sign In',
    'register': 'Sign Up',
    'login_description': 'Sign in to your account to access tasks',
    'register_description': 'Create an account to save your tasks',
    'email_placeholder': 'your@email.com',
    'password_placeholder': '••••••••',
    'logging_in': 'Signing in...',
    'registering': 'Signing up...',
    'sign_in': 'Sign In',
    'sign_up': 'Sign Up',
    'no_account': 'No account? Sign up',
    'have_account': 'Already have an account? Sign in',
    'or': 'or',
    'continue_with_google': 'Continue with Google',

    // Profile page
    'profile': 'Profile',
    'profile_settings': 'Profile Settings',
    'display_name': 'Display Name',
    'display_name_placeholder': 'Enter your name',

    // Archive page
    'task_archive': 'Task Archive',
    'archive_empty': 'Archive is empty',
    'archive_description': 'Archived tasks will appear here',
    'total_in_archive': 'Total in archive',
    'task': 'task',
    'tasks': 'tasks',
    'delete_all': 'Delete All',
    'delete_all_archived': 'Delete all archived tasks?',
    'delete_all_warning': 'This action cannot be undone. All archived tasks will be permanently deleted.',
    'archived_on': 'Archived on',
    'restore': 'Restore',
    'delete_forever': 'Delete Forever',

    // TodoApp
    'loading_tasks': 'Loading tasks...',
    'add_new_task': 'Add new task...',
    'select_date': 'Select due date',
    'remove_date': 'Remove date',
    'tomorrow': 'Tomorrow',
    'next_week': 'Next Week',
    'archive_completed': 'Archive Completed',
    'today': 'Today',
    'overdue': 'Overdue',
    'later': 'Later',
    'no_tasks': 'No tasks',
    'no_tasks_description': 'Add your first task above',
    'active_tasks': 'active tasks',
    'total_tasks': 'total tasks',
    'date': 'Date',
    'recurrence': 'Recurrence',
    'recurrence_none': 'No recurrence',
    'recurrence_daily': 'Daily',
    'recurrence_weekdays': 'Weekdays',
    'recurrence_weekends': 'Weekends',
    'recurrence_weekly': 'Weekly',
    'recurrence_monthly': 'Monthly',
    'recurrence_yearly': 'Yearly',
    'repeats': 'Repeats',

    // Toast messages
    'error': 'Error',
    'success': 'Success!',
    'info': 'Information',
    'welcome_message': 'Welcome!',
    'login_success': 'You have successfully signed in',
    'register_success': 'Check your email to confirm your account',
    'fill_all_fields': 'Please fill in all fields',
    'unexpected_error': 'An unexpected error occurred',
    'task_added': 'Task added',
    'task_updated': 'Task updated',
    'task_deleted': 'Task deleted',
    'task_moved_tomorrow': 'Task moved to tomorrow',
    'move_to_tomorrow': 'Tomorrow',
    'task_restored': 'Task restored',
    'tasks_archived': 'Archived {count} completed tasks',
    'no_completed_tasks': 'No completed tasks to archive',
    'all_archived_deleted': 'All archived tasks deleted',
    'failed_load_tasks': 'Failed to load tasks',
    'failed_add_task': 'Failed to add task',
    'failed_update_task': 'Failed to update task',
    'failed_delete_task': 'Failed to delete task',
    'failed_archive_tasks': 'Failed to archive tasks',
    'failed_load_archived': 'Failed to load archived tasks',
    'failed_restore_task': 'Failed to restore task',
    'failed_delete_all': 'Failed to delete all archived tasks',

    // Offline indicator
    'offline': 'Offline mode',
    'online': 'Back online',
    'synced': 'Synced',
    'changes': 'changes',
    'offline_mode': 'Changes will be saved locally',

    // PWA Install
    'install_app': 'Install App',

    // Notifications
    'notifications': 'Notifications',
    'reminder_time': 'Reminder Time',
    'set_reminder': 'Set Reminder',
    'remove_reminder': 'Remove Reminder',
    'notifications_not_supported': 'Notifications are not supported in your browser',
    'notifications_enabled': 'Notifications enabled',
    'notifications_denied': 'Notifications denied',
    'enable_notifications': 'Enable Notifications',
    'reminder_set': 'Reminder set',
    'reminder_removed': 'Reminder removed',

    // Keyboard shortcuts
    'keyboard_shortcuts': 'Keyboard Shortcuts',
    'shortcuts_description': 'Use these keys for quick task management',
    'shortcut_new_task': 'Focus on new task field',
    'shortcut_edit_task': 'Edit first incomplete task',
    'shortcut_save': 'Save changes (when editing)',
    'shortcut_cancel': 'Cancel editing',
    'close': 'Close',

    // Favorites
    'favorites': 'Favorites',
    'add_favorite_placeholder': 'Add to favorites...',
    'no_favorites': 'No favorites yet',
    'no_favorites_description': 'Add frequently used tasks for quick access',
    'favorite_added': 'Added to favorites',
    'favorite_updated': 'Favorite updated',
    'favorite_deleted': 'Removed from favorites',
    'favorite_added_to_tasks': 'Task added from favorites',
    'favorite_pinned': 'Pinned to top',
    'favorite_unpinned': 'Unpinned',
    'pin_to_top': 'Pin to top',
    'unpin': 'Unpin',
    'add_to_tasks': 'Add to tasks',
    'total_favorites': 'Total favorites',
    'failed_load_favorites': 'Failed to load favorites',
    'failed_add_favorite': 'Failed to add to favorites',
    'failed_update_favorite': 'Failed to update favorite',
    'failed_delete_favorite': 'Failed to remove from favorites',
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'ru') ? saved : 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations.ru] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
