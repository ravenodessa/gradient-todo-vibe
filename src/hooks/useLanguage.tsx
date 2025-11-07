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
    'back': 'Назад',
    'email': 'Email',
    'password': 'Пароль',
    
    // Index page
    'your_tasks': 'Ваши задачи',
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
  },
  en: {
    // Common
    'loading': 'Loading...',
    'save': 'Save',
    'saving': 'Saving...',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'back': 'Back',
    'email': 'Email',
    'password': 'Password',
    
    // Index page
    'your_tasks': 'Your Tasks',
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
