from arrow import get, utcnow

async def get_last_response(last_response: int, language_code: str) -> str:
    if last_response == 0:
        return 'Never' if language_code == 'en' else 'Никогда'

    utc = utcnow()
    a = get(last_response)

    return a.humanize(utc, locale=language_code)