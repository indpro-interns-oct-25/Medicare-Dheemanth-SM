import './Avatar.css';

const Avatar = ({ name, size = 'medium', className = '' }) => {
  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // Generate consistent color based on name
  const getColorFromName = (name) => {
    if (!name) return '#5B73E8';
    
    const colors = [
      '#5B73E8', // Blue
      '#10B981', // Green
      '#F59E0B', // Orange
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#14B8A6', // Teal
      '#F97316', // Deep Orange
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);
  
  const sizeClass = `avatar-${size}`;

  return (
    <div 
      className={`avatar ${sizeClass} ${className}`}
      style={{ backgroundColor }}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;
