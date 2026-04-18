export default function DefaultAvatar({ username }: { username: string }) {
    return (
        <div className="flex shrink-0 uppercase items-center justify-center rounded-full font-semibold select-none h-8 w-8 text-[14px] bg-[var(--color-base-text)] text-[var(--color-base-400)]">
            {username.at(0)}
        </div>
    )
}