import { useTranslation } from "../../node_modules/react-i18next";

export const useGreetings = () => {
  const { i18n } = useTranslation()

  const greetings = i18n.resolvedLanguage === 'ru' ? {
    morning: [
      (username: string) => `Доброе утро, ${username} — пусть твой день начнётся ярко`,
      (username: string) => `Просыпайся, ${username}! Сделаем этот день продуктивным.`
    ],
    afternoon: [
      (username: string) => `Добрый день, ${username} — как проходит твой день?`,
      (username: string) => `Полдень, ${username} — отличное время для разговора`
    ],
    evening: [
      (username: string) => `Добрый вечер, ${username} — отдыхаешь или всё ещё в работе?`,
      (username: string) => `Вечерний свет, ${username} — давай пообщаемся`
    ],
    night: [
      (username: string) => `Поздний час, ${username} — я рядом, если нужен.`,
      (username: string) => `Тихая ночь, ${username} — идеальный момент для пары мыслей.`
    ]
  } : {
    morning: [
      (username: string) => `Good morning, ${username} — hope your day starts bright`,
      (username: string) => `Rise and shine, ${username}! Let’s make today productive.`
    ],
    afternoon: [
      (username: string) => `Good afternoon, ${username} — how’s your day going?`,
      (username: string) => `Midday vibes, ${username} — perfect time to chat`
    ],
    evening: [
      (username: string) => `Good evening, ${username} — winding down or still going strong?`,
      (username: string) => `Evening glow, ${username} — let’s catch up`
    ],
    night: [
      (username: string) => `Late hours, ${username} — I’m here if you need me.`,
      (username: string) => `Quiet night, ${username} — perfect moment for a thought or two.`
    ]
  }

  function getGreeting(username: string) {
    const hour = new Date().getHours();
    let period: keyof typeof greetings;

    if (hour >= 5 && hour < 12) period = "morning";
    else if (hour >= 12 && hour < 17) period = "afternoon";
    else if (hour >= 17 && hour < 22) period = "evening";
    else period = "night";

    const options = greetings[period];
    const random = options[Math.floor(Math.random() * options.length)];
    return random(username);
  }

  return { getGreeting: getGreeting, greetings: greetings }
}