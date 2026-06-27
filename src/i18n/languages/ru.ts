export const ru = {
  // Command descriptions
  'commands.add-dir.description': 'Добавить новую рабочую директорию',
  'commands.agents.description': 'Управление конфигурациями агентов',
  'commands.auto-fix.description':
    'Настроить авто-исправление: запуск lint/test после правок ИИ',
  'commands.branch.description':
    'Создать ответвление текущего разговора в этой точке',
  'commands.btw.description':
    'Задать быстрый вопрос без прерывания основного разговора',
  'commands.cache-stats.description':
    'Показать статистику попаданий/промахов кэша (работает со всеми провайдерами)',
  'commands.clear.description':
    'Очистить историю разговора и освободить контекст',
  'commands.color.description': 'Установить цвет строки ввода для этой сессии',
  'commands.compact.description':
    'Очистить историю разговора, сохранив краткое содержание. Опционально: /compact [инструкции для сжатия]',
  'commands.commit-message.description':
    'Настроить текст атрибуции в коммитах',
  'commands.config.description': 'Открыть панель настроек',
  'commands.continue.description': 'Продолжить текущую задачу',
  'commands.copy.description':
    'Скопировать последний ответ Claude в буфер обмена (или /copy N для N-го с конца)',
  'commands.context.description': 'Показать использование контекста',
  'commands.cost.description':
    'Показать общую стоимость и продолжительность текущей сессии',
  'commands.diff.description': 'Просмотр незафиксированных изменений и диффов по ходу',
  'commands.doctor.description':
    'Диагностировать и проверить установку и настройки Claude Code',
  'commands.dream.description':
    'Запустить консолидацию памяти — синтезировать недавние сессии в долгосрочные воспоминания',
  'commands.effort.description': 'Установить уровень усилий для модели',
  'commands.exit.description': 'Выйти из REPL',
  'commands.export.description':
    'Экспортировать текущий разговор в файл или буфер обмена',
  'commands.heapdump.description': 'Сохранить JS heap на ~/Desktop',
  'commands.help.description': 'Показать справку и доступные команды',
  'commands.hooks.description': 'Просмотр конфигураций хуков для событий инструментов',
  'commands.ide.description': 'Управление интеграциями IDE и статусом',
  'commands.init.description':
    'Инициализировать новый файл инструкций проекта с документацией кодовой базы',
  'commands.insights.description':
    'Создать отчёт с анализом ваших сессий Claude Code',
  'commands.install-github-app.description':
    'Настроить Claude GitHub Actions для репозитория',
  'commands.knowledge.description': 'Управление нативным графом знаний',
  'commands.login.description': 'Войти с учётной записью Anthropic',
  'commands.logout.description': 'Выйти из учётной записи Anthropic',
  'commands.lsp.description':
    'Проверить и настроить Language Server Protocol',
  'commands.mcp.description': 'Управление серверами MCP',
  'commands.memory.description': 'Редактировать файлы памяти Claude',
  'commands.onboard-github.description':
    'Интерактивная настройка GitHub Copilot: OAuth авторизация в защищённом хранилище',
  'commands.output-style.description':
    'Устарело: используйте /config для смены стиля вывода',
  'commands.permissions.description':
    'Управление правилами разрешений и запретов инструментов',
  'commands.plan.description':
    'Включить режим планирования или просмотреть текущий план сессии',
  'commands.plugin.description': 'Управление плагинами Claude Code',
  'commands.provider.description': 'Управление профилями провайдеров API',
  'commands.pr-comments.description':
    'Получить комментарии из GitHub pull request',
  'commands.release-notes.description': 'Просмотреть примечания к выпускам',
  'commands.reload-plugins.description':
    'Активировать ожидающие изменения плагинов в текущей сессии',
  'commands.rename.description': 'Переименовать текущий разговор',
  'commands.request-size.description':
    'Показать расчётную загрузку контекста запроса и основных участников',
  'commands.resume.description': 'Продолжить предыдущий разговор',
  'commands.review.description': 'Проверить pull request',
  'commands.rewind.description':
    'Восстановить код и/или разговор до предыдущего состояния',
  'commands.security-review.description':
    'Выполнить проверку безопасности ожидающих изменений в текущей ветке',
  'commands.skills.description': 'Список доступных навыков',
  'commands.stats.description':
    'Показать статистику использования и активность Claude Code',
  'commands.status.description':
    'Показать статус Claude Code: версию, модель, аккаунт, подключение к API и статус инструментов',
  'commands.statusline.description': 'Настроить строку статуса Claude Code',
  'commands.stickers.description': 'Заказать стикеры Claude Code',
  'commands.tasks.description': 'Список и управление фоновыми задачами',
  'commands.terminal-setup.description':
    'Установить горячую клавишу Shift+Enter для новых строк',
  'commands.theme.description': 'Изменить тему',
  'commands.usage.description': 'Показать лимиты использования плана',
  'commands.vim.description': 'Переключить между режимами редактирования Vim и обычным',
  'commands.wiki.description':
    'Инициализировать и проверить вики проекта Claude Code',

  // Our custom commands
  'commands.language.description': 'Изменить язык интерфейса',
  'commands.session.description': 'Просмотр и управление локальными сессиями',
  'commands.system-reset.description': 'Сбросить системный промпт к значению по умолчанию',

  // Skills section
  'skills.batch.description':
    'Исследовать и спланировать масштабное изменение, затем выполнить его параллельно на 5–30 изолированных агентах worktree, каждый из которых открывает PR.',
  'skills.batch.whenToUse':
    'Используйте, когда пользователь хочет выполнить масштабное механическое изменение во многих файлах (миграции, рефакторинг, массовые переименования), которое можно разбить на независимые параллельные единицы.',
  'skills.debug.ant.description':
    'Отладить текущую сессию Claude Code, читая журнал отладки сессии. Включает всё логирование событий',
  'skills.debug.default.description':
    'Включить журналирование отладки для этой сессии и помочь диагностировать проблемы',
  'skills.loop.description':
    'Запускать промпт с фиксированным интервалом или динамически перепланировать его, включая чистые циклы режима обслуживания.',
  'skills.loop.whenToUse':
    'Когда пользователь хочет отслеживать статус, управлять рабочим процессом, запускать периодическое обслуживание или повторно запускать промпт в текущей сессии.',
  'skills.simplify.description':
    'Проверить изменённый код на предмет повторного использования, качества и эффективности, затем исправить найденные проблемы.',
  'skills.update-config.description':
    'Используйте этот навык для настройки Claude Code через settings.json. Автоматизированное поведение (\"с этого момента когда X\", \"каждый раз когда X\", \"всякий раз когда X\", \"до/после X\") требует хуков, настроенных в settings.json — их выполняет система, а не Claude, поэтому память/предпочтения не могут их выполнить. Также используйте для: разрешений (\"разрешить X\", \"добавить разрешение\", \"переместить разрешение\"), переменных окружения (\"set X=Y\"), устранения неполадок хуков или любых изменений файлов settings.json/settings.local.json.',

  // Skills menu UI
  'skills.menu.title': 'Навыки',
  'skills.menu.install_hint': 'Нажмите [I] для установки навыка из Git репозитория',
  'skills.menu.empty': 'Создайте навыки в .claude/skills/<имя>/SKILL.md',
  'skills.menu.install_title': 'Установить навык из Git',
  'skills.menu.install_subtitle': 'Введите Git URL репозитория навыка (.git)',
  'skills.menu.install_placeholder': 'https://github.com/user/skill-name.git',
  'skills.menu.install_back': 'Нажмите Esc для возврата к списку',
  'skills.menu.installing_title': 'Установка навыка',
  'skills.menu.installing_subtitle': 'Выполняется git clone...',
  'skills.menu.installing_msg': 'Клонирование {url}...',
  'skills.menu.installing_wait': 'Пожалуйста, подождите пока файлы загружаются.',
  'skills.menu.success_title': 'Успешно!',
  'skills.menu.success_subtitle': 'Навык успешно установлен',
  'skills.menu.success_msg': 'Навык успешно клонирован, проверен и загружен!',
  'skills.menu.success_back': 'Нажмите [Enter] или [Esc] для возврата к списку',
  'skills.menu.error_title': 'Ошибка установки навыка',
  'skills.menu.error_subtitle': 'Установка не удалась',
  'skills.menu.error_back': 'Нажмите [Enter] или [Esc] для возврата к списку',
  'skills.menu.source.plugin': 'Навыки плагина',
  'skills.menu.source.mcp': 'Навыки MCP',
  'skills.source.title': '{source} навыки',

  // Memory command UI
  'memory.title': 'Память',
  'memory.manage_title': 'Управление памятью',
  'memory.edit_option': 'Редактировать файл памяти',
  'memory.reset_option': 'Сбросить/Очистить файл памяти',
  'memory.back_option': 'Назад',
  'memory.confirm_reset_title': 'Подтвердить сброс/очистку',
  'memory.confirm_reset_yes': 'Да, удалить навсегда',
  'memory.confirm_reset_no': 'Нет, оставить',
  'memory.new_file': 'Новый файл (ещё не создан)',
  'memory.saved_in': 'Сохранён в {path}',
  'memory.learn_more': 'Подробнее:',
  'memory.cancelled': 'Редактирование памяти отменено',
  'memory.opened': 'Открыт файл памяти {path}',
  'memory.reset_success': 'Файл памяти успешно сброшен/удалён',
  'memory.reset_failed': 'Ошибка при сбросе файла памяти: {err}',
  'memory.not_exists': 'Файл памяти не существует',

  // Language command UI
  'language.title': 'Выберите предпочитаемый язык',
  'language.set_russian': 'Язык интерфейса изменён на Русский.',
  'language.set_english': 'Interface language set to English.',
  'language.dismissed': 'Выбор языка отменён',

  // Effort command UI
  'effort.title': 'Уровень усилий',
  'effort.subtitle': 'Выберите уровень вычислительных ресурсов модели',

  // Update notification
  'update.available': 'Доступно обновление Ultimate Claude Code: v{version}. Запустите /update для установки.',
  'update.available_en': 'Ultimate Claude Code update available: v{version}. Run /update to install.',

  // Logo welcome screen
  'logo.tips_title': 'Советы:',
  'logo.recent_updates': 'Последние обновления',

  // Feed section strings
  'feed.recent_sessions': 'Недавние сессии',
  'feed.no_sessions': 'Нет недавних сессий',
  'feed.check_release_notes': 'Используйте /release-notes для просмотра обновлений',
  'feed.tips_title': 'Советы для начала работы',
  'feed.home_dir_warning': 'Примечание: ultimate-claude запущен в вашей домашней директории. Для лучшей работы запустите его в директории проекта.',

  // Help menu translations
  'help.bash_mode': '! для режима bash',
  'help.commands': '/ для команд',
  'help.file_paths': '@ для путей к файлам',
  'help.background': '& для фонового режима',
  'help.btw': '/btw для быстрого вопроса',
  'help.clear_input': 'нажмите дважды esc для очистки ввода',
  'help.auto_accept_edits': 'для авто-принятия правок',
  'help.verbose_output': 'для подробного вывода',
  'help.toggle_tasks': 'для переключения задач',
  'help.undo': 'для отмены',
  'help.suspend': 'ctrl + z для приостановки',
  'help.paste_images': 'для вставки изображений',
  'help.switch_model': 'для смены модели',
  'help.toggle_fast_mode': 'для переключения быстрого режима',
  'help.stash_prompt': 'для сохранения промпта',
  'help.external_editor': 'для редактирования в $EDITOR',
  'help.keybindings': '/keybindings для настройки',
  'help.terminal': 'для терминала',

  // Logo screen
  'logo.debug_mode': 'Режим отладки включен',
  'logo.logging_to': 'Логирование в: ',
  'logo.tmux_session': 'сессия tmux: ',
  'logo.tmux_detach': 'Отключение:',
  'logo.tmux_press_prefix': 'нажмите префикс дважды — Claude использует',
  'logo.message_from': 'Сообщение от {org}:',
  'logo.sandbox_hint': 'Ваши bash-команды будут выполняться в песочнице. Отключить: /sandbox.',
  'logo.api_billing': 'Оплата по использованию API',
  'logo.in_connector': 'в',
  'logo.for_more': '{cmd} для подробностей',

  // REPL interface
  'repl.exit_message': 'Нажмите {key} еще раз для выхода',
  'repl.pasting_text': 'Вставка текста…',
  'repl.on': 'в',
  'repl.shortcuts_hint': '? для справки по клавишам',
  'repl.vs_code_mac_hint': 'настройте macOptionClickForcesSelection в настройках VS Code',
  'repl.voice_hold_to_speak': 'удерживайте {key} для разговора',

  // Shortcut action labels
  'shortcut.action.toggleTranscript': 'переключить подробный вывод',
  'shortcut.action.toggleTodos': 'скрыть/показать задачи',
  'shortcut.action.undo': 'отменить',
  'shortcut.action.stash': 'сохранить промпт',
  'shortcut.action.cycleMode': 'переключить режим',
  'shortcut.action.modelPicker': 'сменить модель',
  'shortcut.action.fastMode': 'переключить быстрый режим',
  'shortcut.action.externalEditor': 'редактировать в $EDITOR',
  'shortcut.action.toggleTerminal': 'переключить терминал',
  'shortcut.action.imagePaste': 'вставить изображение',
  'shortcut.action.cycle': 'переключить',
  'shortcut.action.copy': 'копировать',
  'shortcut.action.native select': 'выбор мыши',
  'shortcut.action.speak': 'говорить',
  'shortcut.action.view tasks': 'просмотр задач',
  'shortcut.action.manage': 'управление',
  'shortcut.action.interrupt': 'прервать',
  'shortcut.action.stop agents': 'остановить агентов',
  'shortcut.action.return to team lead': 'вернуться к лид-агенту',
  'shortcut.action.show tasks': 'показать задачи',
  'shortcut.action.show teammates': 'показать агентов',
  'shortcut.action.hide': 'скрыть',
  'shortcut.action.hide tasks': 'скрыть задачи',
  'shortcut.action.cancel': 'отмена',
  'shortcut.action.confirm': 'подтвердить',
  'shortcut.action.back': 'назад',

  // Release notes command
  'release_notes.current': 'текущая',
  'release_notes.close': '[Закрыть]',
  'release_notes.back': '‹ Назад к списку',
  'release_notes.details_title': 'Описание обновлений для {version}',
  'release_notes.list_title': 'Выберите версию для просмотра изменений',
} as const
