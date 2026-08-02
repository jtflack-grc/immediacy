import { Achievement } from '../utils/achievements'

interface AchievementBadgeProps {
  achievement: Achievement
  unlocked?: boolean
}

export default function AchievementBadge({ achievement, unlocked = true }: AchievementBadgeProps) {
  const borderColor = unlocked ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)'
  const iconBorderColor = unlocked ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)'
  
  return (
    <div style={{
      padding: '12px',
      backgroundColor: unlocked ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
      borderRadius: '8px',
      border: '1px solid ' + borderColor,
      opacity: unlocked ? 1 : 0.5,
      transition: 'all 0.2s',
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    }}>
      {achievement.icon && (
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          border: '2px solid ' + iconBorderColor,
          boxShadow: unlocked ? '0 2px 8px rgba(255, 255, 255, 0.1)' : 'none'
        }}>
          <img 
            src={achievement.icon} 
            alt={achievement.name}
            loading="lazy"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              filter: unlocked ? 'brightness(1.05) contrast(1.1)' : 'grayscale(1) brightness(0.4)'
            }}
            onError={(e) => {
              // Fallback to first letter if image fails
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: unlocked ? '#fff' : '#888',
          marginBottom: '4px'
        }}>
          {achievement.name}
        </div>
        <div style={{
          fontSize: '12px',
          color: unlocked ? '#aaa' : '#666',
          lineHeight: '1.4'
        }}>
          {achievement.description}
        </div>
      </div>
    </div>
  )
}
