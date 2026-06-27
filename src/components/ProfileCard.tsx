import type { MonitoredPerson, Household } from '../types'

interface Props {
  person: MonitoredPerson
  household: Household
}

function displayName(person: MonitoredPerson): string {
  const full = [person.first_name, person.last_name].filter(Boolean).join(' ')
  return full || person.nickname || person.email || ''
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
}

export default function ProfileCard({ person, household }: Props) {
  const name = displayName(person)
  return (
    <div className="mx-4 mb-4 p-5 rounded-2xl bg-[#1a1a24] dark:bg-[#1a1a24] shadow-lg">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-brand-teal flex items-center justify-center flex-shrink-0 overflow-hidden">
          {person.avatar_url
            ? <img src={person.avatar_url} alt="" className="w-full h-full object-cover" />
            : <span className="text-white font-bold text-xl">{initials(name)}</span>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-xl leading-tight truncate">{name}</h2>
          <p className="text-gray-400 text-sm mt-0.5">{household.name}</p>
          {person.notes && (
            <p className="text-gray-400 text-xs mt-1 truncate">{person.notes}</p>
          )}
        </div>
      </div>

      {/* Telefoon */}
      {person.phone_number_e164 && (
        <a
          href={`tel:${person.phone_number_e164}`}
          className="mt-4 flex items-center gap-2 text-brand-teal text-sm font-medium"
        >
          <span>📞</span>
          <span>{person.phone_number_e164}</span>
        </a>
      )}
    </div>
  )
}
