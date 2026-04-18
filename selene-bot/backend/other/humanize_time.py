from arrow import get, utcnow

def get_humanized_time(time: int) -> str:
    if time == 0:
        return 'Never'

    utc = utcnow()
    a = get(time)

    return a.humanize(utc)