export const ruLocal = {
    ru: {
        translation: {
            newChat: {
                free: 'Бесплатный',
                pro: 'Профессиональный',
                max: 'Максимальный',
                plan: "план",
                upgrade: "Обновить",
                listeningPlaceholder: "Слушаю...",
                defaultPlaceholder: "Что я могу для вас сделать?",
                cancel: "Отмена",
                suggestions: [
                    "Сделай краткое изложение темы",
                    "Помоги мне что-то написать",
                    "Объясни концепцию простыми словами",
                    "Проверь мой код",
                    "Пошевели идеи со мной",
                    "Помоги мне принять решение"
                ]
            },
            chat: {
                untitled: "Чат без названия",
                sessionLimitReached: "Текущая сессия достигла лимита",
                sessionUsage: "{{usedSession}}% использовано от сессии",
                upgrade: "Обновить →",
                listeningPlaceholder: "Слушаю...",
                replyPlaceholder: "Ответить...",
                cancel: "Отмена",
                sendHint: "Enter — отправить · Shift + Enter — новая строка"
            },
            recents: {
                title: "Чаты",
                newChat: "Новый чат",
                searchPlaceholder: "Поиск по чатам...",
                today: "Сегодня",
                yesterday: "Вчера",
                lastWeek: "Последние 7 дней",
                older: "Ранее"
            },
            settings: {
                title: "Настройки",
                general: "Общие",
                profile: "Профиль",
                fullName: "Полное имя",
                displayName: "Как Селена должна вас называть?",
                workFunction: "Что лучше всего описывает вашу работу?",
                workFunctionSelect: "Выберите сферу вашей работы",
                preferences: "Какие личные предпочтения Селена должна учитывать в ответах?",
                preferencesNote: "Ваши предпочтения будут применяться ко всем разговорам в рамках правил Selene.",
                preferencesPlaceholder: "например: я в основном пишу код на Python (не новичок в программировании)",
                cancel: "Отмена",
                saveChanges: "Сохранить изменения",
                appearance: "Внешний вид",
                colorMode: "Цветовой режим",
                light: "Светлый",
                auto: "Авто",
                dark: "Тёмный",
                billing: "Оплата",
                account: 'Аккаунт',
                workFunctions: {
                    engineering: "Инженерия",
                    productManagement: "Управление продуктом",
                    design: "Дизайн",
                    marketing: "Маркетинг",
                    sales: "Продажи",
                    research: "Исследования",
                    education: "Образование",
                    other: "Другое"
                }
            },
            settingsBilling: {
                currentPlan: "Текущий план",
                upgradeButton: "Обновить план",
                usageLimitsFree: "* Применяются ограничения использования. Подробнее см. на странице тарифов.",
                usageLimitsPro: "* Применяются ограничения использования. В Pro доступно в 5 раз больше использования, чем в Free.",
                usageLimitsMax: "* План Max включает приоритетный доступ в часы высокой нагрузки.",
                billingCycle: "Цикл оплаты",
                billingCycleValue: "Ежемесячно",
                nextBillingDate: "Следующая дата оплаты",
                amount: "Сумма",
                manageSubscription: "Управлять подпиской",
                usageTier: "Уровень использования",
                paymentMethod: "Способ оплаты",
                updatePaymentMethod: "Обновить",
                billingHistory: "История платежей",
                invoiceStatusPaid: "Оплачено",
                downloadInvoice: "Скачать счёт",
                plan: 'план',
                expires: 'Истекает',
                usage: 'использование'
            },
            settingsAccount: {
                seleneCode: {
                    title: "Selene Code",
                    descriptionPaid: "Инструмент командной строки для агентного программирования. Делегируйте задачи по написанию кода прямо из терминала.",
                    descriptionFree: "Обновите до Pro или Max, чтобы получить доступ к Selene Code и делегировать задачи по написанию кода из терминала.",
                    downloadButton: "Скачать Selene Code",
                    upgradeButton: "Обновить для доступа",
                    installationTitle: "Установка",
                    installationInstruction1: 'После установки, выполните команду ',
                    installationInstruction2: "в своём терминале чтобы настроить CLI-инструмент."
                },
                deleteAccount: {
                    title: "Удалить аккаунт",
                    button: "Удалить аккаунт",
                    confirmTitle: "Удалить аккаунт?",
                    confirmDescription: "Это навсегда удалит ваш аккаунт, все переписки и настройки. Это действие нельзя отменить.",
                    cancel: "Отмена",
                    confirmDelete: "Да, удалить мой аккаунт"
                }
            },
            upgrade: {
                title: "Тарифы, которые растут вместе с вами",
                monthly: "Ежемесячно",
                yearly: "Ежегодно ",
                yearlySave: "· Экономия 17%",
                usageNote: "*Применяются лимиты использования. Указанные цены не включают налоги."
            },
            sidebar: {
                close: "Закрыть",
                open: "Открыть",
                closeSidebarTip: "Закрыть боковую панель",
                openSidebarTip: "Открыть боковую панель",
                billing: "Оплата",
                recents: "Недавние",
                recentsTip: "Недавние",
                newConversation: "Новый диалог",
                hide: "Скрыть",
                show: "Показать",
                empty: "Ваши разговоры появятся здесь.",
                starred: 'Избранное'
            },
            userDropdown: {
                logout: 'Выйти из аккаунта'
            },
            upgradePro: {
                title: "Обновить до Pro",
                description: "Исследования, код и организация с расширенными возможностями",
                selectBillingCycle: "Выберите цикл оплаты",
                monthly: "Ежемесячно",
                yearly: "Ежегодно",
                yearlySave: "Экономия 17%",
                yearlySubtext: "{{price}}/месяц, оплачивается ежегодно",
                monthlySubtext: "{{price}}/месяц",
                includedTitle: "Что входит в Pro:",
                features: [
                    "В 5 раз больше использования, чем в Бесплатном",
                    "Доступ к Selene Code",
                    "Неограниченные проекты",
                    "Доступ к Research",
                    "Память между разговорами",
                    "Приоритетная поддержка",
                    "Selene в Excel и Chrome"
                ],
                orderSummary: "Сводка заказа",
                proPlan: "План Pro ",
                tax: "Налог (17%)",
                annualDiscount: "Годовая скидка (17%)",
                monthlyTotal: "Итого за месяц",
                dueToday: "К оплате сегодня",
                billedAnnually: "Оплачивается ежегодно",
                paymentMethod: "Способ оплаты",
                fullName: "Полное имя",
                emailAddress: "Адрес электронной почты",
                fullNamePlaceholder: "Иван Иванов",
                emailPlaceholder: "ivan.ivanov@example.com",
                cardNumber: "Номер карты",
                cardNumberPlaceholder: "1234 5678 9012 3456",
                expiryDate: "Срок действия",
                expiryDatePlaceholder: "MM/YY",
                cvc: "CVC",
                cvcPlaceholder: "123",
                country: "Страна",
                countries: {
                    US: "Соединённые Штаты",
                    UK: "Великобритания",
                    CA: "Канада",
                    AU: "Австралия",
                    DE: "Германия",
                    FR: "Франция",
                    other: "Другое"
                },
                zipCode: "Почтовый индекс",
                zipCodePlaceholder: "12345",
                secureNote: "Ваша платёжная информация зашифрована и защищена. Мы никогда не храним полные данные карты.",
                processing: "Обработка...",
                purchaseButton: "Купить Pro - ${{amount}}",
                terms: "Условия использования",
                privacy: "Политика конфиденциальности",
                renewAnnually: " Ваша подписка будет продлеваться ежегодно.",
                purchaseTitle: 'Купить Pro - ',
                byPurchase: 'Покупкой, вы соглашаетесь на',
                and: 'и',
                errors: {
                    fullNameRequired: "Полное имя обязательно",
                    fullNameMinLength: "Имя должно содержать минимум 3 символа",
                    fullNameLettersOnly: "Имя может содержать только буквы",

                    emailRequired: "Электронная почта обязательна",
                    emailInvalid: "Введите корректный адрес электронной почты",

                    cardNumberRequired: "Номер карты обязателен",
                    cardNumberLength: "Номер карты должен содержать 16 цифр",
                    cardNumberDigitsOnly: "Номер карты может содержать только цифры",
                    cardNumberInvalid: "Неверный номер карты",

                    expiryDateRequired: "Срок действия обязателен",
                    expiryDateFormat: "Формат должен быть MM/YY",
                    expiryDateMonthInvalid: "Неверный месяц",
                    expiryDateExpired: "Срок действия карты истёк",

                    cvcRequired: "CVC обязателен",
                    cvcInvalid: "CVC должен содержать 3–4 цифры",

                    zipRequired: "Почтовый индекс обязателен",
                    zipInvalid: "Неверный формат почтового индекса"
                }
            },
            upgradeMax: {
                title: "Обновить до Max",
                description: "Исследования, код и организация с расширенными возможностями",
                selectUsage: "Выберите использование",
                usageOptions: {
                    fiveX: "В 5 раз больше использования, чем в Pro",
                    twentyX: "В 20 раз больше использования, чем в Pro"
                },
                save50: "Экономия 50%",
                includedTitle: "Что входит в Max:",
                features: [
                    "Выберите 5x или 20x больше использования, чем в Pro*",
                    "Более высокие лимиты вывода для всех задач",
                    "Ранний доступ к продвинутым функциям Селены",
                    "Приоритетный доступ в часы высокой нагрузки",
                    "Selene в PowerPoint"
                ],
                orderSummary: "Сводка заказа",
                maxPlan: "План Max ({{usage}})",
                tax: "Налог (17%)",
                annualDiscount: "Годовая скидка (50%)",
                monthlyTotal: "Итого за месяц",
                billedAnnually: "Оплачивается ежегодно",
                paymentMethod: "Способ оплаты",
                fullName: "Полное имя",
                emailAddress: "Адрес электронной почты",
                fullNamePlaceholder: "Иван Иванов",
                emailPlaceholder: "ivan.ivanov@example.com",
                cardNumber: "Номер карты",
                cardNumberPlaceholder: "1234 5678 9012 3456",
                expiryDate: "Срок действия",
                expiryDatePlaceholder: "MM/YY",
                cvc: "CVC",
                cvcPlaceholder: "123",
                country: "Страна",
                countries: {
                    US: "Соединённые Штаты",
                    UK: "Великобритания",
                    CA: "Канада",
                    AU: "Австралия",
                    DE: "Германия",
                    FR: "Франция",
                    other: "Другое"
                },
                zipCode: "Почтовый индекс",
                zipCodePlaceholder: "12345",
                secureNote: "Ваша платёжная информация зашифрована и защищена. Мы никогда не храним полные данные карты.",
                processing: "Обработка...",
                purchaseTitle: "Купить Max - ",
                terms: "Условия использования",
                privacy: "Политика конфиденциальности",
                renewAnnually: "Ваша подписка будет продлеваться ежегодно."
            },
            supportChat: {
                header: {
                    title: "Поддержка Selene",
                    status: "Готовы ответить."
                },
                tabs: {
                    chat: "Чат",
                    faq: "FAQ"
                },
                messages: {
                    success: "Спасибо за обращение! Наша команда поддержки свяжется с вами в ближайшее время. А пока вы можете заглянуть в Центр помощи для быстрых ответов.",
                    error: "Извините, что-то пошло не так, попробуйте позже..."
                },
                close: "Закрыть",
                faq: {
                    title: "Часто задаваемые вопросы",
                    subtitle: "Найдите быстрые ответы на распространённые вопросы",
                    stillHaveQuestions: "Остались вопросы?",
                    chatWithSupport: "Написать в поддержку"
                },
                faqQuestions: [
                    {
                    question: "Как обновить до Pro?",
                    answer: "Вы можете обновить до Pro, нажав кнопку «Обновить» в выпадающем меню или посетив страницу тарифов. Pro включает в себя 5x больше использования, доступ к Selene Code, неограниченные проекты и другие расширенные функции.",
                    },
                    {
                    question: "Какие способы оплаты вы принимаете?",
                    answer: "Мы принимаем все основные кредитные карты (Visa, Mastercard, American Express) и PayPal. Все платежи обрабатываются безопасно через наш зашифрованный платёжный шлюз.",
                    },
                    {
                    question: "Могу ли я отменить подписку в любое время?",
                    answer: "Да! Вы можете отменить подписку в любое время в настройках аккаунта. После отмены доступ к функциям Pro сохранится до конца оплаченного периода.",
                    },
                    {
                    question: "Как работает лимит использования?",
                    answer: "Бесплатный план имеет базовые лимиты использования. План Pro предлагает в 5 раз больше использования, чем Бесплатный. Лимиты обновляются в начале каждого платёжного периода. Вы можете отслеживать использование в панели управления.",
                    },
                    {
                    question: "Что входит в план Pro?",
                    answer: "Pro включает: 5x больше использования, доступ к Selene Code, Cowork для управления файлами, неограниченные проекты, функцию Research, память между разговорами, приоритетную поддержку и интеграции Selene с Excel и Chrome.",
                    },
                    {
                    question: "Вы предлагаете возврат средств?",
                    answer: "Мы предлагаем 14-дневную гарантию возврата средств для новых подписчиков Pro. Если вы не удовлетворены в течение первых 14 дней, обратитесь в службу поддержки для полного возврата.",
                    },
                    {
                    question: "Мои данные в безопасности?",
                    answer: "Да! Мы используем шифрование по отраслевым стандартам для всех передач и хранения данных. Информация о платеже никогда не хранится на наших серверах. Мы полностью соответствуем требованиям GDPR и другим нормам конфиденциальности.",
                    }
                ],
                quickActions: [
                    "Оплата",
                    "Аккаунт",
                    "Технические вопросы"
                ],
                input: {
                    needHelpWith: 'Мне нужна помощь с',
                    placeholder: "Введите сообщение...",
                    send: "Отправить"
                },
                replyTime: "Обычно мы отвечаем в течение нескольких минут"
            },
            chatDropdown: {
                rename: "Переименовать",
                star: "Избранное",
                unstar: "Убрать из избр.",
                delete: "Удалить чат",
                renamePlaceholder: "Введите новое имя..."
            },
            messageBubble: {
                states: {
                    thinking: "Обдумываю",
                    working: "Работаю",
                    done: "Готово"
                },
                badges: {
                    thoughtForMoment: "Обдумывал некоторое время",
                    thoughtForSeconds: "Обдумывал {{seconds}} секунд"
                },
                details: {
                    thinkingTitle: "Обдумываю",
                    thinkingDescription: "Проанализировал ваш запрос и спланировал структуру ответа",
                    workingTitle: "Работаю",
                    workingDescription: "Сгенерировал ответ с релевантной информацией",
                    doneTitle: "Готово",
                    doneDescription: "Ответ завершён и готов"
                },
                editing: {
                    warning: "Редактирование этого сообщения удалит ранее написанное, поэтому убедитесь, что понимаете последствия.",
                    cancel: "Отмена",
                    save: "Сохранить"
                },
                retry: {
                    title: "Повторить",
                    message: "Что-то пошло не так, хотите попробовать снова?"
                },
                actions: {
                    copy: "Копировать",
                    edit: "Редактировать",
                    like: "Поставить положительную оценку",
                    dislike: "Поставить отрицательную оценку"
                },
                copied: "Скопировано",
                timestamp: "Отправлено в {{time}}",
                saving: "Сохранение",
                saved: "Сохранено"
            },
            messageFeedback: {
                title: {
                    positive: "Оставить положительный отзыв",
                    negative: "Оставить отрицательный отзыв"
                },
                negativeIssueLabel: "Какую проблему вы хотите сообщить? (необязательно)",
                negativeIssueSelect: "Выберите...",
                detailsLabel: "Пожалуйста, укажите детали: (необязательно)",
                detailsPlaceholder: {
                    positive: "Что было удовлетворительным в этом ответе?",
                    negative: "Что было неудовлетворительным в этом ответе?"
                },
                note: "Отправка этого отчёта передаст всю текущую переписку в компанию Selene для будущего улучшения наших моделей.",
                learnMore: "Подробнее",
                buttons: {
                    submit: "Отправить",
                    submitting: "Отправка...",
                    cancel: "Отмена"
                },
                negativeIssues: [
                    "Ошибка интерфейса (UI баг)",
                    "Чрезмерный отказ",
                    "Плохое понимание изображений",
                    "Не полностью выполнил мой запрос",
                    "Фактически неверный ответ",
                    "Неполный ответ",
                    "Следовало выполнить поиск в интернете",
                    "Сообщить о содержании",
                    "Не соответствует Конституции Selene",
                    "Другое"
                ]
            }
        }
    }
}